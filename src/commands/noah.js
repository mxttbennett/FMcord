const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
	await message.channel.send(`that is the **worst** opinion i have ***EVER***  heard.`);
};

exports.help = {
  name: `noah`,
  description: `A tribute to our friend noah, who often has some controversial opinions.`,
  usage: `noah`,
};
