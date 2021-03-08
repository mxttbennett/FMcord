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
    if (args[0] === `--notify`) {
      const Notifs = client.sequelize.import(`../models/Notifs.js`);
      const notif = await Notifs.findOne({
        where: {
          userID: message.author.id
        }
      });
      if (!notif) {
        await Notifs.create({ userID: message.author.id });
        await message.reply(`I will message you in your DM's every time ` +
        `someone takes your crown from a server. Make sure to enable your ` +
        `DM's (you can do so by going to Settings -> Privacy and Security ` +
        `-> Allow direct messages from server members.) so that I could ` +
        `notify you.\nYou can always disable this feature by doing ` +
        `\`${client.config.prefix}crowns --notify\` again.`);
      } else {
        await Notifs.destroy({
          where: {
            userID: message.author.id
          }
        });
        await message.reply(`you will no longer be notified when someone ` +
        `takes your crown.\nTo re-enable this feature, do ` +
        `\`${client.config.prefix}crowns --notify\` again.`);
      }
    } else {
      let member;
      const mention = message.mentions.members.first();
      if (mention) {
        member = mention;
      } else if (args.length > 0 && args[0] != `--rand` && args[0] != `--alph` && args[0] != `--len`) {
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
		.sort((a,b) => b.albname.length - a.albname.length);
		
		for(var i = 0; i < validCrowns.length; i++){
			  if(validCrowns[i].url != null && validCrowns[i].url.split(`%252B`).join(``) != validCrowns[i].url && validCrowns[i].tiny == null){
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
				validCrowns[i].glitch = `*`;				
			  }
			  
		}
		
		/*
		for(var i = 0; i < validCrowns.length; i++){
			console.log(i);
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
		}
		*/
		
		
		
		

      if (validCrowns.length === 0)
        return message.reply(`no crowns found.`);
		var longSort = validCrowns
			.slice(0, 10);
		var longest = longSort
			.map(x => (x.plays != 1) ? `1000. [${x.albname}](${x.url} '${x.name} - ${x.albname}')${x.glitch} → **${x.plays}** scrobbles` : `1000. [${x.albname}](${x.url} '${x.name} - ${x.albname}')${x.glitch} → **${x.plays}** scrobble`)
			.join(`\n`) + `\n\ntotal amount of album crowns: **${validCrowns.length}**`;
		
		if(longest.length >= 2600){
			for(var i = 0; i < 10; i++){
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
			}
		}

      const description = validCrowns
		.sort((a,b) => (args[0] == `--rand`) ? b.plays - getRandomInt(1, b.plays * 2) : (args[0] == `--alph`) ? a.albname.localeCompare(b.albname) : (args[0] == `--len`) ? b.albname.length - a.albname.length : b.plays - a.plays)
        .slice(0, 10)
        .map(x => (x.plays != 1) ? `${++num}. [${x.albname}](${(x.glitch == `*`) ? x.tiny : x.url} '${x.name} - ${x.albname}') → **${x.plays}** scrobbles` : `${++num}. [${x.albname}](${(x.glitch == `*`) ? x.tiny : x.url} '${x.name} - ${x.albname}') → **${x.plays}** scrobble`)
		.join(`\n`) + `\n\ntotal amount of album crowns: **${validCrowns.length}**`;
      if(args[0] == `--rand`){
		var foot = `random sort`;
	  }
	  else if(args[0] == `--alph`){
		var foot = `sorted alphabetically`;
	  }
	  else if(args[0] == `--len`){
		var foot = `sorted by name length`;
	  }
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
      if (validCrowns.length > 10) {
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(userCrowns.length / 10);
        let offset = 0, page = 1;
        const func = async off => {
          let num = off;
          const description = validCrowns
			.sort((a,b) => (args[0] == `--rand`) ? b.plays - getRandomInt(1, b.plays * 2) : (args[0] == `--alph`) ? a.albname.localeCompare(b.albname) : (args[0] == `--len`) ? b.albname.length - a.albname.length : b.plays - a.plays)
            .slice(off, off + 10)
			.map(x => (x.plays != 1) ? `${++num}. [${x.albname}](${(x.glitch == `*`) ? x.tiny : x.url} '${x.name} - ${x.albname}') → **${x.plays}** scrobbles` : `${++num}. [${x.albname}](${(x.glitch == `*`) ? x.tiny : x.url} '${x.name} - ${x.albname}') → **${x.plays}** scrobble`)
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
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `ac`,
  description: `**A**LBUM **C**ROWNS: Shows you all the album crowns you have. Once you listen to ` +
  `a certain album the most in the guild, you get a crown of that album in ` +
  `the guild.`,
  usage: `ac`,
  notes: `Album crowns are updated every time someone invokes the \`-a\` command, \`-f\` command, \`-fm\` command, or one of the various chart commands. Note that crowns may take a while to update if done by chart. A link with an asterisk next to it is one that will not work on iOS devices due to a bug relating to the URL encoding of \'+\'.`
};
