var React = require('React');

var EDITING = "editing";
var RESULT_RECEIVED = "result_received";

module.exports = React.createClass({
  getInitialState: function() {
    return {
      mode: EDITING,
      count: 1,
      tokens: [],
      error: null
    };
  },

  countChanged: function(event) {
    var value = event.target.value;
    this.setState({mode: EDITING, count: parseInt(value), error: null});
  },

  generateTokens: function() {
    var count = this.state.count;
    if (isNaN(count) || (count <= 0)) {
      this.setState({error: "Count should be a positive number"});
      return;
    }

    var promise = this.props.services.userService.generateTokens(count);
    promise.then(function (response) {
      this.setState({mode: RESULT_RECEIVED, tokens: response["invitationTokens"], error: null});
    }.bind(this));
  },

  render: function() {
    var tokens = this.state.tokens.map(function (token) {
      return (<li key={token}>{token}</li>);
    });

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
            <legend>Generate Invitation Tokens</legend>
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="token-count">Count</label>
            <div className="controls">
              <input type="number" id="token-count" name="token-count" defaultValue="1"
                     className="input-xlarge" onChange={this.countChanged} />
              <p className="help-block">Count of generated invitation tokens</p>
            </div>
          </div>

          <div className="control-group">
            <div className="controls">
              <button className="btn btn-success" onClick={this.generateTokens}>Generate</button>
            </div>
          </div>
        </fieldset>
        <hr/>
        {errorMessage}
        <h3>Generated Tokens:</h3>
        <ul className="list-unstyled">{tokens}</ul>
      </div>
    );
  }
});

