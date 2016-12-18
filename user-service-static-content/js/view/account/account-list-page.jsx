var React = require('react');
var AccountTableItem = require("./account-table-item.js");

function fetchAccounts(offsetToken, limit) {
  var promise = this.props.services.userService.getAccounts(offsetToken, limit);

  promise.then(function (listAccountResult) {
    this.props.services.titleService.setTitle("Account List");
    this.setState({
      accounts: listAccountResult["accounts"], loading: false
    });
  }.bind(this));
}

/** AccountListPage */
module.exports = React.createClass({
  getInitialState: function() {
    return {loading: true};
  },

  componentDidMount: function() {
    fetchAccounts.call(this, this.props.offsetToken, this.props.limit);
  },

  componentWillReceiveProps: function(nextProps) {
    fetchAccounts.call(this, nextProps.offsetToken, nextProps.limit);
  },

  onCreateClick: function () {
    window.location.hash = "#/accounts/create";
  },

  onCloneAccount: function (account) {
    window.location.hash = "#/accounts/clone/" + account["id"];
  },

  onUpdateAccount: function (account) {
    window.location.hash = "#/accounts/update/" + account["id"];
  },

  onDeleteAccount: function (account) {
    var userId = account["id"];
    var promise = this.props.services.userService.deleteAccount(userId);
    // fetch accounts once delete request completed
    promise.then(function () {
      fetchAccounts.call(this, this.props.offsetToken, this.props.limit);
    }.bind(this));
  },

  render: function() {
    if (this.state.loading) {
      return (
        <div className="container">
          <p>Loading Accounts...</p>
        </div>
      );
    }

    var rows = this.state.accounts.map(function (account) {
      return (<AccountTableItem key={account["id"]} account={account}
                                onCloneAccount={this.onCloneAccount}
                                onUpdateAccount={this.onUpdateAccount}
                                onDeleteAccount={this.onDeleteAccount}/>);
    }.bind(this));

    return (
      <div className="container">
        <h3>Accounts</h3>
        <hr/>
        <div className="container">
          <button type="button"
                  onClick={this.onCreateClick}
                  className="btn btn-success">Create Account</button>
        </div>
        <br/>
        <table className="table account-list-table">
          <thead>
            <th>ID</th>
            <th>Nickname</th>
            <th>Authorities</th>
            <th>Created</th>
            <th>Is Active</th>
            <th>Contacts</th>
            <th>Password</th>
            <th/>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
        <br/>
        <div className="container">
          <button type="button"
                  className="btn btn-default">Next &raquo;</button>
        </div>
      </div>
    );
  }
});

