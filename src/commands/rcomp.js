const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = (args[0]) ? message.mentions.users.first() : message.author;
  

  if (discordUser !== undefined) {
    var user = await fuser.rymById(discordUser.id);
	
	//await message.channel.send(user);

    if (user) {
      await message.channel.send(`\`${discordUser.username}'s\` comparison page. Check your compatibility here: https://rateyourmusic.com/compare?to=${user}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `rcomp`,
  description: `Gets the RYM comparison page of a user.`,
  usage: `rstat [Discord User]`,
};
