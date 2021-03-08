const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  //const vals = args[0].split(` `);
  const discordUser = message.author;
  var size = args.length;
  var year = args[0];
  

  if (discordUser !== undefined) {
    var user = await fuser.rymById(discordUser.id);
	var num = await fuser.rppById(discordUser.id);
	//await message.channel.send(user);

    if (user) {
	await message.channel.send(`\`${discordUser.username}'s\` ratings from ${year}: https://rateyourmusic.com/collection/${user}/strm_relyear,ss.rd.r0.5-5.0,n${num}/${year}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `ry`,
  description: `Fetches your ratings for a specified year.`,
  usage: `ry [year or decade]`,
  notes: `The user must be logged in to rym with the bot.`
};
