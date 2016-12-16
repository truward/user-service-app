package com.truward.orion.user.service.server.controller;

import com.truward.orion.user.service.model.UserRestService;
import com.truward.orion.user.service.server.logic.UserAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Objects;

import static com.truward.orion.user.service.model.UserModelV1.*;

/**
 * Implementation of {@link UserRestService} that exposes major operations on user accounts.
 *
 * @author Alexander Shabanov
 */
@Controller
@RequestMapping("/api/user/v1")
public final class UserRestController implements UserRestService {
  private final UserAccountService.Contract userAccountService;

  @Autowired
  public UserRestController(UserAccountService.Contract userAccountService) {
    this.userAccountService = Objects.requireNonNull(userAccountService);
  }

  @Override
  public UserAccount getAccountById(@PathVariable("id") long id) {
    return userAccountService.getAccountById(id);
  }

  @Override
  public RegisterAccountResponse registerAccount(@RequestBody RegisterAccountRequest request) {
    userAccountService.cleanExpiredTokens(System.currentTimeMillis());
    return RegisterAccountResponse.newBuilder()
        .setUserId(userAccountService.registerAccount(request))
        .build();
  }

  @Override
  public UpdateAccountResponse updateAccount(@RequestBody UpdateAccountRequest request) {
    userAccountService.updateAccount(request);
    return UpdateAccountResponse.getDefaultInstance();
  }

  @Override
  public DeleteAccountsResponse deleteAccounts(@RequestBody DeleteAccountsRequest request) {
    userAccountService.deleteAccounts(request.getUserIdsList());
    return DeleteAccountsResponse.getDefaultInstance();
  }

  @Override
  public ListAccountsResponse getAccounts(@RequestBody ListAccountsRequest request) {
    final String offsetToken = StringUtils.hasLength(request.getOffsetToken()) ? request.getOffsetToken() : null;
    return userAccountService.getAccounts(offsetToken, request.getLimit());
  }

  @Override
  public AccountLookupResponse lookupAccount(@RequestBody AccountLookupRequest request) {
    final AccountLookupResponse.Builder builder = AccountLookupResponse.newBuilder();
    final UserAccount account = userAccountService.findAccount(request.getUsername(),
        request.getIncludeContacts());

    if (account != null) {
      builder.setAccount(account);
    }
    return builder.build();
  }

  @Override
  public AccountPresenceResponse checkAccountPresence(@RequestBody AccountPresenceRequest request) {
    return AccountPresenceResponse.newBuilder()
        .setExists(userAccountService.checkAccountPresence(request.getNickname(), request.getContactsList()))
        .build();
  }

  @Override
  public CreateInvitationTokensResponse createInvitationTokens(@RequestBody CreateInvitationTokensRequest request) {
    return CreateInvitationTokensResponse.newBuilder()
        .addAllInvitationTokens(userAccountService.createInvitationTokens(request.getAuthoritiesList(),
            request.getCount(), request.getExpirationTime() > 0 ? request.getExpirationTime() : null))
        .build();
  }
}
