package com.truward.orion.user.service.server;

import com.truward.orion.user.service.server.controller.UserRestController;
import com.truward.orion.user.service.server.logic.UserAccountService;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import static com.truward.orion.user.service.model.UserModelV1.*;

/**
 * @author Alexander Shabanov
 */
public class UserRestControllerTest {
  private UserAccountService userServiceMock;
  private UserRestController userController;

  @Before
  public void init() {
    userServiceMock = mock(UserAccountService.class);
    userController = new UserRestController(userServiceMock);
  }

  @Test
  public void shouldReturnEmptyAccount() {
    // Given:
    final String username = "username";
    when(userServiceMock.findAccount(username, false)).thenReturn(null);

    // When:
    final AccountLookupResponse lookupResponse = userController.lookupAccount(
        AccountLookupRequest.newBuilder()
            .setUsername(username)
            .build());

    // Then:
    assertNotNull(lookupResponse);
    assertFalse(lookupResponse.hasAccount());
  }
}
