const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const discordUser = message.author;

  if (discordUser.id == 175199958314516480) {
	await message.channel.send(`Restarting FMcord...`);
    return process.exit();
  }
  else{
	  await message.reply(`You do not have access to this command! Only the bot owner is able to restart FMcord.`);
  }
};

exports.help = {
  name: `r`,
  description: `Restarts the bot.`,
  usage: `r`,
  notes: `Only the bot owner is able to restart FMcord.`
};
