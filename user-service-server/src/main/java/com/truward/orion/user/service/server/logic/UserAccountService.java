package com.truward.orion.user.service.server.logic;

import com.truward.orion.user.service.model.UserModel;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.security.SecureRandom;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * @author Alexander Shabanov
 */
public final class UserAccountService {

  public interface Contract {

    @Nonnull
    UserModel.UserAccount getAccountById(long id);

    @Nonnull
    UserModel.ListAccountsResponse getAccounts(@Nullable String offsetToken, int limit);

    @Nullable
    UserModel.UserAccount findAccount(@Nonnull String username, boolean includeContacts);

    long registerAccount(@Nonnull UserModel.RegisterAccountRequest request);

    void updateAccount(@Nonnull UserModel.UpdateAccountRequest request);

    void deleteAccounts(@Nonnull List<Long> userIds);

    @Nonnull
    List<String> createInvitationTokens(@Nonnull List<String> authorities, int count, @Nullable Long expirationTime);

    void cleanExpiredTokens(long now);

    boolean checkAccountPresence(@Nonnull String nickname, @Nonnull List<UserModel.Contact> contacts);
  }

  @Transactional
  public static final class Impl implements Contract {
    private static final int MAX_LIMIT = 64;

    private final JdbcOperations db;

    public Impl(JdbcOperations jdbcOperations) {
      this.db = Objects.requireNonNull(jdbcOperations, "jdbcOperations");
    }

    @Nonnull
    @Override
    @Transactional(readOnly = true)
    public UserModel.UserAccount getAccountById(long id) {
      final List<UserModel.UserAccount> accounts = fetchList(db,
          db.query("SELECT id, nickname, password_hash, created, active " +
                  "FROM user_profile WHERE id=?",
              UserAccountBuilderRowMapper.INSTANCE, id));
      if (accounts.isEmpty()) {
        throw new EmptyResultDataAccessException(1);
      }

      return accounts.get(0);
    }

    @Nonnull
    @Override
    @Transactional(readOnly = true)
    public UserModel.ListAccountsResponse getAccounts(@Nullable String offsetToken, int limit) {
      if (limit < 0 || limit > MAX_LIMIT) {
        throw new IllegalArgumentException("limit is negative or too big");
      }

      final Long tokenId = tokenToLong(offsetToken);
      final List<UserModel.UserAccount> accounts = fetchList(db,
          db.query("SELECT id, nickname, password_hash, created, active " +
                  "FROM user_profile WHERE ((? IS NULL) OR (id>?)) ORDER BY id ASC LIMIT ?",
              UserAccountBuilderRowMapper.INSTANCE, tokenId, tokenId, limit));

      final UserModel.ListAccountsResponse.Builder builder = UserModel.ListAccountsResponse.newBuilder();

      // calc new token
      if (accounts.size() == limit && limit > 0) {
        builder.setOffsetToken(Long.toHexString(accounts.get(limit - 1).getId()));
      }

      return builder.addAllAccounts(accounts).build();
    }

    @Nullable
    @Override
    public UserModel.UserAccount findAccount(@Nonnull String username, boolean includeContacts) {
      final List<UserModel.UserAccount.Builder> builders = db.query(
          "SELECT id, nickname, password_hash, created, active FROM user_profile " +
              "WHERE nickname=?",
          UserAccountBuilderRowMapper.INSTANCE, username);

      if (builders.isEmpty()) {
        return null;
      }

      assert builders.size() == 1;
      return fetchAccountData(db, builders.get(0), includeContacts);
    }

