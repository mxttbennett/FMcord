const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);

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
			glitch: ``
          };
        })
        .filter(x => 
		message.guild.id === x.guildID && member.user.id === x.userID);
		
		for(var i = 0; i < validCrowns.length; i++){
			  if(validCrowns[i].url != null && validCrowns[i].url.split(`%252B`).join(``) != validCrowns[i].url){
				 validCrowns[i].glitch = `*`;
			  }
		}

      if (validCrowns.length === 0)
        return message.reply(`no crowns found.`);
	  
      const description = validCrowns
		.sort((a,b) => (args[0] == `--rand`) ? b.plays - getRandomInt(1, b.plays * 2) : (args[0] == `--alph`) ? a.albname.localeCompare(b.albname) : (args[0] == `--len`) ? b.albname.length - a.albname.length : b.plays - a.plays)
		.slice(0, 10);
        //.map(x => (x.plays != 1) ? `${++num}. [${x.albname}](${x.url} '${x.name} - ${x.albname}')${x.glitch} → **${x.plays}** scrobbles` : `${++num}. [${x.albname}](${x.url} '${x.name} - ${x.albname}')${x.glitch} → **${x.plays}** scrobble`)
		//.join(`\n`) + `\n\ntotal amount of album crowns: **${validCrowns.length}**`;
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
        //.setDescription(description)
        .setFooter(footer, message.author.displayAvatarURL());
	  for(var i = 0; i < description.length; i++){
	     if(description[i]){
		   embed.addField(`${++num}. ` + description[i].name, `[` + description[i].albname + `]` + `(` + description[i].url + ` '${description[i].name} - ${description[i].albname}')` + description[i].glitch);
		   embed.addField(`**${description[i].plays}** ${(description[i].plays != 1) ? `scrobbles` : `scrobble`}`, `\u200B`, true);
		 }
	  } 
      const msg = await message.channel.send({ embed });
      if (validCrowns.length > 10) {
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(userCrowns.length / 10);
        let offset = 0, page = 1;
        const func = async off => {
          let num = off;
          const description = validCrowns
			.sort((a,b) => (args[0] == `--rand`) ? b.plays - getRandomInt(1, b.plays * 2) : (args[0] == `--alph`) ? a.albname.localeCompare(b.albname) : (args[0] == `--len`) ? b.albname.length - a.albname.length : b.plays - a.plays)
            .slice(off, off + 10);
			/*
			.map(x => (x.plays != 1) ? `${++num}. [${x.albname}](${x.url} '${x.name} - ${x.albname}')${x.glitch} → **${x.plays}** scrobbles` : `${++num}. [${x.albname}](${x.url} '${x.name} - ${x.albname}')${x.glitch} → **${x.plays}** scrobble`)
            .join(`\n`) + `\n\ntotal amount of album crowns: **${validCrowns.length}**`;
			*/
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
