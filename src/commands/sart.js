const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);
var turl = require('turl');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};



exports.run = async (client, message, args) => {
	function removeDuplicates(originalArray, objKey1) {
	  var trimmedArray = [];
	  var values = [];
	  var artist;

	  for(var i = 0; i < originalArray.length; i++) {
		artist = originalArray[i][objKey1];

		if(values.indexOf(artist) === -1){
		  trimmedArray.push(originalArray[i]);
		  values.push(artist);
		}
		else{
			message.channel.send(artist);
		}
	  }

	  return trimmedArray;

	};
  try {
      let member;
      member = message.member;
      const fetchUser = new fetchuser(client, message);
      const Crowns = client.sequelize.import(`../models/Crowns.js`);
      const user = await fetchUser.getById(member.id);
      if (!user) return message.reply(client.snippets.noLogin);
	   //message.channel.startTyping();
      const serverArtists = await Crowns.findAll({
        where: {
          guildID: message.guild.id
        }
      });
      let num = 0;
      var validCrowns = serverArtists
        .map(x => {
          return {
            name: x.get(`artistName`),
            plays: parseInt(x.get(`serverPlays`)),
            guildID: x.get(`guildID`),
			listeners: parseInt(x.get(`serverListeners`)),
			url: x.get(`artistURL`),
			tiny: x.get(`tinyURL`),
			glitch: ``
          };
        })
        .filter(x => message.guild.id === x.guildID && x.plays > 0 && x.listeners > 0 && x.url != null)
		.sort((a,b) => (b.name.length + b.url.length) - (a.name.length + a.url.length));
      
	  if (validCrowns.length === 0){
		//message.channel.stopTyping();
        return message.reply(`no crowns found.`);
	  }
		
		for(var i = 0; i < validCrowns.length; i++){
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
						artistName: validCrowns[i].name
					  }
					});
				  }
				validCrowns[i].glitch = `*`;				
			  }
			if(validCrowns[i].name.split(`(`).length != validCrowns[i].name.split(`)`).length){
				validCrowns[i].name = validCrowns[i].name.split(`(`).join(`（`).split(`)`).join(`）`);
			}
			if(validCrowns[i].name.split(`[`).length != validCrowns[i].name.split(`]`).length){
				validCrowns[i].name = validCrowns[i].name.split(`[`).join(`〚`).split(`]`).join(`〛`);
			}
		}
		
		/*
		var len = Infinity;
		var first = 0;
		var second = 10;
		while(len > 2048){
			
			var longList = validCrowns
			.slice(first, second);
			
			var longDesc = longList
				.map(x => `1000. [${x.name}](${x.url}) → **${x.plays}** scrobbles (${x.listeners} listeners, 9999999 avg)`)
				.join(`\n`) + `\n\ntotal amount of artist crowns: **${validCrowns.length}**`;
			len = longDesc.length;
			//console.log(len);
			if(len <= 2048){
				break;
			}
			for(var i = first; i < second; i++){
				if(validCrowns[i]){
					if(validCrowns[i].url != null && validCrowns[i].tiny == null){
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
		
	  var listSort = validCrowns
        .sort((a,b) => 
		(args[0] == `--avg`) ? (parseFloat((parseFloat(b.plays)/parseFloat(b.listeners)).toFixed(2)) - parseFloat((parseFloat(a.plays)/parseFloat(a.listeners)).toFixed(2)) == 0) ? (b.plays - a.plays == 0) ? a.name.localeCompare(b.name) : b.plays - a.plays : parseFloat((parseFloat(b.plays)/parseFloat(b.listeners)).toFixed(2)) - parseFloat((parseFloat(a.plays)/parseFloat(a.listeners)).toFixed(2)) :
		(args[0] == `--list`) ? (b.listeners - a.listeners == 0) ? (b.plays - a.plays == 0) ? a.name.localeCompare(b.name) : b.plays - a.plays : b.listeners - a.listeners :
		(args[0] == `--rand`) ? b.plays - getRandomInt(1, b.plays * 2) : 
		(args[0] == `--alph`) ? (a.name.localeCompare(b.name) ==  a.name.localeCompare(a.name)) ? b.plays - a.plays : a.name.localeCompare(b.name) : 
		(args[0] == `--alphr`) ? (b.name.localeCompare(a.name) == b.name.localeCompare(b.name)) ? b.plays - a.plays : b.name.localeCompare(a.name) :
		//(args[0] == `--len`) ? (b.name.length - a.name.length == 0) ? a.name.localeCompare(b.name) : b.name.length - a.name.length : 
		//(args[0] == `--lenr`) ? (a.name.length - b.name.length == 0) ?  a.name.localeCompare(b.name) : a.name.length - b.name.length : 
		(b.plays - a.plays == 0) ? a.name.localeCompare(b.name) :
		b.plays - a.plays);
      const description = listSort
        .slice(0, 10)
        .map(x => (x.listeners > 1) ? `${++num}. [${x.name}](${x.url}) → **${x.plays}** scrobbles (${x.listeners} listeners, ` +  parseFloat((parseFloat(x.plays)/parseFloat(x.listeners)).toFixed(2)) + ` avg)` : (x.plays > 1) ? `${++num}. [${x.name}](${x.url}) → **${x.plays}** scrobbles (${x.listeners} listener, ${x.plays} avg)` : `${++num}. [${x.name}](${x.url}) → **${x.plays}** scrobble (${x.listeners} listener, ${x.plays} avg)`)
        .join(`\n`) + `\n\ntotal number of artists: **${validCrowns.length}**`;
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
	  var title = `🎶  ` + message.guild.name + `'s artist list  🎶`; 
      const footer = `invoked by ${message.author.username} | ` + foot;
      if (description.length === 0)
        return message.reply(`no artists found.`);
      const embed = new MessageEmbed()
        .setTitle(title)
        .setColor(message.member.displayColor)
        .setDescription(description)
        .setFooter(footer, message.author.displayAvatarURL());
      const msg = await message.channel.send({ embed });
	   //message.channel.stopTyping();
      if (validCrowns.length > 10) {
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(serverArtists.length / 10);
        let offset = 0, page = 1;
        const func = async off => {
          let num = off;
          const description = listSort
			.slice(off, off + 10)
			.map(x => (x.listeners > 1) ? `${++num}. [${x.name}](${x.url}) → **${x.plays}** scrobbles (${x.listeners} listeners, ` +  parseFloat((parseFloat(x.plays)/parseFloat(x.listeners)).toFixed(2)) + ` avg)` : (x.plays > 1) ? `${++num}. [${x.name}](${x.url}) → **${x.plays}** scrobbles (${x.listeners} listener, ${x.plays} avg)` : `${++num}. [${x.name}](${x.url}) → **${x.plays}** scrobble (${x.listeners} listener, ${x.plays} avg)`)
            .join(`\n`) + `\n\ntotal number of artists: **${validCrowns.length}**`;
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
  name: `sart`,
  description: `Shows you an ordered list of all the artists scrobbled in the server.`,
  usage: `sart`,
  notes: `The artist list is updated (not fully) every time someone uses \`-wk\`, \`-f\`, \`-fm\`, or a chart command. Note that artist playcounts may take a while to update if done by chart. The list sorts by scrobble count by default, but you can use any of the following arguments for alternative sorting methods: \`--alph\`, \`--alphr\`, \`--avg\`, \`--len\`, \`--list\`, \`--rand\`.`
};