    @Override
    public long registerAccount(@Nonnull UserModel.RegisterAccountRequest request) {
      if (!StringUtils.hasLength(request.getInvitationToken())) {
        throw new UnsupportedOperationException("Non-invitation token registration is not supported yet");
      }

      // check invitation token
      final String invitationToken = request.getInvitationToken();
      final List<Long> tokenIds = db.queryForList("SELECT id FROM invitation_token WHERE code=?",
          Long.class, invitationToken);
      if (tokenIds.isEmpty()) {
        throw new IllegalStateException("Invalid or expired tokenId");
      }

      // fetch role IDs from token
      assert tokenIds.size() == 1;
      final long tokenId = tokenIds.get(0);
      final List<Long> tokenAuthorityIds = db.queryForList(
          "SELECT role_id FROM invitation_token_authorities WHERE token_id=?", Long.class, tokenId);

      // insert profile
      final long id = db.queryForObject("SELECT seq_user_profile.nextval", Long.class);
      db.update("INSERT INTO user_profile (id, nickname, password_hash, created, active) VALUES (?, ?, ?, ?, 1)",
          id, request.getNickname(), request.getPasswordHash(), new Date());

      // prepare role IDs
      final Set<Long> roleIds = new HashSet<>(tokenAuthorityIds);
      roleIds.addAll(request.getAuthoritiesList().stream().map(role -> getOrInsertRole(db, role))
          .collect(Collectors.toList()));

      // insert role IDs
      for (final Long roleId : roleIds) {
        db.update("INSERT INTO user_role (user_id, role_id) VALUES (?, ?)", id, roleId);
      }

      insertContacts(db, id, request.getContactsList());

      return id;
    }

    @Override
    public void updateAccount(@Nonnull UserModel.UpdateAccountRequest request) {
      db.update("UPDATE user_profile SET nickname=?, password_hash=?, active=? WHERE id=?", request.getNickname(),
          request.getPasswordHash(), request.getActive() ? 1 : 0, request.getUserId());

      // delete contacts and reinsert contacts
      db.update("DELETE FROM user_contact WHERE user_id=?", request.getUserId());
      insertContacts(db, request.getUserId(), request.getContactsList());

      // delete and insert roles
      db.update("DELETE FROM user_role WHERE user_id=?", request.getUserId());
      for (final String role : request.getAuthoritiesList()) {
        db.update("INSERT INTO user_role (user_id, role_id) VALUES (?, ?)", request.getUserId(),
            getOrInsertRole(db, role));
      }
    }

    @Override
    public void deleteAccounts(@Nonnull List<Long> userIds) {
      for (long id : userIds) {
        db.update("DELETE FROM user_profile WHERE id=?", id);
      }
    }

    @Nonnull
    @Override
    public List<String> createInvitationTokens(@Nonnull List<String> authorities, int count, @Nullable Long expirationTime) {
      final Date expiration = expirationTime != null ? new Date(expirationTime) :
          new Date(System.currentTimeMillis() + TimeUnit.DAYS.toMillis(64));

      final List<String> codes = new ArrayList<>(count);
      final Random random = new SecureRandom();
      for (int i = 0; i < count; ++i) {
        final String code = generateCode(random);
        codes.add(code);

        final long id = db.queryForObject("SELECT seq_invitation_token.nextval", Long.class);

        db.update("INSERT INTO invitation_token (id, code, expiration) VALUES (?, ?, ?)", id, code, expiration);

        for (final String role : authorities) {
          db.update("INSERT INTO invitation_token_authorities (token_id, role_id) " +
              "VALUES (?, ?)", id, getOrInsertRole(db, role));
        }
      }

      return codes;
    }

    @Override
    public void cleanExpiredTokens(long now) {
      db.update("DELETE FROM invitation_token WHERE expiration<?", new Date(now));
    }

    @Override
    public boolean checkAccountPresence(@Nonnull String nickname, @Nonnull List<UserModel.Contact> contacts) {
      if (db.queryForObject("SELECT COUNT(0) FROM user_profile WHERE nickname=?", Integer.class, nickname) > 0) {
        return true;
      }

      if (!contacts.isEmpty()) {
        throw new UnsupportedOperationException("contacts list is not supported");
      }

      return false;
    }
  }

  //
  // Private
  //

  private static void insertContacts(@Nonnull JdbcOperations db, long userId,
                                     @Nonnull List<UserModel.Contact> contacts) {
    for (final UserModel.Contact contact : contacts) {
      db.update("INSERT INTO user_contact (user_id, contact_type_id, contact_val) VALUES (?, ?, ?)",
          userId, toInt(contact.getType()), contact.getNumber());
    }
  }

