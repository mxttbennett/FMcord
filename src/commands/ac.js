const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);
var turl = require('turl');
var shorturl = require('shorturl-2');
var TinyURL = require('tinyurl');

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
  }

  return trimmedArray;

};

exports.run = async (client, message, args) => {
  try {
      let member;
      const mention = message.mentions.members.first();
      if (mention) {
        member = mention;
      } else if (args.length > 0 && args[0] != `--rand` && args[0] != `--alph` && args[0] != `--len` && args[0] != `--lenr` && args[0] != `--alphr`) {
        const username = args.join(` `).toLowerCase();
        const ourMember = message.guild.members
          .find(x => x.user.username.toLowerCase() === username);
        if (ourMember) member = ourMember;
        else return message.reply(`no user with username ${args.join(` `)} found.`);
      } else {
        member = message.member;
      }
      const fetchUser = new fetchuser(client, message);
      const Crowns = client.sequelize.import(`../models/ACrowns.js`);
	  const Albums = client.sequelize.import(`../models/Albums.js`);
      const user = await fetchUser.getById(member.id);
      if (!user) return message.reply(client.snippets.noLogin);
	  //message.channel.startTyping();
      const URL = `https://last.fm/user/${user.get(`lastFMUsername`)}`;
      const userCrowns = await Crowns.findAll({
        where: {
          userID: member.id,
          guildID: message.guild.id
        }
      });
      let num = 0;
      var validCrowns = userCrowns
        .map(x => {
          return {
			albname: x.get(`albumName`),
            name: x.get(`artistName`),
            plays: parseInt(x.get(`albumPlays`)),
            userID: x.get(`userID`),
            guildID: x.get(`guildID`),
			url: x.get(`albumURL`),
			tiny: x.get(`tinyURL`),
			glitch: ``
          };
        })
        .filter(x => 
		message.guild.id === x.guildID && member.user.id === x.userID)
		.sort((a,b) => (b.name.length + b.albname.length + b.url.length) - (a.name.length + a.albname.length + a.url.length));
		
		

      if (validCrowns.length === 0){
		//message.channel.stopTyping();
        return message.reply(`no crowns found.`);
	  }
		
		for(var i = 0; i < validCrowns.length; i++){
			  if(validCrowns[i].url != null && validCrowns[i].url.split(`%252B`).join(``) != validCrowns[i].url){
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
		}
		
		var len = Infinity;
		var first = 0;
		var second = 10;
		while(len > 2048){
			
			var longList = validCrowns
			.slice(first, second);
			
			var longDesc = longList
				.map(x => (x.plays != 1) ? `1000. [${x.albname}](${x.url}) → **${x.plays}** scrobbles` : `1000. [${x.albname}](${x.url}) → **${x.plays}** scrobble`)
				.join(`\n`) + `\n\ntotal amount of album crowns: **${validCrowns.length}**`;
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
	  var listSort = validCrowns
        .sort((a,b) => 
		(args[0] == `--rand`) ? b.plays - getRandomInt(1, b.plays * 2) : 
		(args[0] == `--alph`) ? (a.albname.localeCompare(b.albname) ==  a.albname.localeCompare(a.albname)) ? b.plays - a.plays : a.albname.localeCompare(b.albname) : 
		(args[0] == `--alphr`) ? (b.albname.localeCompare(a.albname) == b.albname.localeCompare(b.albname)) ? b.plays - a.plays : b.albname.localeCompare(a.albname) :
		//(args[0] == `--len`) ? (b.albname.length - a.albname.length == 0) ? a.albname.localeCompare(b.albname) : b.albname.length - a.albname.length : 
		//(args[0] == `--lenr`) ? (a.albname.length - b.albname.length == 0) ?  a.albname.localeCompare(b.albname) : a.albname.length - b.albname.length : 
		(b.plays - a.plays == 0) ? a.albname.localeCompare(b.albname) :
		b.plays - a.plays);
      const description = listSort
        .slice(0, 10)
		.map(x => `${++num}. [${x.albname}](${(x.glitch == `*`) ? x.tiny : x.url}) → **${x.plays}** ${(x.plays != 1) ? `scrobbles` : `scrobble`}`)
		.join(`\n`) + `\n\ntotal amount of album crowns: **${validCrowns.length}**`;
	 //console.log(description.length);
      if(args[0] == `--rand`){
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
	  var title = `:crown:  ${member.user.username}'s album crowns  :crown:`; 
      const footer = `invoked by ${message.author.username} | ` + foot;
      if (description.length === 0)
        return message.reply(`no crowns found.`);
      const embed = new MessageEmbed()
        .setTitle(title)
        .setColor(message.member.displayColor)
        .setURL(URL)
        .setDescription(description)
        .setFooter(footer, message.author.displayAvatarURL());
      const msg = await message.channel.send({ embed });
	  //message.channel.stopTyping();
      if (validCrowns.length > 10) {
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(userCrowns.length / 10);
        let offset = 0, page = 1;
        const func = async off => {
          let num = off;
          const description = listSort
			.slice(off, off + 10)
			.map(x => `${++num}. [${x.albname}](${(x.glitch == `*`) ? x.tiny : x.url}) → **${x.plays}** ${(x.plays != 1) ? `scrobbles` : `scrobble`}`)
			.join(`\n`) + `\n\ntotal amount of album crowns: **${validCrowns.length}**`;
		  const embed = new MessageEmbed()
            .setTitle(title)
            .setColor(message.member.displayColor)
            .setURL(URL)
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
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
	//message.channel.stopTyping();
  }
};

exports.help = {
  name: `ac`,
  description: `**A**LBUM **C**ROWNS: Shows you all the album crowns you have. Once you listen to ` +
  `a certain album the most in the guild, you get a crown of that album in ` +
  `the guild.`,
  usage: `ac`,
  notes: `Album crowns are updated every time someone invokes the \`-a\` command, \`-f\` command, \`-fm\` command, or one of the various chart commands. Note that crowns may take a while to update if done by chart. The list sorts by scrobble count by default, but you can use any of the following arguments for alternative sorting methods: \`--alph\`, \`--alphr\`, \`--len\`, \`--lenr\`, \`--rand\`.`
};
