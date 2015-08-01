var React = require('React');

var LOADING = 1;
var UPDATE = 2;
var PREVIEW = 3;
var NO_SUCH_USER = 4;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      mode: LOADING,
      message: null
    };
  },

  fetchUserAccount: function (props) {
    console.log("[fetchUserAccount] props", props, "this", this);

    this.setState({mode: LOADING, account: null, message: props.message || null});

    var userId = props.userId;
    if (userId === undefined) {
      // new account
      console.log("new account");
      this.setState({mode: UPDATE, account: {
        "nickname": "PLACEHOLDER",
        "authorities": ["ROLE_GENERIC_USER"],
        "passwordHash": "$2a$10$sXzxlQERgHT0zJ9SfRgVjOufKaKUxlUwjoG6EXn81BMkg81BrYy1S", // test
        "invitationToken": ""
      }});

      var tokenPromise = props.services.userService.generateTokens(1);
      tokenPromise.then(function (result) {
        var account = this.state.account;
        account["invitationToken"] = result["invitationTokens"][0];
        this.setState({mode: UPDATE, account: account});
      }.bind(this));
    } else {
      // existing account
      console.log("existing account");
      var promise = props.services.userService.getAccountById(userId);
      promise.then(function (account) {
        this.setState({mode: UPDATE, account: account});
      }.bind(this), function () {
        this.setState({mode: NO_SUCH_USER, account: null});
      }.bind(this));
    }
  },

  componentDidMount: function() {
    this.fetchUserAccount(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    this.fetchUserAccount(nextProps);
  },

  getFormTitle: function () {
    var mode = this.props.userUpdateMode;
    if (mode === "CREATE") {
      return "Create New Account";
    } else if (mode == "UPDATE") {
      return "Update Account";
    } else if (mode != "CLONE") {
      console.error("Unknown mode", this.props);
    }

    return "Clone Account";
  },

  onPreviewClick: function() {
    this.setState({mode: PREVIEW, message: null});
  },

  onSaveClick: function() {
    var account = this.state.account;

    if (account["id"]) {
      var promise = this.props.services.userService.updateAccount(account);
      this.setState({mode: LOADING});
      promise.then(function () {
        this.setState({mode: UPDATE, message: {info: "Update Succeeded"}});
      }.bind(this), function () {
        this.setState({mode: UPDATE, message: {error: "Update Failed"}});
      }.bind(this));
    } else {
      var promise = this.props.services.userService.registerAccount(account);
      this.setState({mode: LOADING});
      promise.then(function (registrationResponse) {
        var userId = registrationResponse["userId"];
        var msg = "Registration Succeeded: New user with id=" + userId + " has been created";
        console.log("userId", userId, "msg", msg);
        this.fetchUserAccount({userId: userId, message: {info: msg}, services: this.props.services});
      }.bind(this), function () {
        this.setState({mode: UPDATE, message: {error: "Registration Failed"}});
      }.bind(this));
    }
  },

  changeAccountValue: function(value, fieldName, transformFn) {
    var account = this.state.account;
    account[fieldName] = transformFn(value);
    this.setState({account: account});
  },

  passwordHashChanged: function(event) {
    this.changeAccountValue(event.target.value, "passwordHash", function (value) { return value; });
  },

  nicknameChanged: function(event) {
    this.changeAccountValue(event.target.value, "nickname", function (value) { return value; });
  },

  authoritiesChanged: function(event) {
    this.changeAccountValue(event.target.value, "authorities", function (value) {
      return value.split(",").map(function (x) { return x.trim(); });
    });
  },

  activeModeChanged: function(event) {
    this.changeAccountValue(event.target.checked, "active", function (value) { return value; });
  },

  invitationTokenChanged: function(event) {
    this.changeAccountValue(event.target.value, "invitationToken", function (value) { return value; });
  },

  renderUpdateAccountPage: function() {
    var account = this.state.account;

    var nickname = ((account == null) ? "" : account["nickname"]);
    var roleStr = "";
    this.state.account["authorities"].map(function (role) {
      roleStr += (roleStr.length > 0 ? ", " : "") + role;
    });
    var passwordHash = ((account == null) ? "" : account["passwordHash"]);


    // IsActive flag or InvitationToken
    var accountEditorTail;
    if ("invitationToken" in account) {
      // new account
      accountEditorTail = (
        <div className="control-group">
          <label className="control-label"  htmlFor="invitation-token">Invitation Token</label>
          <div className="controls">
            <input type="text" id="invitation-token" name="invitation-token" className="input-xlarge"
                   onChange={this.invitationTokenChanged}
                   value={account["invitationToken"]} size="48" />
            <p className="help-block">Invitation Token, without space</p>
          </div>
        </div>
      );
    } else {
      // existing account
      var isActive = account["active"];
      accountEditorTail = (
        <div className="control-group">
          <div className="controls">
            <input type="checkbox" id="active" name="active" className="input-xlarge" defaultChecked={isActive}
                   onChange={this.activeModeChanged} />
            <span>&nbsp;Is Account Active?</span><br/>
          </div>
        </div>
      );
    }

    var message;
    if (this.state.message !== null) {
      if (this.state.message.info) {
        message = (
          <div className="alert alert-success" role="alert">
            <strong>Info:</strong>{this.state.message.info}
          </div>
        );
      } else if (this.state.message.error) {
        message = (
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong>{this.state.message.error}
          </div>
        );
      }
    } else {
      message = (<div/>);
    }

    return (
      <div className="container">
        {message}
        <fieldset>
          <div id="legend">
            <legend>Create New Account</legend>
          </div>

          <div className="control-group">
            <label className="control-label"  htmlFor="nickname">Nickname</label>
            <div className="controls">
              <input type="text" id="nickname" name="nickname" placeholder="" className="input-xlarge"
                     onChange={this.nicknameChanged}
                     defaultValue={nickname} size="48" />
              <p className="help-block">Nickname can contain any letters or numbers, without spaces</p>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="roles">Roles</label>
            <div className="controls">
              <input type="text" id="roles" name="roles" placeholder="" className="input-xlarge"
                     onChange={this.authoritiesChanged} defaultValue={roleStr} size="48" />
              <p className="help-block">Authorities also known as roles</p>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="password-hash">Password Hash</label>
            <div className="controls">
              <input type="text" id="password-hash" name="text" placeholder="" onChange={this.passwordHashChanged}
                     className="input-xlarge" defaultValue={passwordHash} size="48" />
              <p className="help-block">This field should never contain password in plain text</p>
            </div>
          </div>

          {accountEditorTail}
          <hr/>

          <div className="control-group">
            <div className="controls">
              <button className="btn btn-success" onClick={this.onPreviewClick}>Preview</button>
            </div>
          </div>
        </fieldset>
      </div>
    );
  },

  renderPreviewAccountPage: function() {
    var account = this.state.account;

    var id = account["id"] || "<NONE>";
    var nickname = ((account == null) ? "" : account["nickname"]);
    var roleStr = "";
    this.state.account["authorities"].map(function (role) {
      roleStr += (roleStr.length > 0 ? ", " : "") + role;
    });
    var passwordHash = ((account == null) ? "" : account["passwordHash"]);

    var accountPreviewTail;
    if ("invitationToken" in account) {
      // new account
      accountPreviewTail = (
        <tr>
          <td>Invitation Token</td>
          <td>{account["invitationToken"]}</td>
        </tr>
      );
    } else {
      // existing account
      var isActive = account["active"] ? "Yes" : "No";
      accountPreviewTail = (
        <tr>
          <td>Is Active?</td>
          <td>{isActive}</td>
        </tr>
      );
    }


    return (
      <div className="container">
        <table className="table">
          <thead>
            <th>Field Name</th>
            <th>Field Value</th>
          </thead>
          <tbody>
            <tr>
              <td>ID</td>
              <td>{id}</td>
            </tr>
            <tr>
              <td>Nickname</td>
              <td>{nickname}</td>
            </tr>
            <tr>
              <td>Roles</td>
              <td>{roleStr}</td>
            </tr>
            <tr>
              <td>Password Hash</td>
              <td>{passwordHash}</td>
            </tr>
            {accountPreviewTail}
          </tbody>
        </table>
        <hr/>
        <button className="btn btn-success" onClick={this.onSaveClick}>Save</button>
      </div>
    );
  },

  render: function() {
    if (this.state.mode === UPDATE) {
      return this.renderUpdateAccountPage();
    } else if (this.state.mode === PREVIEW) {
      return this.renderPreviewAccountPage();
    } else if (this.state.mode === NO_SUCH_USER) {
      return (
        <div className="alert alert-danger" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
          <span className="sr-only">Error:</span>
          <span>The user you are trying to update does not exist</span>
        </div>
      );
    }

    return (<p>Loading...</p>);
  }
});

