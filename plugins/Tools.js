const fs = require("fs");

var Tools = {
  data: [],
  users: [],

  importDatabase: function(roomid) {
    let file = "{}";
    try {
      file = fs.readFileSync("./databases/" + roomid + ".json").toString();
    } catch (e) {
      console.log(e.message);
    }
    this.data[roomid] = JSON.parse(file);
  },

  importDatabases: function() {
    let databases = fs.readdirSync("./databases");
    for (let i = 0, len = databases.length; i < len; i++) {
      let file = databases[i];
      if (!file.endsWith(".json")) continue;
      this.importDatabase(file.substr(0, file.indexOf(".json")));
    }
  },

  exportDatabase: function(name) {
    if (!(name in this.data)) return;
    fs.writeFileSync(
      "./databases/" + name + ".json",
      JSON.stringify(this.data[name])
        .split("},")
        .join("},\n")
    );
  },

  mainIp: function(ip) {
    return ip.toString().split(",")[0]
  },
  
  toId: function(str) {
    return str.replace(/[^A-Z0-9]/gi, "").toLowerCase();
  },
  
  getDate() {
    let time = Date.now()
     const date = new Date(time)
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			const day = date.getDate();
    return (year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day);
  },
  
  toDurationString(number, options) {
		const date = new Date(+number);
		const parts = [date.getUTCFullYear() - 1970, date.getUTCMonth(), date.getUTCDate() - 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()];
		const roundingBoundaries = [6, 15, 12, 30, 30];
		const unitNames = ["second", "minute", "hour", "day", "month", "year"];
		const positiveIndex = parts.findIndex(elem => elem > 0);
		const precision = (options && options.precision ? options.precision : parts.length);
		if (options && options.hhmmss) {
			let string = parts.slice(positiveIndex).map(value => value < 10 ? "0" + value : "" + value).join(":");
			return string.length === 2 ? "00:" + string : string;
		}
		// round least significant displayed unit
		if (positiveIndex + precision < parts.length && precision > 0 && positiveIndex >= 0) {
			if (parts[positiveIndex + precision] >= roundingBoundaries[positiveIndex + precision - 1]) {
				parts[positiveIndex + precision - 1]++;
			}
		}
		return parts.slice(positiveIndex).reverse().map((value, index) => value ? value + " " + unitNames[index] + (value > 1 ? "s" : "") : "").reverse().slice(0, precision).join(" ").trim();
	}
  
  
};

module.exports = Tools;
