const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");
const helmet = require("helmet");
const session = require("express-session");
const bodyParser = require("body-parser");
const MP = require("./plugins/Message-Parser");
const globaljs = require("./global");
const router = express.Router();
const app = express();
var server = http.createServer(app);
var io  = require("socket.io")(server)
var db = require("./plugins/Users");
var Tools = require("./plugins/Tools");


var chat = require("./ROUTES/chat");
var index = require("./ROUTES/index");
var login = require("./ROUTES/login");
var inbox = require("./ROUTES/inbox");

let userslist = [];



app.use(session({ secret: "ssshhhhh", saveUninitialized: true, resave: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/views"));

app.set("port", process.env.port || 3000);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(index);
app.use(login);
app.use(chat);
app.use(inbox);


////// Github Management //////


app.post('/git', (req, res) => {
  // If event is "push"
  const cmd = require("node-cmd");

if (req.headers['x-github-event'] == "push") {
  cmd.run('chmod 777 git.sh'); /* :/ Fix no perms after updating */
  cmd.get('./git.sh', (err, data) => {  // Run our script
    if (data) console.log(data);
    if (err) console.log(err);
  });
  cmd.run('refresh');  // Refresh project
}
let commits = req.body.head_commit.message.split("\n").length == 1 ?
              req.body.head_commit.message :
              req.body.head_commit.message.split("\n").map((el, i) => i !== 0 ? "                       " + el : el).join("\n");
console.log(`> [GIT] Updated with origin/master\n` + 
            `        Latest commit: ${commits}`);
  let data= {
    type : "error",
    user : "Server",
    color : "red",
    message : "[NEW COMMIT] " + commits
  }
  io.sockets.emit("newmsg",data);
  console.log("> [GIT] Updated with origin/master");

});

////// ends here ////


/////////////// SOCKET.IO \\\\\\\\\\\\\

var room = io.of('/chat/public');

io.on('connection', function(socket) {
 // socket.join('social');
  module.exports = socket;
  console.log();
   console.log('A user connected');
  
  io.sockets.on('connect', function(data) {
   // console.log(socket.id);
    io.sockets.emit('on_join');
    });
  
  
  function updateUL(ulist) {
    
    let list = '';
    for(let i = 0; i < ulist.length; i++) {
      
      if(ulist[i].length > 2) {
       let user = Users.get(Tools.toId(ulist[i]));
      list += `<b><a onclick="popUpp(this,'userinfo')" style='color:${user.color};'> ${user.name} </a> </b><br>`;

      }
    }
    
    io.sockets.emit('updateUL',list);
  
  }
  
  socket.on('join', function(user) {
     if(!db.get(db.toId(user)).socketid) db.get(db.toId(user)).socketid  = socket.id;
    socket.username = user;
    let data = {
      type : 'join',
      message : user + ' joined :D',
      user : user
    }
    userslist.push(user);
    updateUL(userslist);
   // io.sockets.emit('updateUL',userslist);
    io.sockets.emit('newmsg',data);
    
  });
  
  
  
  socket.on('join_chat', function(data) {
   socket.join(data.room);
    io.sockets.in(data.room).emit('test',data.msg)
  });
  
  socket.on('open_chat', function(data) {
   socket.join(data.room);
  });
  
  
  socket.on('msg', function(data) {
   if(!db.get(db.toId(data.user)).socketid) db.get(db.toId(data.user)).socketid  = socket.id;
    db.exportDatabase();
    data = MP.parse(data);
    console.log(JSON.stringify(data));
    if(data.type && data.type.startsWith('p')) return socket.emit('newmsg',data);
     io.sockets.emit('newmsg', data);
      console.log(data);
   })
  
  socket.on('addhis',function(data) {
    let filename = Tools.getDate();
    if(!(filename in db.data)) db.data[filename] = [];
    db.data[filename].push(data.replace("\n",''))
    db.exportLogs(filename);
  });
  
  socket.on('gethis',function(data) {
    const filename = Tools.getDate();
    if(!(filename in db.data)) return;
    let his = db.data[filename];
    let added = []
    for(let i = 0;i < his.length;i++) {
  if(added.includes(Tools.toId(his[i]))) {
    
  }
      else{
      socket.emit('newmsg',his[i]);
      added.push(Tools.toId(his[i]));
     // console.log(added);
      }
    }
  //  db.exportLogs(filename);
  });
  
  
  socket.on("popup", function(data) {
    switch(data.type) {
      case 'userinfo' : {
        let user = db.get(db.toId(data.msg));
        
        socket.emit("show_userinfo",user);
      }
        break;
        
      case 'fr' : {
        socket.emit('show_popup',data.msg)
      }
    }
  });

  
  socket.on('disconnect', function(){
    console.log(socket.username);
    let user = db.getBySock(socket.id);
    if(socket.username == undefined) return;
    let data = {
      type : "leave",
      message: socket.username + " left D:",
      user : socket.username
    }
    userslist[userslist.indexOf(socket.username)] = '';
    updateUL(userslist);
   // io.sockets.emit("updateUL",userslist);
    io.sockets.emit("newmsg",data);
  //  if(typeof user == "object") console.log(user.name);
       console.log(socket.handshake.headers['x-forwarded-for'].split(',')[0]);
     io.emit('user disconnected');
   });
  
   socket.on('typing', function(user){
          let data = {
      type : 'typing',
            user : user,
      message : user + ' is typing...'
    }
    io.sockets.emit('newmsg',data);
   });
  
  socket.on('send_req', function(data){
    let user = db.get(db.toId(data.to));
    let by = db.get(db.toId(data.sender))
      socket.to(user.socketid).emit('req_rec','none',by)
   });
  
 /* socket.on("userslist",function(data) {
   // if(!(global.users.length > 0)) global.users = '';
    switch(data.type) {
      case 'add' : { 
        let list = '';
        if(global.users.includes(data.user)) return;
        global.users.push(data.user);
        for(let i = 0;i < global.users.length;i++) {
           if(global.users[i] == '') {
            
          }
          else {
          let user = db.get(db.toId(global.users[i]));
           list += `<b><a onclick="popUpp(this,'userinfo')" style='color:${user.color};'> ${user.name} </a> </b><br>`;
      }
        }
                io.sockets.emit("updateUserslist",list);

      }
        break;
      case 'remove' : {
        let list = '';
        let index = global.users.indexOf(data.user);
       global.users[index] = '';
        for(let i = 0; i < global.users.length; i++){
          if(global.users[i] == '') {
            
          }
          else {
             let user = db.get(db.toId(global.users[i]));
         list += `<b><a onclick="popUpp(this,'userinfo')" style='color:${user.color};'> ${user.name} </a> </b><br>`;
        }
          }
      
        //global.users.replace(user2,'');
        io.sockets.emit("updateUserslist",global.users);
      }
    }
  });
                      
  */




/* PERSONAL MESSAGES SOCKET STARTS FROM HERE *********************************/

socket.on('new_chat',function(to,chats){
  if(!to) return;
  let u = db.get(db.toId(to))
  if(!u || !u.socketid) return socket.emit('req_err','Couldnt send chat request to an offline user');
  let user = db.new(u);
  let me = db.new(db.get(db.toId(chats)));
  if(!user || !user.socketid) return socket.emit('req_err','Couldnt send chat request to an offline user');
   let room = me.id + '-' + user.id;

  console.log(user);
   socket.broadcast.to(user.socketid).emit('req_rec',me);
  socket.emit('request_sent',user,room);
})

});

const urlencodedParser = express.urlencoded({ extended: true });
const jsonParser = express.json();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

server.listen(app.get("port"), () => {
  console.log("App listening to port %d", app.get("port"));
});


db.importDatabases();
db.importUsers();
