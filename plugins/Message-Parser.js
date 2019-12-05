const Users = require('./Users');
const Commands = require('../Commands/chatroom');
const Config = require('../Config');

const notifier = require('node-notifier');
// String
 

class MessageParser {
  constructor(){
    this.prefix = '/',
      this.customs = {},
      this.type = null
  }
  
  parse(data) {
    notifier.notify('Message recieved');

    return this.parsePunishments(this.parseUser(this.parseMessage(data)));
  }
  
  
  parsePunishments(data) {
    
  let user = Users.get(Users.toId(data.user));
if(!user) return data;
    let puns = user.punishments;
    
  
    
    switch(puns) {
      case 'Mute' : {
        data.type = "perror";
        data.message = "You are muted for 7 minutes and cannot talk";
        return data;
      }
        break;
        
      case 'hourmute' : {
        data.type = "perror";
        data.message = "You are muted for 1 hour and cannot talk";
        return data;
      }
        break;
        
        default : return data;
    }
    }
  
  
  
  parseUser(data) {
    if(data.type) return data;
    if(!Users.get(Users.toId(data.user))) return;
    let user = Users.get(Users.toId(data.user));
    let rank = user.rank;
 
    
    switch(rank) {
      case 'Admin' : {
        data.user =  '<span style="color:grey;">~</span>' + data.user;
        return data;
      }
        
        break;
        
      case 'Voice' : {
      data.user =  '<span style="color:grey;">+</span>' + data.user;
        return data;
      }
        break;
        
      case 'Driver' : {
         data.user =  '<span style="color:grey;">%</span>' + data.user;
      return data;
      }
        break;
        
      case 'Moderator' : {
      data.user =  '<span style="color:grey;">@</span>' + data.user;
     return data;
      }  
        
        break;
      
      case 'Leader' : {
        data.user =  '<b style="color:grey;">&</b>' + data.user;
        return data;
      }
        break;
        
        default : return data;
    }
  }
  
  
  
  parseMessage(data) {
    let msg = data.message;
    this.type = null;
    if(msg.startsWith(this.prefix) || msg.startsWith('!')) this.type = 'command'
    if(msg.startsWith('**') && msg.endsWith('**')) this.type = "bold";
    if(msg.startsWith('``') && msg.endsWith('``')) this.type = "code";
    if(msg.startsWith('~~') && msg.endsWith('~~')) this.type = "del";
    if(msg.startsWith(',,') && msg.endsWith(',,')) this.type = "ita";
    if(msg.startsWith('&gt;')) this.type = "green";
   console.log(msg);
    switch(this.type) {
      case 'command' : {
        return this.parseCommand(data);
    }
        break;
      case 'bold' : {
        msg = msg.replace('**','')
         data.message = '<b>' + msg.replace('**','') + '</b>';
        return data;
      }
        break;
      case 'code' : {
        msg = msg.replace('``','')
         data.message = '<pre>' + msg.replace('``','') + '</pre>';
        return data;
      }

        break;
      case 'del' : {
        msg = msg.replace('~~','')
         data.message = '<del>' + msg.replace('~~','') + '</del>';
        return data;
      }
        
      break;
        
       case 'green' : {
        
         data.message = '<span style="color:green;">' + msg + '</span>';
        return data;
      }
        
      break;
        
      case 'ita' : {
        msg = msg.replace(',,','')
         data.message = '<i>' + msg.replace(',,','') + '</i>';
        return data;
      }
        
      default : return data;
    
  }
    
  }
  
    parseCommand(data) {
    let msg = data.message;
    let arr = msg.split(" ");
    let cmd = arr[0].startsWith(this.prefix) ? arr[0].replace(this.prefix, "").trim() : arr[0].replace('!', "").trim();
      let ctype = arr[0].startsWith(this.prefix) ? 'local' : 'global';
    let targets = msg.replace(arr[0], "");
    let user = Users.get(Users.toId(data.user));
      
      if (!Commands[cmd]) {
        data.message = "Command not found!";
        data.type = "perror";
        return data;
      }
        
    if (typeof Commands[cmd] === "string") cmd = Commands[cmd];
    if (Commands[cmd].devOnly && !user.isDev()) {
      data.message = "Access Denied";
      data.type = "perror";
      return data;
    }
      
         if(Commands[cmd].perms){
      if(!user.hasRank(Commands[cmd].perms) && !user.isDev()) {
        data.message = "Access Denied";
        data.type = "perror";
        return data;
      }
    }
    //  return console.log("not a developer!");
      delete user.pass;
    let output = Commands[cmd].command(user, targets, data, ctype);
  console.log(output);
      return output;
    }
    
  
}

module.exports = new MessageParser();
