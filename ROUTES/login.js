var express = require("express");
var router = express.Router();
var app = express();
var db = require("../plugins/Users");
var Tools = require("../plugins/Tools");

router.get("/login", function(req, res) {
  res.render("login");
});

router.get("/logout", function(req, res) {
  delete req.session.user;
  res.redirect("login");
});

router.post("/login", function(req, res) {
  let details = req.body;
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(Tools.mainIp(ip))
   if(!(db.toId(details.username) in db.users)) db.signup(details,ip); 
  let user = db.get(db.toId(details.username));
  if(!(user.mainip.includes(ip))) user.mainip.push(ip);
  db.exportDatabase;
  if(details.password != user.pass) return console.log('wrongo!');
  if(details.username != user.id && details.username != user.name) db.get(user.id).name = details.username;
  user.name = details.username;
  req.session.user = user;
  res.redirect('chat')
});

module.exports = router;
