const { MessageEmbed } = require(`discord.js`);
const ReactionInterface = require(`../utils/ReactionInterface`);

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

exports.run = async (client, message) => {
  try {
    let num = 0;
    const Crowns = client.sequelize.import(`../models/Crowns.js`);
    const users = await Crowns.findAll({
      where: {
        guildID: message.guild.id
      }
    });
	var length = users.length;
	var values = [];
    let amounts = new Map();
	var id_array = [];
	var username_array = [];
	await message.guild.members.fetch().then(function(data){
		
		//console.log(data.has(message.author.id));
		for (const [id, member] of data) {
			id_array.push(id);
			username_array.push(member.user.username);
			//member_array.push(member);
		}
		
	});
    var base = users
      .filter(u => id_array.includes(u.userID));
	
	for(var i = 0; i < base.length; i++){
		
		for(var x = 0; x < id_array.length; x++){
			
			if(base[i].userID == id_array[x]){
				
				base[i].serverPlays = username_array[x];
				
			}
		}
		
	}
	
	var id_been_added = [];
	var username_been_added = [];
	
    base.forEach(u => {
		  if (id_been_added.includes(u.userID + u.serverPlays)) {
			let amount = amounts.get(u.userID + `#@^!&*` + u.serverPlays);
				amounts.set(u.userID + `#@^!&*` + u.serverPlays, ++amount);
		  } else {
				//console.log(2);
				id_been_added.push(u.userID + u.serverPlays);
				//username_been_added.push(username_array[x]);
				amounts.set(u.userID + `#@^!&*` + u.serverPlays, 1);
			}
    });
    amounts = Array.from(amounts).sort((a, b) => b[1] - a[1]);
    const authorPos = amounts.findIndex(x => x[0].split(`#@^!&*`)[0] === message.author.id);
    var desc = amounts
      .slice(0, 10)
      .map(x => `${++num}. **${x[0].split(`#@^!&*`)[1]}** → **${x[1]}** crowns (` + parseFloat(parseFloat((parseFloat(x[1])/parseFloat(users.length))*100).toFixed(2)) + `%)`)
      .join(`\n`);
    if (authorPos !== -1) desc += `\n\nYour position is: **${authorPos + 1}**`;
	if (authorPos !== -1){
		desc += `\nTotal number of artist crowns: **${users.length}**`;
	}
	else{
		desc += `\n\nTotal number of artist crowns: **${users.length}**`;
	}
    const embed = new MessageEmbed()
      .setTitle(`:crown:  artist crown leaderboard  :crown:`)
      .setColor(message.member.displayColor)
      .setThumbnail(message.guild.iconURL)
      .setDescription(desc)
      .setFooter(`invoked by ${message.author.username}`, message.author.displayAvatarURL())
	const msg = await message.channel.send({ embed });
	if (amounts.length > 10) {
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(amounts.length / 10);
        let offset = 0, page = 1;
        const func = async off => {
		  let num = off;
		  var desc = amounts
			  .slice(off, off + 10)
			  .map(x => `${++num}. **${x[0].split(`#@^!&*`)[1]}** → **${x[1]}** crowns (` + parseFloat(parseFloat((parseFloat(x[1])/parseFloat(users.length))*100).toFixed(2)) + `%)`)
			  .join(`\n`);
		  if (authorPos !== -1) desc += `\n\nYour position is: **${authorPos + 1}**`;
		  if (authorPos !== -1){
			desc += `\nTotal number of artist crowns: **${users.length}**`;
			}
			else{
				desc += `\n\nTotal number of artist crowns: **${users.length}**`;
			}
          const embed = new MessageEmbed()
			  .setTitle(`:crown:  artist crown leaderboard  :crown:`)
			  .setColor(message.member.displayColor)
			  .setThumbnail(message.guild.iconURL)
			  .setDescription(desc)
			  .setFooter(`invoked by ${message.author.username}`, message.author.displayAvatarURL())
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
  }
};

exports.help = {
  name: `cb`,
  description: `**C**ROWN**B**OARD: Provides you a list of people with the most artist crowns in the guild.`,
  usage: `cb`
};
