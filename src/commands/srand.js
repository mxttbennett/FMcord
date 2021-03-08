const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = (args[0]) ? message.mentions.users.first() : message.author;
      await message.reply(`you rolled the dice! http://rateyourmusic.com/misc/random`);
};

exports.help = {
  name: `srand`,
  description: `Provides the rym random release link. Roll the dice :0)`,
  usage: `srand`,
};
