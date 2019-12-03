var express = require("express");
var router = express.Router();
var app = express();
var db = require("../plugins/Users");
var Tools = require("../plugins/Tools");
var Config = require("../Config");

router.get("/chat", function(req, res) {
  if(!req.session.user) return res.redirect('/login');
  let users = Object.keys(db.data['users']);
  let list = '';
  console.log(users)
  for(let i = 0;i < users.length;i++) {
    let user = db.get(users[i]);
    list += `<b><a onclick="popUpp(this,'userinfo')" style='color:${user.color};'> ${user.name} </a> </b><br>`;
  }
  res.render("chat",{name : req.session.user.name,color: req.session.user.color,users:list});
});



module.exports = router;
