const { fetchuser } = require(`../utils/fetchuser2.js`);

exports.run = async (client, message, args) => {
	await message.reply(`you are my everlovin' - Henry <https://bit.ly/2XUc87w>`);
};

exports.help = {
  name: `flynt`,
  description: `See for yourself.`,
  usage: `flynt`,
};
