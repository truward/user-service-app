package com.truward.orion.user.service.server.controller;

import com.truward.orion.user.service.model.UserModel;
import com.truward.orion.user.service.model.UserRestService;
import com.truward.orion.user.service.server.logic.UserAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Objects;

/**
 * Implementation of {@link UserRestService} that exposes major operations on user accounts.
 *
 * @author Alexander Shabanov
 */
@Controller
@RequestMapping("/rest/user")
public final class UserRestController implements UserRestService {
  private final UserAccountService.Contract userAccountService;

  @Autowired
  public UserRestController(UserAccountService.Contract userAccountService) {
    this.userAccountService = Objects.requireNonNull(userAccountService);
  }

  @Override
  public UserModel.UserAccount getAccountById(@PathVariable("id") long id) {
    return userAccountService.getAccountById(id);
  }

  @Override
  public UserModel.RegisterAccountResponse registerAccount(@RequestBody UserModel.RegisterAccountRequest request) {
    userAccountService.cleanExpiredTokens(System.currentTimeMillis());
    return UserModel.RegisterAccountResponse.newBuilder()
        .setUserId(userAccountService.registerAccount(request))
        .build();
  }

  @Override
  public UserModel.UpdateAccountResponse updateAccount(@RequestBody UserModel.UpdateAccountRequest request) {
    userAccountService.updateAccount(request);
    return UserModel.UpdateAccountResponse.getDefaultInstance();
  }

  @Override
  public UserModel.DeleteAccountsResponse deleteAccounts(@RequestBody UserModel.DeleteAccountsRequest request) {
    userAccountService.deleteAccounts(request.getUserIdsList());
    return UserModel.DeleteAccountsResponse.getDefaultInstance();
  }

  @Override
  public UserModel.ListAccountsResponse getAccounts(@RequestBody UserModel.ListAccountsRequest request) {
    final String offsetToken = request.hasOffsetToken() ? request.getOffsetToken() : null;
    return userAccountService.getAccounts(offsetToken, request.getLimit());
  }

  @Override
  public UserModel.AccountLookupResponse lookupAccount(@RequestBody UserModel.AccountLookupRequest request) {
    final UserModel.AccountLookupResponse.Builder builder = UserModel.AccountLookupResponse.newBuilder();
    final UserModel.UserAccount account = userAccountService.findAccount(request.getUsername(),
        request.getIncludeContacts());

    if (account != null) {
      builder.setAccount(account);
    }
    return builder.build();
  }

  @Override
  public UserModel.AccountPresenceResponse checkAccountPresence(@RequestBody UserModel.AccountPresenceRequest request) {
    return UserModel.AccountPresenceResponse.newBuilder()
        .setExists(userAccountService.checkAccountPresence(request.getNickname(), request.getContactsList()))
        .build();
  }

  @Override
  public UserModel.CreateInvitationTokensResponse createInvitationTokens(@RequestBody UserModel.CreateInvitationTokensRequest request) {
    return UserModel.CreateInvitationTokensResponse.newBuilder()
        .addAllInvitationTokens(userAccountService.createInvitationTokens(request.getAuthoritiesList(),
            request.getCount(), request.hasExpirationTime() ? request.getExpirationTime() : null))
        .build();
  }
}
