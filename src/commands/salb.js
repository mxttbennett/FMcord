const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);
var turl = require('turl');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function removeDuplicates(originalArray, objKey1, objKey2) {
  var trimmedArray = [];
  var values = [];
  var artist;
  var album;

  for(var i = 0; i < originalArray.length; i++) {
    artist = originalArray[i][objKey1];
	album = originalArray[i][objKey2];

    if(values.indexOf(artist + ` ||| ` + album) === -1){
      trimmedArray.push(originalArray[i]);
      values.push(artist + ` ||| ` + album);
    }
	else{
		message.channel.send(artist + ` - ` + album);
	}
  }

  return trimmedArray;

};

exports.run = async (client, message, args) => {
  try {
      let member;
      member = message.member;
      const fetchUser = new fetchuser(client, message);
      const Crowns = client.sequelize.import(`../models/ACrowns.js`);
      const user = await fetchUser.getById(member.id);
      if (!user) return message.reply(client.snippets.noLogin);
	  
      var serverAlbums = await Crowns.findAll({
        where: {
          guildID: message.guild.id
        }
      });
      let num = 0;
		  var validCrowns = serverAlbums
			.map(x => {
			  return {
				albname: x.get(`albumName`),
				name: x.get(`artistName`),
				plays: parseInt(x.get(`serverPlays`)),
				guildID: x.get(`guildID`),
				listeners: parseInt(x.get(`serverListeners`)),
				url: x.get(`albumURL`),
				tiny: x.get(`tinyURL`),
				glitch: ``,
				updatedAt: x.get(`updatedAt`)
			  };
			})
			.filter(x => message.guild.id === x.guildID && x.plays > 0 && x.listeners > 0 && x.url != null)
			.sort((a,b) => (b.name.length + b.albname.length + b.url.length) - (a.name.length + a.albname.length + a.url.length));
		
	  if (validCrowns.length === 0){
		//message.channel.stopTyping();
        return message.reply(`no crowns found.`);
	  }
		
		for(var i = 0; i < validCrowns.length; i++){
			  //console.log(validCrowns[i].updatedAt);
			  if(validCrowns[i].url != null && (validCrowns[i].url.split(`%252B`).join(``) != validCrowns[i].url || validCrowns[i].url.length > 90)){
				  if(validCrowns[i].tiny == null){
					 var tester = turl.shorten(validCrowns[i].url).then((res) => {
								return res;
							});
					validCrowns[i].tiny = await tester.then((res) => {
							  return res;
							});
					await Crowns.update({
					  tinyURL: validCrowns[i].tiny
					},
					{
					  where: {
						albumName: validCrowns[i].albname,
						artistName: validCrowns[i].name
					  }
					});
				  }
				validCrowns[i].glitch = `*`;				
			  }
			  
			if(validCrowns[i].albname.split(`(`).length != validCrowns[i].albname.split(`)`).length){
				validCrowns[i].albname = validCrowns[i].albname.split(`(`).join(`（`).split(`)`).join(`）`);
			}
			if(validCrowns[i].albname.split(`[`).length != validCrowns[i].albname.split(`]`).length){
				validCrowns[i].albname = validCrowns[i].albname.split(`[`).join(`〚`).split(`]`).join(`〛`);
			}
			
			/*
			validCrowns[i].updatedAt = validCrowns[i].updatedAt.toString().split(`GMT`)[0];
			var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
			var week = [`Sun`, `Mon`, `Tues`, `Wed`, `Thu`, `Fri`, `Sat`];
			for(var x = 0; x < week.length; x++){
				validCrowns[i].updatedAt = validCrowns[i].updatedAt.split(week[x]).join(week[x] + `,`);
			}
			*/
			
				
		}
		
		/*
		var len = Infinity;
		var first = 0;
		var second = 10;
		while(len > 2048){
			
			var longList = validCrowns
			.slice(first, second);
			
			var longDesc = longList
				.map(x => `1000. [${x.albname}](${x.url}) → **${x.plays}** scrobbles (${x.listeners} listeners, 9999999 avg)`)
				.join(`\n`) + `\n\ntotal amount of registered albums: **${validCrowns.length}**`;
			len = longDesc.length;
			//console.log(len);
			if(len <= 2048){
				break;
			}
			
			for(var i = first; i < second; i++){
				if(validCrowns[i]){
					if(validCrowns[i].url != null && validCrowns[i].tiny == null){
						//message.channel.startTyping();
						var tester = turl.shorten(validCrowns[i].url).then((res) => {
								return res;
								});
						validCrowns[i].tiny = await tester.then((res) => {
								  return res;
								});
						await Crowns.update({
						  tinyURL: validCrowns[i].tiny
						},
						{
						  where: {
							albumName: validCrowns[i].albname,
							artistName: validCrowns[i].name
						  }
						});	
					}
					validCrowns[i].glitch = `*`;
				}
			}
			first += 10;
			second += 10;
		}
		*/
		
		// '${x.name} — ${x.albname}'
		//${(x.glitch == `**`) ? `` : `'` + x.name + ` — ` + x.albname + `'`})
	  if(args[0] != `--new` && args[0] != `--old`){
		  var listSort = validCrowns
			.sort((a,b) => 
			(args[0] == `--avg`) ? (parseFloat((parseFloat(b.plays)/parseFloat(b.listeners)).toFixed(2)) - parseFloat((parseFloat(a.plays)/parseFloat(a.listeners)).toFixed(2)) == 0) ? (b.plays - a.plays == 0) ? a.albname.localeCompare(b.albname) : b.plays - a.plays : parseFloat((parseFloat(b.plays)/parseFloat(b.listeners)).toFixed(2)) - parseFloat((parseFloat(a.plays)/parseFloat(a.listeners)).toFixed(2)) :
			(args[0] == `--list`) ? (b.listeners - a.listeners == 0) ? (b.plays - a.plays == 0) ? a.albname.localeCompare(b.albname) : b.plays - a.plays : b.listeners - a.listeners :
			(args[0] == `--rand`) ? b.plays - getRandomInt(1, b.plays * 2) : 
			(args[0] == `--alph`) ? (a.albname.localeCompare(b.albname) ==  a.albname.localeCompare(a.albname)) ? b.plays - a.plays : a.albname.localeCompare(b.albname) : 
			(args[0] == `--alphr`) ? (b.albname.localeCompare(a.albname) == b.albname.localeCompare(b.albname)) ? b.plays - a.plays : b.albname.localeCompare(a.albname) :
			//(args[0] == `--len`) ? (b.albname.length - a.albname.length == 0) ? a.albname.localeCompare(b.albname) : b.albname.length - a.albname.length : 
			//(args[0] == `--lenr`) ? (a.albname.length - b.albname.length == 0) ?  a.albname.localeCompare(b.albname) : a.albname.length - b.albname.length : 
			//(args[0] == `--old`) ? (a.updatedAt - b.updatedAt == 0) ?  a.albname.localeCompare(b.albname) : a.updatedAt - b.updatedAt : 
			//(args[0] == `--new`) ? (b.updatedAt - a.updatedAt == 0) ?  a.albname.localeCompare(b.albname) : b.updatedAt - a.updatedAt : 
			(b.plays - a.plays == 0) ? a.albname.localeCompare(b.albname) :
			b.plays - a.plays);
	  }
	  else{
		  var listSort = validCrowns;
	  }
      const description = listSort
        .slice(0, 10)
        .map(x => `${++num}. [${x.albname}](${(x.glitch == `*`) ? x.tiny : x.url}) → **${x.plays}** ${(x.plays != 1) ? `scrobbles` : `scrobble`} (${(x.listeners != 1) ? x.listeners + ` listeners` : x.listeners + ` listener`}, ` +  parseFloat((parseFloat(x.plays)/parseFloat(x.listeners)).toFixed(2)) + ` avg)${(args[0] == `--new` || args[0] == `--old`) ? ` [updated at ` + x.updatedAt + `EST]` : ``}`)
        .join(`\n`) + `\n\ntotal number of albums: **${validCrowns.length}**`;
      if(args[0] == `--avg`){
		var foot = `sorted by average`;
	  }
	  else if(args[0] == `--list`){
		var foot = `sorted by # of listeners`;
	  }
	  else if(args[0] == `--rand`){
		var foot = `sorted randomly`;
	  }
	  else if(args[0] == `--alph`){
		var foot = `sorted a → z`;
	  }
	  else if(args[0] == `--alphr`){
		var foot = `sorted z → a`;
	  }
	  
	  /*
	  else if(args[0] == `--len`){
		var foot = `sorted by name length (longest → shortest)`;
	  }
	  else if(args[0] == `--lenr`){
		var foot = `sorted by name length (shortest → longest)`;
	  }
	  */
	  
	  else{
		var foot = `sorted by playcount`;
	  }
	  var title = `🎶  ` + message.guild.name + `'s album list  🎶`; 
      const footer = `invoked by ${message.author.username} | ` + foot;
      if (description.length === 0)
        return message.reply(`no albums found.`);
      const embed = new MessageEmbed()
        .setTitle(title)
        .setColor(message.member.displayColor)
        .setDescription(description)
        .setFooter(footer, message.author.displayAvatarURL());
      const msg = await message.channel.send({ embed });
	   //message.channel.stopTyping();
      if (validCrowns.length > 10) {
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(serverAlbums.length / 10);
        let offset = 0, page = 1;
        const func = async off => {
          let num = off;
          const description = listSort
			.slice(off, off + 10)
			.map(x => `${++num}. [${x.albname}](${(x.glitch == `*`) ? x.tiny : x.url}) → **${x.plays}** ${(x.plays != 1) ? `scrobbles` : `scrobble`} (${(x.listeners != 1) ? x.listeners + ` listeners` : x.listeners + ` listener`}, ` +  parseFloat((parseFloat(x.plays)/parseFloat(x.listeners)).toFixed(2)) + ` avg)${(args[0] == `--new` || args[0] == `--old`) ? ` [updated at ` + x.updatedAt + `EST]` : ``}`)
			.join(`\n`) + `\n\ntotal number of albums: **${validCrowns.length}**`;
          const embed = new MessageEmbed()
            .setTitle(title)
            .setColor(message.member.displayColor)
            .setDescription(description)
            .setFooter(footer, message.author.displayAvatarURL());
          await msg.edit({ embed });
        };
        const toFront = () => {
          if (page !== length) {
            offset += 10, page++;
            func(offset);
          }
        };
        const toBack = () => {
          if (page !== 1) {
            offset -= 10, page--;
            func(offset);
          }
        };
        await rl.setKey(client.snippets.arrowLeft, toBack);
        await rl.setKey(client.snippets.arrowRight, toFront);
      }
    }
  catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
	//message.channel.stopTyping();
  }
};

exports.help = {
  name: `salb`,
  description: `Shows you an ordered list of all the albums scrobbled in the server.`,
  usage: `salb <arg>`,
  notes: `The album list is updated (not fully) every time someone uses \`-a\`, \`-f\`, \`-fm\`, or a chart command. Note that album playcounts may take a while to update if done by chart. The list sorts by scrobble count by default, but you can use any of the following arguments for alternative sorting methods: \`--alph\`, \`--alphr\`, \`--avg\`, \`--list\`, \`--rand\`.`
};
