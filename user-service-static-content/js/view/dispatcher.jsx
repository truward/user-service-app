var React = require('React');
var Router = require('director').Router;
var DEFAULT_LIMIT = require("../service/ajax-user-service.js").DEFAULT_LIMIT;

var AccountListPage = require('./account/account-list-page.js');
var AccountEditPage = require('./account/account-edit-page.js');
var PasswordPage = require('./password/password-page.js');
var TokenPage = require('./token/token-page.js');
var RolesPage = require('./roles/roles-page.js');
var AboutPage = require('./about/about-page.js');

var Nav = {
  UNDEFINED: "undefined",

  PASSWORD: "password",

  TOKEN: "token",
  NEW_ACCOUNT: "new-account",
  ACCOUNT_LIST: "account-list",

  PASSWORD: "roles",

  ABOUT: "about"
};

function setStartTitle(pageNamePart) {
  if (pageNamePart != null) {
    document.title = "User Service \u00BB " + pageNamePart;
    return;
  }

  document.title = "User Service \u00BB Loading...";
}

var TitleService = {
  setTitle: setStartTitle
}

module.exports = React.createClass({
  getInitialState: function () {
    var services = { titleService: TitleService };
    for (var serviceKey in this.props.services) {
      services[serviceKey] = this.props.services[serviceKey];
    }

    return {
      services: services,

      nowShowing: Nav.UNDEFINED, // current widget

      // controller variables
      userId: undefined,
      userUpdateMode: undefined,
      limit: undefined,
      offsetToken: undefined
    };
  },

  componentDidMount: function () {
    var gotoAccountListPage = function (offsetToken, limit) {
      this.setState({
        nowShowing: Nav.ACCOUNT_LIST,
        offsetToken: undefined,
        limit: DEFAULT_LIMIT
      });
    }.bind(this);
    var gotoAccountListWithOffsetAndLimitPage = function (offsetToken, limit) {
      this.setState({
        nowShowing: Nav.ACCOUNT_LIST,
        offsetToken: offsetToken,
        limit: parseInt(limit)
      });
    }.bind(this);

    var gotoNewAccountPage = function () {
      this.setState({
        nowShowing: Nav.NEW_ACCOUNT,
        userId: undefined,
        userUpdateMode: "CREATE"
      });
    }.bind(this);

    var gotoUpdateAccountPage = function (userId) {
      this.setState({
        nowShowing: Nav.NEW_ACCOUNT,
        userId: parseInt(userId),
        userUpdateMode: "UPDATE"
      });
    }.bind(this);

    var gotoCloneAccountPage = function (userId) {
      this.setState({
        nowShowing: Nav.NEW_ACCOUNT,
        userId: parseInt(userId),
        userUpdateMode: "CLONE"
      });
    }.bind(this);

    var gotoTokenPage = this.setState.bind(this, {nowShowing: Nav.TOKEN});
    var gotoPasswordPage = this.setState.bind(this, {nowShowing: Nav.PASSWORD});
    var gotoRolesPage = this.setState.bind(this, {nowShowing: Nav.ROLES});

    var gotoAboutPage = this.setState.bind(this, {nowShowing: Nav.ABOUT});

    var router = Router({
      '/token': gotoTokenPage,
      '/password': gotoPasswordPage,
      '/roles': gotoRolesPage,
      '/accounts': gotoAccountListPage,
      '/accounts/create': gotoNewAccountPage,
      '/accounts/update/:userId': gotoUpdateAccountPage,
      '/accounts/clone/:userId': gotoCloneAccountPage,
      '/accounts/offset/:offset/limit/:limit': gotoAccountListWithOffsetAndLimitPage,
      '/about': gotoAboutPage
    });

    router.init('/accounts');
  },

  render: function() {
    switch (this.state.nowShowing) {
      case Nav.UNDEFINED: // happens once on loading
        setStartTitle("Main");
        return (<div/>);

      case Nav.TOKEN:
        setStartTitle("Create Invitation Token");
        return (<TokenPage services={this.state.services}/>);

      case Nav.PASSWORD:
        setStartTitle("Password Operations");
        return (<PasswordPage services={this.state.services}/>);

      case Nav.ROLES:
        setStartTitle("Roles");
        return (<RolesPage services={this.state.services}/>);

      case Nav.ACCOUNT_LIST:
        setStartTitle();
        return (<AccountListPage
                  services={this.state.services}
                  offsetToken={this.state.offsetToken}
                  limit={this.state.limit}
                  />);

      case Nav.NEW_ACCOUNT:
        setStartTitle("New Account");
        return (<AccountEditPage services={this.state.services}
                                userUpdateMode={this.state.userUpdateMode}
                                userId={this.state.userId}/>);

      case Nav.ABOUT:
        setStartTitle("About");
        return (<AboutPage />);

      default:
        setStartTitle();
        return (<AccountListPage services={this.state.services} offsetToken={undefined} limit={DEFAULT_LIMIT} />);
    }
  }
});

