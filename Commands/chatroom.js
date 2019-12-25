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

function say(txt, type, time, odata,) {
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
      data.user = '';
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
      
        case "pc":
      {
        data.user = "none";
        data.type = "pc";
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
odata.message = txt;
return odata;
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

intro: {
    command(user, target, data, type) {

      if(type == "global") return say(`<div> <strong style='color:${user.color}'><center>Introduction to Blue Marble</center></strong><br>Blue Marble is a Chat Application created using WS, Node.js and Socket.io. We have an in-built ranks section and many commands (some which only certain ranks have access to). Currently we're still in the development phase as it's quite a new app, and we're working on more features all the time. Check out our open source  <a href="https://github.com/Zerapium/Bluemarble-ChatApp">here</a>, and maybe submit a Pull Request or two if you're a developer. Check out our credits with /credits and our rules with /rules. Have fun! </div>`, 'c', data.date);
   return say(`<div> <strong style='color:${user.color}'><center>Introduction to Blue Marble</center></strong><br>Blue Marble is a Chat Application created using WS, Node.js and Socket.io. We have an in-built ranks section and many commands (some which only certain ranks have access to). Currently we're still in the development phase as it's quite a new app, and we're working on more features all the time. Check out our open source  <a href="https://github.com/Zerapium/Bluemarble-ChatApp">here</a>, and maybe submit a Pull Request or two if you're a developer. Check out our credits with /credits and our rules with /rules. Have fun!</div>`, 'pc', data.date,data); 

 },
  },

  shrug: {
   command(user, target, data) {
		target = target ? ' ' + target + ' ' : '';
	 return say(target + '¯\\_(ツ)_/¯','',data.date,data);
	},
  },
	
	tableflip: {
  command(user, target, data) {
		target = target ? ' ' + target + ' ' : '';
		return say(target + '(╯°□°）╯︵ ┻━┻','',data.date,data);
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
    command(user, target, data, type) {
      let msg = `<div style="border:1px solid black;height:30%;width:99%;"> HTML by ${user.name} <br> ${target} </div>`;
      msg = unescapeHtml(msg);
      if(type =='global') return say(msg,'c',data.date);
      return say(msg,'pc',data.date);
    },
    perms : 'Moderator'
  },

  displayimage: "showimage",
  showimage: {
    command(user, target, data, type) {
      let ops = target.split(',');
      if (!ops[0].endsWith(".png") && !ops[0].endsWith(".gif") && !ops[0].endsWith(".jpg" || !target)) return say("Make sure your image ends in .png, .jpg or .gif","perror",data.date)
      let msg = `<div style="border:1px solid black;height:30%;width:100%;"> Image shown from by ${user.name} <br> <img src="${ops[0]}" width="${ops[1]}" height="${ops[1]}"> </div>`;
      msg = unescapeHtml(msg);
      if(type =='global') return say(msg,'c',data.date);
      return say(msg,'pc',data.date);
    },
    perms : 'Driver'
  },

  showvideo : {
    command(user, target, data, type) {
     // getEmbedUrl(target));
      let msg = `<div style="border:1px solid black;"><button onclick="document.getElementById(${data.date}).style.display='none';">Close</button><button onclick="document.getElementById(${data.date}).style.display = 'block'">Show</button><summary>Youtube Video</summary><span id="${data.date}">${getEmbedUrl(target)} </span><br> Requested by ${user.name} </div>`;
      if(type =='global') return say(msg,'c',data.date);
      return say(msg,'pc',data.date);
    },
    perms : 'Driver'
  },
  
  commands: {
    command(user, target, data, type) {
      let cmds2 = Object.keys(cmds);
      let list = '';
      for(let i = 0;i < cmds2.length;i++) {
        
        list += cmds2[i] + ', ';
      } 
    
      if(type =='global') return say(list,'c',data.date);
      return say(list,'pc',data.date);
      
    }
  },
  
  mute : {
    command(user, target, data) {
    let targetUser = db.get(db.toId(target));
if(!(typeof targetUser == "object")) return say("User not found",'perror',data.date);
  targetUser.mute()
      function unMute() {
       targetUser.punishments = '';
        db.exportDatabase('users');
      }
setTimeout(unMute,1000 * 60 * 7);
      return say(targetUser.name + " was muted for 7 minutes by " + user.name, 'c',data.date);
},
},
  
    tl : 'todolist',
  tasks : 'todolist',
  todolist : {
    command(user, target, data, type) {
      let options = target.trim().split(',');
     if(!Tools.data['todolist']) Tools.data['todolist'] = {};
      let list = Users.data['todolist'];
      let items = Object.keys(list);
      
      switch(options[0]) {
        case 'add' : {
          Users.data['todolist'][options[1]] = {};
          Users.exportDatabase('todolist')
          return say(user.name +  " added a new task -- " + options[1],'c',data.date,data)
        } 
          break;
          
        case 'edit' : {
                  Users.data['todolist'][options[1]].status = options[2] + `[${user.name}]`;
  
         Users.exportDatabase('todolist')

          return say(user.name + " edited the task -- " + options[1],'c',data.date,data);
        }
          break;
          
        case 'remove' : {
          delete list[options[1]]
          Users.exportDatabase('todolist')     
          return say(user.name + " removed the task -- " + options[1],'c',data.date,data);
        }
          break;
          
          default : {
            let msg = '';
            for(let i = 0;i < items.length;i++) {
              msg += `<b><ins> ${items[i]} </ins> </b> ---- <i> ${list[items[i]].status} </i> <br>`
            }
            if(type == "global") return say("<strong> <b> Todolist </b> </strong> <br> <br>" +msg ,'c',data.date,data)

            return say("<strong> <b> Todolist </b> </strong> <br> <br>" +msg ,'pc',data.date,data)
    }
      }
    },
    perms : 'Driver',
    help : "/todolist add|edit|remove,[task name],[task status]"
  },
  
   uptime: {
   command(user, target, data, type){
		let uptime = process.uptime();
		let uptimeText;
		if (uptime > 24 * 60 * 60) {
			let uptimeDays = Math.floor(uptime / (24 * 60 * 60));
			uptimeText = uptimeDays + " " + (uptimeDays === 1 ? "day" : "days");
			let uptimeHours = Math.floor(uptime / (60 * 60)) - uptimeDays * 24;
			if (uptimeHours) uptimeText += ", " + uptimeHours + " " + (uptimeHours === 1 ? "hour" : "hours");
		} else {
			uptimeText = Tools.toDurationString(uptime * 1000);
			}
			if(type =='global') return say("<b> Uptime : </b>" + uptimeText,'c',data.date);
      return say("<b> Uptime : </b>" + uptimeText,'pc',data.date);
		
			}
			},
  
  
  credits : {
    command(user, target, data, type) {
      let msg = `<div class="w3-margin w3-padding-16"><h2><strong> Server Credits</strong> </h2><br>
<strong> P9 </strong> --- Owner[~]| Backend Development | Socket.io | Frontend Development. <br> </br>
<strong> Zeru </strong> --- Server Driver[%] | Frontend Development | Commands Writer. <br> <br>
<strong> Delta </strong> --- Server Moderator[@] | Frontend Development. <br><br> </div>
`;
      return popup(msg,data);
      
    },
  },
  
	  avatar : {
    command(user, target, data, type) {
      user.setAvi(target);
      return say(user.name +" Updated their avatar","c",data.date,data);
    },
  },

  
  
};

module.exports = cmds;
