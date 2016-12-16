package com.truward.orion.user.service.server;

import com.truward.orion.user.service.server.logic.UserAccountService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

import static com.truward.orion.user.service.model.UserModelV1.*;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "/spring/UserAccountServiceTest-context.xml")
@Transactional
public final class UserAccountServiceTest {

  @Resource
  private UserAccountService.Contract userAccountService;

  @Test
  public void shouldReturnAllAccounts() {
    final ListAccountsResponse res = userAccountService.getAccounts(null, 10);

    assertEquals("", res.getOffsetToken());
    assertEquals(3, res.getAccountsCount());
  }

  @Test
  public void shouldGetSameAccountsById() {
    final ListAccountsResponse res = userAccountService.getAccounts(null, 10);

    assertEquals("", res.getOffsetToken());
    assertEquals(3, res.getAccountsCount());

    for (final UserAccount account : res.getAccountsList()) {
      assertEquals(account, userAccountService.getAccountById(account.getId()));
    }
  }

  @Test
  public void shouldReturnPaginatedAccounts() {
    final List<String> tokens = userAccountService.createInvitationTokens(Collections.emptyList(), 2, null);
    int n = 0;
    for (final String token : tokens) {
      userAccountService.registerAccount(RegisterAccountRequest.newBuilder()
          .setInvitationToken(token)
          .setNickname("nickname" + (++n))
          .setPasswordHash("test")
          .build());
    }

    ListAccountsResponse res = userAccountService.getAccounts(null, 2);

    assertNotEquals("", res.getOffsetToken());
    assertEquals(2, res.getAccountsCount());

    res = userAccountService.getAccounts(res.getOffsetToken(), 2);
    assertNotEquals("", res.getOffsetToken());
    assertEquals(2, res.getAccountsCount());

    res = userAccountService.getAccounts(res.getOffsetToken(), 2);
    assertEquals("", res.getOffsetToken());
    assertEquals(1, res.getAccountsCount());
  }

  @Test
  public void shouldDeleteAccounts() {
    ListAccountsResponse res = userAccountService.getAccounts(null, 10);
    assertEquals("", res.getOffsetToken());
    final List<Long> ids = res.getAccountsList().stream().map(UserAccount::getId).collect(Collectors.toList());

    userAccountService.deleteAccounts(ids);

    res = userAccountService.getAccounts(null, 10);
    assertEquals(0, res.getAccountsCount());
    assertEquals("", res.getOffsetToken());
  }

  @Test
  public void shouldReturnExistingAccount() {
    final UserAccount res = userAccountService.findAccount("bob", true);

    assertNotNull(res);
  }

  @Test
  public void shouldNotReturnAccountForUnknownUsername() {
    final UserAccount res = userAccountService.findAccount("dave", true);

    assertNull(res);
  }

  @Test
  public void shouldCheckExistingAccountWithoutContacts() {
    assertTrue(userAccountService.checkAccountPresence("bob", Collections.emptyList()));
  }

  @Test
  public void shouldCheckNonexistingAccountsWithoutContacts() {
    assertFalse(userAccountService.checkAccountPresence("bob2", Collections.emptyList()));
  }

  @Test(expected = EmptyResultDataAccessException.class)
  public void shouldFailToFindNonExistentAccount() {
    userAccountService.getAccountById(-1);
  }

  @Test
  public void shouldRegisterAndUpdateAccount() {
    final String token = userAccountService.createInvitationTokens(Collections.emptyList(), 1, null).get(0);
    final RegisterAccountRequest regRequest = RegisterAccountRequest.newBuilder()
        .setNickname("nickname")
        .setPasswordHash("password")
        .setInvitationToken(token)
        .addAuthorities("ROLE_USER")
        .addContacts(Contact.newBuilder().setNumber("12345").setType(ContactType.PHONE).build())
        .build();
    // register account
    final long userId = userAccountService.registerAccount(regRequest);

    // fetch account
    UserAccount account = userAccountService.findAccount(regRequest.getNickname(), true);

    // verify registered account
    assertNotNull(account);
    assertEquals(UserAccount.newBuilder()
        .setActive(true)
        .setCreated(account.getCreated())
        .setId(userId)
        .setNickname(regRequest.getNickname())
        .setPasswordHash(regRequest.getPasswordHash())
        .addAllAuthorities(regRequest.getAuthoritiesList())
        .addAllContacts(regRequest.getContactsList())
        .build(), account);

    // update account
    final UpdateAccountRequest updateRequest = UpdateAccountRequest.newBuilder()
        .setUserId(userId)
        .setNickname("nickname2")
        .setPasswordHash("password2")
        .addAuthorities("ROLE_ADMIN")
        .setActive(false)
        .addContacts(Contact.newBuilder().setNumber("a@b.c").setType(ContactType.EMAIL).build())
        .build();
    userAccountService.updateAccount(updateRequest);

    // fetch account
    account = userAccountService.findAccount(updateRequest.getNickname(), true);

    // verify registered account
    assertNotNull(account);
    assertEquals(UserAccount.newBuilder()
        .setActive(updateRequest.getActive())
        .setCreated(account.getCreated())
        .setId(userId)
        .setNickname(updateRequest.getNickname())
        .setPasswordHash(updateRequest.getPasswordHash())
        .addAllAuthorities(updateRequest.getAuthoritiesList())
        .addAllContacts(updateRequest.getContactsList())
        .build(), account);

    // old account should no longer be discoverable
    assertNull(userAccountService.findAccount(regRequest.getNickname(), true));
    assertEquals(account, userAccountService.getAccountById(account.getId()));
  }
}
