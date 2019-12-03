var express = require("express");
var router = express.Router();
var app = express();

router.get("/inbox", function(req, res) {
  res.render("inbox");
});

module.exports = router;
