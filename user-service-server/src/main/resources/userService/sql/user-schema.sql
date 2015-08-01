
-- User Profile
-- password 'test': $2a$10$W5YdtLrCN.3dH8hilF2queEvfJedIhzSEzszgcjJ8e/NrWBCURIUW
CREATE TABLE user_profile (
  id                INTEGER PRIMARY KEY,
  nickname          CHAR(32) NOT NULL,
  password_hash     CHAR(128) NOT NULL,
  created           TIMESTAMP NOT NULL,
  active            TINYINT NOT NULL, -- 0: inactive, 1: active
  CONSTRAINT uq_user_profile_nickname UNIQUE (nickname)
);

-- User Contacts (e.g. email)
CREATE TABLE user_contact (
  user_id           INTEGER NOT NULL,
  contact_type_id   INTEGER NOT NULL, -- 1: email, 2: mobile phone
  contact_val       CHAR(64) NOT NULL,
  CONSTRAINT pk_user_contact PRIMARY KEY (user_id, contact_type_id),
  CONSTRAINT fk_user_contact_user FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_contact UNIQUE (contact_type_id, contact_val)
);

-- Roles also known as authorities
CREATE TABLE role (
  id            INTEGER PRIMARY KEY,
  role_name     CHAR(32) NOT NULL,
  CONSTRAINT uq_role_name UNIQUE (role_name)
);

INSERT INTO role (id, role_name) VALUES (1, 'ROLE_ADMIN');
INSERT INTO role (id, role_name) VALUES (2, 'ROLE_GENERIC_USER');

-- User Roles
CREATE TABLE user_role (
  user_id       INTEGER NOT NULL,
  role_id       INTEGER NOT NULL,
  CONSTRAINT pk_user_role PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_role_user_id FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_role_role_id FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

--
-- Invitation Tokens
--

CREATE TABLE invitation_token (
  id            INTEGER PRIMARY KEY,
  code          CHAR(64) NOT NULL,
  expiration    TIMESTAMP NOT NULL,
  CONSTRAINT uq_invitation_token UNIQUE (code)
);

CREATE TABLE invitation_token_authorities (
  token_id      INTEGER NOT NULL,
  role_id       INTEGER NOT NULL,
  CONSTRAINT pk_invitation_token_authorities PRIMARY KEY (token_id, role_id),
  CONSTRAINT fk_invitation_token_authorities_token FOREIGN KEY (token_id)
    REFERENCES invitation_token(id) ON DELETE CASCADE,
  CONSTRAINT fk_invitation_token_authorities_role FOREIGN KEY (role_id)
    REFERENCES role(id) ON DELETE CASCADE
);


--
-- Sequences
--

CREATE SEQUENCE seq_role              START WITH 100;
CREATE SEQUENCE seq_user_profile      START WITH 1000;
CREATE SEQUENCE seq_invitation_token  START WITH 10000;