  private static int toInt(@Nonnull UserModel.ContactType contactType) {
    switch (contactType) {
      case EMAIL:
        return 1;

      case PHONE:
        return 2;

      default:
        throw new IllegalArgumentException("Unknown contactType=" + contactType);
    }
  }

  private static long getOrInsertRole(@Nonnull JdbcOperations db, @Nonnull String roleName) {
    final List<Long> ids = db.queryForList("SELECT id FROM role WHERE role_name=?", Long.class, roleName);
    if (!ids.isEmpty()) {
      assert ids.size() == 1;
      return ids.get(0);
    }

    final long id = db.queryForObject("SELECT seq_role.nextval", Long.class);
    db.update("INSERT INTO role (id, role_name) VALUES (?, ?)", id, roleName);
    return id;
  }

  private static final String INVITATION_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static final int INVITATION_CODE_SIZE = 8;

  @Nonnull
  private static String generateCode(@Nonnull Random random) {
    final char[] ch = new char[INVITATION_CODE_SIZE];
    for (int i = 0; i < INVITATION_CODE_SIZE; ++i) {
      ch[i] = INVITATION_CODE_CHARS.charAt(random.nextInt(INVITATION_CODE_CHARS.length()));
    }
    return new String(ch);
  }

  @Nullable
  private static Long tokenToLong(@Nullable String offsetToken) {
    if (offsetToken == null) {
      return null;
    }

    try {
      return Long.parseLong(offsetToken, 16);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("offsetToken", e);
    }
  }

  private static final class UserAccountBuilderRowMapper implements RowMapper<UserModel.UserAccount.Builder> {
    static final UserAccountBuilderRowMapper INSTANCE = new UserAccountBuilderRowMapper();

    @Override
    public UserModel.UserAccount.Builder mapRow(ResultSet rs, int rowNum) throws SQLException {
      return UserModel.UserAccount.newBuilder()
          .setId(rs.getLong("id"))
          .setNickname(rs.getString("nickname"))
          .setPasswordHash(rs.getString("password_hash"))
          .setCreated(rs.getTimestamp("created").getTime())
          .setActive(rs.getInt("active") == 1);
    }
  }

  private static final class ContactRowMapper implements RowMapper<UserModel.Contact> {
    static final ContactRowMapper INSTANCE = new ContactRowMapper();

    @Override
    public UserModel.Contact mapRow(ResultSet rs, int rowNum) throws SQLException {
      return UserModel.Contact.newBuilder()
          .setNumber(rs.getString("contact_val"))
          .setType(toContactType(rs.getInt("contact_type_id")))
          .build();
    }
  }

  @Nonnull
  private static UserModel.ContactType toContactType(int val) {
    switch (val) {
      case 1: return UserModel.ContactType.EMAIL;
      case 2: return UserModel.ContactType.PHONE;
      default:
        throw new IllegalArgumentException("Unknown contact value=" + val);
    }
  }

  @Nonnull
  private static List<UserModel.UserAccount> fetchList(@Nonnull JdbcOperations db,
                                                       @Nonnull List<UserModel.UserAccount.Builder> builders) {
    return builders.stream().map(builder -> fetchAccountData(db, builder, true)).collect(Collectors.toList());
  }

  @Nonnull
  private static UserModel.UserAccount fetchAccountData(@Nonnull JdbcOperations db,
                                                        @Nonnull UserModel.UserAccount.Builder builder,
                                                        boolean includeContacts) {
    final long id = builder.getId();

    // TODO: get from local cache
    builder.addAllAuthorities(db.queryForList("SELECT DISTINCT r.role_name FROM role r " +
            "INNER JOIN user_role ur ON r.id=ur.role_id WHERE ur.user_id=? ORDER BY r.role_name",
        String.class, id));

    if (includeContacts) {
      builder.addAllContacts(db.query("SELECT contact_val, contact_type_id FROM user_contact WHERE user_id=? " +
          "ORDER BY contact_type_id,contact_val", ContactRowMapper.INSTANCE, id));
    }

    return builder.build();
  }

  private UserAccountService() {} // hidden
}
