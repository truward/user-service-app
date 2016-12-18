var React = require('react');

module.exports = React.createClass({

  onCloneClick: function () {
    this.props.onCloneAccount(this.props.account);
  },

  onUpdateClick: function () {
    this.props.onUpdateAccount(this.props.account);
  },

  onDeleteClick: function () {
    this.props.onDeleteAccount(this.props.account);
  },

  render: function() {
    var account = this.props.account;

    var date = new Date(account["created"]);
    var dateStr = date.toISOString();
    var passwordHash = this.props.account["passwordHash"];

    var authorities = account["authorities"].map(function (role) {
      return (<li key={role}><span className="label label-primary">{role}</span></li>);
    });

    var contacts = (<p>NONE</p>);

    var isActiveStr = account["active"] ? "Yes" : "No";

    var trClassName = "";
    if (!account["active"]) {
      trClassName += "inactive-contact-row";
    }

    var userId = account["id"];

    return (
      <tr key={userId} className={trClassName}>
        <td>{account["id"]}</td>
        <td>{account["nickname"]}</td>
        <td className="authorities-cell"><ul className="list-unstyled">{authorities}</ul></td>
        <td>{dateStr}</td>
        <td>{isActiveStr}</td>
        <td>{contacts}</td>
        <td className="password-cell">{passwordHash}</td>
        <td className="buttons-cell">
          <div className="btn-group" role="group" aria-label="...">
            <button type="button" onClick={this.onCloneClick} className="btn btn-sm btn-default">Clone</button>
            <button type="button" onClick={this.onUpdateClick} className="btn btn-sm btn-default">Update</button>
            <button type="button" onClick={this.onDeleteClick} className="btn btn-sm btn-danger" >Delete</button>
          </div>
        </td>
      </tr>
    );
  }
});

