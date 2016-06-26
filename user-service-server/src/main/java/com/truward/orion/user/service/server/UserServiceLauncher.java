package com.truward.orion.user.service.server;

import com.truward.brikar.server.launcher.StandardLauncher;

/**
 * Entry point.
 *
 * @author Alexander Shabanov
 */
public final class UserServiceLauncher {

  public static void main(String[] args) throws Exception {
    try (StandardLauncher launcher = new StandardLauncher("classpath:/userService/")) {
      launcher
          .setSimpleSecurityEnabled(true)
          .setAuthPropertiesPrefix("userService.auth")
          .setStaticHandlerEnabled(true)
          .start();
    }
  }
}
