const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
  var user = await fuser.rymById(discordUser.id);
  var max = await fuser.maxById(discordUser.id);
	

	
	if (user) {
		if(parseInt(max) > 0){
		var arr = [];
		for(var i = 1; i < max + 1; i++){
			arr.push(i);
		}
		shuffle(arr);
		const description = `[Rating No. ` + arr[0] + `](` + `https://rateyourmusic.com/collection/${user}/r0.5-5.0,ss.d,n1/` + arr[0] + `)`;
		const embed = new MessageEmbed()
				.setTitle(`🎲  Rating Randomizer (MAX: ` + max + `)  🎲`)
				.setColor(message.member.displayColor)
				.setDescription(description)
				.setFooter(`page no. 1 | set max with -max #_of_rym_ratings`, message.author.displayAvatarURL());
		const msg = await message.channel.send({ embed });
			if (parseInt(max) > 1) {
				const rl = new ReactionInterface(msg, message.author);
				const length = arr.length;
				let offset = 0, page = 1;
				const func = async off => {
				  let num = off;
				  const description = `[Rating No. ` + arr[off] + `](` + `https://rateyourmusic.com/collection/${user}/r0.5-5.0,ss.d,n1/` + arr[off] + `)`;
				  const embed = new MessageEmbed()
					.setTitle(`🎲  Rating Randomizer (MAX: ` + max + `)  🎲`)
					.setColor(message.member.displayColor)
					.setDescription(description)
					.setFooter(`page no. ${page} | set max with -max #_of_rym_ratings`, message.author.displayAvatarURL());
				  await msg.edit({ embed });
				};
				const toFront = () => {
				  if (page !== length) {
					offset += 1, page++;
					func(offset);
				  }
				};
				const toBack = () => {
				  if (page !== 1) {
					offset -= 1, page--;
					func(offset);
				  }
				};
				await rl.setKey(client.snippets.arrowLeft, toBack);
				await rl.setKey(client.snippets.arrowRight, toFront);
			}
		}
		else{
			await message.reply(`you need to set your number of rym ratings. you can do so with \`-max\` \`#_of_rym_ratings\``); 
		}
	}
	else {
      await message.reply(`you are not logged into rym.`);
	}
};

exports.help = {
  name: `rand`,
  description: `Picks a random album from the user's rym ratings. The total number of ratings is set with the \`-max\` command.`,
  usage: `rand`,
  notes: `Set your total number of ratings the -max command. (\`-max\` \`#_of_rym_ratings\`)`
};
