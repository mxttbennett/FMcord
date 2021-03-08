const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, message);
  const Users = client.sequelize.import(`../models/Users.js`);
  const username = args.join(` `);
  var logs = username.split(` | `,2);
  //return message.reply(logs[0] + " " + logs[1]); 
  var rymname = logs[1];
  
  if (!args[0]) return message.reply(`you must define a last.fm username! You may define an rym username as well, but it is not necessary.`);

  try {
    const data = await lib.user.getInfo(logs[0]);
    const alreadyExists = await fetchUser.get();
    if (alreadyExists) return message.reply(`you already have logged in via ` +
    `this bot! Please do \`${client.config.prefix}logout\` if you want to ` +
    `use a different last.fm and/or rym account.`);
	
	if(rymname != null && rymname != ``){
		await Users.create({
		  discordUserID: message.author.id,
		  lastFMUsername: logs[0],
		  RYMUsername: logs[1]
		});
	}
	else{
		await Users.create({
		  discordUserID: message.author.id,
		  lastFMUsername: logs[0]
		});
	}
	
	if(rymname != null && rymname != ``){
		await message.reply(`your last.fm username \`${data.user.name}\` & rym username \`${rymname}\` ` +
		`have been registered to this bot! Note that you won't be able to ` +
		`perform any administrative actions to these accounts.`);
	}
	else{
		await message.reply(`your last.fm username \`${data.user.name}\` ` +
		`has been registered to this bot! Note that you won't be able to ` +
		`perform any administrative actions to this account.`);
	}
  } catch (e) {
    console.log(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `login`,
  description: `Logs your last.fm account and, optionally, your rym account into the bot system.`,
  usage: `login your_last.fm_username | your_rym_username`,
  notes: `You will only be registered to the bot. You won't be able to ` +
  `perform any administrative actions to your last.fm account (or rym account), and no ` +
  `one else will be able to do so through the bot.`
};
