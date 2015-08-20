package com.truward.orion.user.service.server;

import com.truward.brikar.server.launcher.StandardLauncher;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.util.resource.Resource;

import javax.annotation.Nonnull;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Entry point.
 *
 * @author Alexander Shabanov
 */
public final class UserServiceLauncher extends StandardLauncher {
  private final ResourceHandler resourceHandler;

  public UserServiceLauncher() throws Exception {
    super("classpath:/userService/");
    this.resourceHandler = createStaticHandler();

    setAuthPropertiesPrefix("userService.auth");
    setSimpleSecurityEnabled(!getPropertyResolver().getProperty("brikar.dev.disableSecurity", Boolean.class, true));
  }

  public static void main(String[] args) throws Exception {
    // TODO: remove (config logging in brikar)
    if (System.getProperty("logback.configurationFile") == null) {
      System.setProperty("logback.configurationFile", "default-service-logback.xml");
    }

    try (final UserServiceLauncher launcher = new UserServiceLauncher()) {
      launcher.start();
    }
  }

  @Nonnull
  @Override
  protected List<Handler> getHandlers() {
    final List<Handler> handlers = new ArrayList<>(super.getHandlers());
    handlers.add(resourceHandler);
    return handlers;
  }

  //
  // Private
  //

  @Nonnull
  private ResourceHandler createStaticHandler() throws IOException {
    final ResourceHandler resourceHandler = new ResourceHandler();

    final String overrideStaticPath = getPropertyResolver().getProperty("brikar.dev.overrideStaticPath");
    if (overrideStaticPath != null) {
      getLogger().info("Using override path for static resources: {}", overrideStaticPath);
      resourceHandler.setBaseResource(Resource.newResource(new File(overrideStaticPath)));
    } else {
      resourceHandler.setBaseResource(Resource.newClassPathResource("/userService/web"));
    }

    return resourceHandler;
  }
}
