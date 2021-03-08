const { fetchuser } = require(`../utils/fetchuser`);


exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = (args[0]) ? message.mentions.users.first() : message.author;
  
  

  if (discordUser !== undefined) {
	var ch = await fuser.chartById(discordUser.id);
	if(ch != null){
		await message.reply(ch);
	}
	else{
		await message.reply(`chart not set`);
	}
  } else {
    await message.reply(`that is not a valid user.`);
  }
};

exports.help = {
  name: `ch`,
  description: `USER **CH**ART: Fetches the chart you set with a URL.`,
  usage: `ch`,
  notes: `chart needs to be set with \`-chset\` before usage.`
};
