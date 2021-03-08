const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = (args[0]) ? message.mentions.users.first() : message.author;
  

  if (discordUser !== undefined) {
    var user = await fuser.rymById(discordUser.id);
	var num = await fuser.rppById(discordUser.id);
	//await message.channel.send(user);

    if (user) {
      await message.channel.send(`\`${discordUser.username}'s\` recent ratings: https://rateyourmusic.com/collection/${user}/r0.5-5.0,ss.dd,n${num}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `rr`,
  description: `Gets the most recent ratings from another user's rym account (or yours by default).`,
  usage: `rr [Discord User]`,
  notes: `The looked up user must be logged in to rym with the bot.`
};
