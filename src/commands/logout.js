const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message) => {
  const fetchUser = new fetchuser(client, message);
  const Users = client.sequelize.import(`../models/Users.js`);
  try {
    const user = await fetchUser.get();
    if (!user) return message.reply(`your instance hasn't been found.`);
    await Users.destroy({
      where: {
        discordUserID: message.author.id,
      }
    });
    await message.reply(`you've been logged off from your last.fm & rym accounts `
    + `succesfully!`);
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `logout`,
  description: `Logs your accounts out of the bot's system.`,
  usage: `logout`
};
