-- Fixture Data
-- NOTE: There should be no zero values assigned to 'id' fields.

INSERT INTO user_profile (id, nickname, password_hash, created, active)
  VALUES (20, 'alice', '$2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW', '2015-06-23', 1);
INSERT INTO user_role (user_id, role_id) VALUES (20, 2);

INSERT INTO user_profile (id, nickname, password_hash, created, active)
  VALUES (21, 'bob', '$2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW', '2015-06-25', 0);
INSERT INTO user_role (user_id, role_id) VALUES (21, 2);

INSERT INTO user_profile (id, nickname, password_hash, created, active)
  VALUES (22, 'admin', '$2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW', '2015-06-20', 1);
INSERT INTO user_role (user_id, role_id) VALUES (22, 1);
INSERT INTO user_role (user_id, role_id) VALUES (22, 2);

INSERT INTO invitation_token (id, code, expiration) VALUES (50, 'test_token', '2100-01-01');

COMMIT;

--
-- EOF
--
