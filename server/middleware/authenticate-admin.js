var { admin } = require("./../models/admin.js");

var authenticate = (req, res, next) => {
  token = req.header("X-auth");

  admin
    .findByToken(token)
    .then((user) => {
      if (!user) {
        res.status(401).send("no such user");
      }

      req.user = user;
      req.token = token;
      next();
    })
    .catch(e => {
      res.status(401).send("not authorised");
    });
};

module.exports = {
  authenticate
};
