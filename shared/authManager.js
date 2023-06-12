const authManager = {
  _currentUser: {},

  get currentUser() {
    return authManager._currentUser;
  },

  set currentUser(user) {
    authManager._currentUser = user;
  },

  enforceLogin() {
    buildfire.auth.getCurrentUser((err, user) => {
      if (!user) {
        buildfire.auth.login({ allowCancel: false }, (err, user) => {
          if (!user) authManager.enforceLogin();
          else authManager.currentUser = user;
        });
      } else authManager.currentUser = user;
    });
  },
  
  refreshCurrentUser() {
    return new Promise((resolve) => {
      buildfire.auth.getCurrentUser((err, user) => {
        authManager.currentUser = (err || !user) ? null : user;
        resolve();
      });
    });
  },
};
