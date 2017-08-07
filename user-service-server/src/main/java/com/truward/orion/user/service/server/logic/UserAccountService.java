package com.truward.orion.user.service.server.logic;

import javax.annotation.Nullable;
import javax.annotation.ParametersAreNonnullByDefault;
import java.util.List;

import static com.truward.orion.user.service.model.UserModelV1.*;

/**
 * @author Alexander Shabanov
 */
@ParametersAreNonnullByDefault
public interface UserAccountService {
  UserAccount getAccountById(long id);

  ListAccountsResponse getAccounts(@Nullable String offsetToken, int limit);

  @Nullable
  UserAccount findAccount(String username, boolean includeContacts);

  long registerAccount(RegisterAccountRequest request);

  void updateAccount(UpdateAccountRequest request);

  void deleteAccounts(List<Long> userIds);

  List<String> createInvitationTokens(List<String> authorities, int count, @Nullable Long expirationTime);

  void cleanExpiredTokens(long now);

  boolean checkAccountPresence(String nickname, List<Contact> contacts);
}
