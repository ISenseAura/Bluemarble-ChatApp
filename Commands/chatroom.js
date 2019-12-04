const db = require("../plugins/Users");
const Tools = require("../plugins/Tools");
const getEmbedUrl = require("video-embed");


 function unescapeHtml(unsafe) {
    return unsafe
         .replace(/&amp;/g, "&")
         .replace(/&lt;/g, "<")
         .replace(/&gt;/g, ">")
         .replace(/&quot;/g, '"')
         .replace(/&#039;/g, "'");
 }


function popup(msg,data) {
  data.message = msg;
  data.type = 'popup';
  return data;
}

function say(txt, type, time) {
  let data = {};
  switch (type) {
    case "error":
      {
        data.user = "Server";
        data.type = "error";
        data.color = "red";
        data.message = txt;
        data.date = time;
        return data;
      }
      break;
      
    case 'perror' : {
      data.type = 'perror';
      data.message = txt;
      data.date = time;
      return data;
    }
      break;
        

    case "c":
      {
        data.user = "none";
        data.type = "c";
        data.color = "black";
        data.message = txt;
        data.date = time;
        return data;
      }
      break;

    case "eval": {
      data.user = "Server";
      data.type = "eval";
      data.message = txt;
      data.date = time;
      return data;
    }



break;

case '' :{
data.message = text;
data.date = time;
return data;
}

  }
}

let cmds =  {
  js: "eval",
  eval: {
    command(user, target, data) {
      let ev;
      try{
        eval(target);
        ev = eval(target);
      } catch(e) {
        ev = e.message
      }
      
      return say(
        "eval : " + target + " >>> " +  ev,
        "eval",
        data.date
      );
    },
    devOnly: true
  },

  custom: "c",
  c: {
    command(user, target, data) {
      let type = target.trim().split(",")[0];
      console.log(type);
      let txt = target.trim().split(",")[1];
      return say(txt, type, data.date);
    },
    devOnly: true
  },
  
  
  me: {
    command(user, target, data) {
      return say(`[${data.date}] <strong style='color:${user.color}'> • </strong> ${user.name}  <i>${target} </i>`, 'c', data.date);
    },
  },
  shrug: {
   command(user, target, data) {
		target = target ? ' ' + target + ' ' : '';
	 return say(target + '¯\\_(ツ)_/¯','',data.date);
	},
  },
	
	tableflip: {
  command(user, target, data) {
		target = target ? ' ' + target + ' ' : '';
		return say(target + '(╯°□°）╯︵ ┻━┻','',data.date);
	},
 },
	
  clearmsgs: {
    command(user, target, data) {
     delete db.data[Tools.getDate()] 
      return say('Todays messages have been cleared by ' + user.name,'error',data.date)
    },
    perms : 'leader'
  },
  
  auth: {
    command(user, target, data) {
      let ranks = {
        Admin : [],
        Leader : [],
        Moderator : [],
        Driver : [],
        Voice : []
      }
      
      let users = Object.keys(Users.data['users']);
      for(let i = 0;i <users.length;i++) {
        console.log(users[i])
        let user = Users.get(users[i]);
        let valranks = Object.keys(ranks);
        if(valranks.includes(user.rank)) {
          ranks[user.rank].push(user.name);
          
        } 
      }
      let msg  = `<div class='w3-padding-32 w3-margin'><h2> <strong> Server Staff </strong> </h2> <hr/> 
<strong> Server Admins : </strong> ${ranks.Admin} <br><br>
<strong> Server Leaders : </strong> ${ranks.Leader}  <br><br>
<strong> Server Moderators : </strong> ${ranks.Moderator}  <br><br>
<strong> Server Drivers : </strong> ${ranks.Driver}  <br><br>
<strong> Server Voices : </strong> ${ranks.Voice} 

</div>`;
      return popup(msg,data);
    }
  },
  

  promote: {
    command(user, target, data) {
      let t1, t2;
      t1 = target.trim().split(",")[0];
      t2 = target.trim().split(",")[1];
      console.log(t2);
      if (typeof db.get(t1) != "object") {
        data.message = "user not found";
        data.type = "perror";
        return data;
      }
      db.get(t1).promote(t2);
      db.get(t1);
      let txt = t1 + " was promoted to server " + t2;
      return say(txt, "c", data.date);
    },
    perms: 'Admin',
  },
  
  html : "htmlbox",
  htmlbox : {
    command(user, target, data) {
      let msg = `<div style="border:1px solid black;height:30%;width:99%;"> HTML by ${user.name} <br> ${target} </div>`;
      msg = unescapeHtml(msg);
      return say(msg,'c',data.date);
    },
    perms : 'Moderator'
  },
  
  showvideo : {
    command(user, target, data) {
     // getEmbedUrl(target));
      let msg = `<div style="border:1px solid black;"><button onclick="document.getElementById(${data.date}).style.display='none';">Close</button><button onclick="document.getElementById(${data.date}).style.display = 'block'">Show</button><summary>Youtube Video</summary><span id="${data.date}">${getEmbedUrl(target)} </span><br> Requested by ${user.name} </div>`;
      return say(msg,'c',data.date);
    },
    perms : 'Driver'
  },
  
  commands: {
    command(user, target, data) {
      let cmds2 = Object.keys(cmds);
      let list = '';
      for(let i = 0;i < cmds2.length;i++) {
        
        list += cmds2[i] + ', ';
      } 
    
      return say(list,'c',data.date);
      
    }
  },
  
  mute : {
    command(user, target, data) {
    let targetUser = db.get(db.toId(target));
if(!targetUser) return say("User not found",'perror',data.date);
  targetUser.punishments = "mute";
      function unMute() {
        user.punishments = '';
      }
setTimeout(unMute,5000);
      return say(targetUser.name + " was muted for 7 minutes by " + user.name, 'c',data.date);
},
},
  
  todolist : {
    command(user, target, data) {
      
    }
  },
  
  
  

  
  
};

module.exports = cmds;
