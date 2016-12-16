package com.truward.orion.user.service.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Objects;

/**
 * @author Alexander Shabanov
 */
@Controller
@RequestMapping("/api/password/v1")
public final class PasswordRestController {
  private final PasswordEncoder passwordEncoder;

  @Autowired
  public PasswordRestController(PasswordEncoder passwordEncoder) {
    this.passwordEncoder = Objects.requireNonNull(passwordEncoder);
  }

  @RequestMapping(value = "/encode", method = RequestMethod.POST)
  @ResponseBody
  public String encode(@RequestBody String password) {
    return passwordEncoder.encode(password);
  }
}
