var React = require('react');

var START = "start";
var EDITING = "editing";
var RESULT_RECEIVED = "result_received";

module.exports = React.createClass({
  getInitialState: function() {
    return {
      mode: START,
      password: "",
      confirmedPassword: "",
      encodedPassword: "",
      error: null
    };
  },

  passwordChanged: function(event) {
    var value = event.target.value;
    this.setState({mode: EDITING, password: value, encodedPassword: "", error: null});
  },

  confirmPasswordChanged: function(event) {
    var value = event.target.value;
    this.setState({mode: EDITING, confirmedPassword: value, encodedPassword: "", error: null});
  },

  encodePassword: function() {
    var password = this.state.password;
    if (password.length === 0) {
      this.setState({error: "Password can't be empty"});
      return;
    }

    var confirmedPassword = this.state.confirmedPassword;
    if (password !== confirmedPassword) {
      this.setState({error: "Passwords are not matching each other"});
      return;
    }

    var promise = this.props.services.passwordService.encode(this.state.password);
    promise.then(function (encodedValue) {
      this.setState({mode: RESULT_RECEIVED, encodedPassword: encodedValue, error: null});
    }.bind(this));
  },

  render: function() {
    var encodedPassword = this.state.encodedPassword;
    if (this.state.mode === START) {
      encodedPassword = "No password";
    }

    var errorMessage;
    if (this.state.error != null) {
      errorMessage = (<div className="alert alert-danger" role="alert"><strong>Error:</strong>{this.state.error}</div>);
    } else {
      errorMessage = (<div></div>);
    }

    return (
      <div className="container">
        <fieldset className="form-horizontal">
          <div id="legend">
            <legend>Encode Password</legend>
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="password">Password</label>
            <div className="controls">
              <input type="password" id="password" name="password" placeholder=""
                     className="input-xlarge" size="32" onChange={this.passwordChanged} />
              <p className="help-block">Plain text password</p>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label"  htmlFor="password-confirm">Password (Confirm)</label>
            <div className="controls">
              <input type="password" id="password-confirm" name="password-confirm" placeholder=""
                     className="input-xlarge" size="32" onChange={this.confirmPasswordChanged} />
              <p className="help-block">Please confirm password</p>
            </div>
          </div>

          <div className="control-group">
            <div className="controls">
              <button className="btn btn-success" onClick={this.encodePassword}>Encode</button>
            </div>
          </div>
        </fieldset>
        <hr/>
        {errorMessage}
        <h3>Result</h3>
        <input value={encodedPassword} size="64" readOnly="true" />
      </div>
    );
  }
});

