var express = require("express");
var bodyparser = require("body-parser");
var { mongoose } = require("./db/db.js");
var { institute } = require("./models/institute.js");
var { admin } = require("./models/admin.js");
const lodash = require("lodash");
var { ObjectId } = require("mongodb");
var { authenticate } = require("./middleware/authenticate.js");
var { authenticateadmin} = require("./middleware/authenticate-admin.js")
var { generateKey} = require("./middleware/generate-key")

var app = express();

app.use(bodyparser.json());

app.listen(7000, () => {
  console.log("listening on port 7000");
});

app.post("/institutes", (req, res) => {
  var body = lodash.pick(req.body, ["password", "email"]);
  var Key = generateKey();
  var user = new institute({
    email: body.email,
    password: body.password,
    accesskey: Key
  });
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
      //res.send(doc);
    })
    .then(token => {
      res.header("X-auth", token).send(user);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.post("/institutes/login", (req, res) => {
  var body = lodash.pick(req.body, ["password", "email"]);

  institute.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("X-auth", token).send(user);
      });
    })
    .catch(e => {
      res.header(400).send("check email or password");
    });
});

// Logout
app.delete("/institutes/dash", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    (res) => {
      res.send("Logout succesfull");
    },
    (err) => {
      res.status(400).send("Logout unsuccesfull");
    }
  );
});

app.get("/institutes/dash", authenticate, (req, res) => {
  res.send(req.user);
});


app.post("/admin", (req, res) => {
    var body = lodash.pick(req.body, ["password", "email"]);
    var user = new admin({
        email: body.email,
        password: body.password
    });
    user
        .save()
        .then(() => {
            return user.generateAuthToken();
            //res.send(doc);
        })
        .then(token => {
            res.header("X-auth", token).send(user);
        })
        .catch(e => {
            res.status(400).send(e);
        });
});

app.post("/admin/login", (req, res) => {
    var body = lodash.pick(req.body, ["password", "email"]);

    institute.findByCredentials(body.email, body.password)
        .then(user => {
            return user.generateAuthToken().then(token => {
                res.header("X-auth", token).send(user);
            });
        })
        .catch(e => {
            res.header(400).send("check email or password");
        });
});

// Logout
app.delete("/admin/dash",  (req, res) => {
    req.user.removeToken(req.token).then(
        (res) => {
            res.send("Logout succesfull");
        },
        (err) => {
            res.status(400).send("Logout unsuccesfull");
        }
    );
});

app.get("/admin/dash", (req, res) => {
  res.send(req.user);
});

app.post("/admin/dash/userdata", (req,res) => {
    var user = new admin();
    user.getuserdata().then((users) => {
      res.send(users);
    }).catch((err) => {
      res.status(400).send(err);
    })
});

