const { MessageEmbed } = require(`discord.js`);

exports.run = async (client, message) => {
  try {
    const dev = client.users.get(client.config.botOwnerID);
    const shared = client.guilds.filter(x => x.members.has(message.author.id));
    const color = message.member ? message.member.displayColor : 16777215;
    const embed = new MessageEmbed()
      .setTitle(`FMcord information`)
      .setThumbnail(client.user.avatarURL)
      .addField(`Total servers:`, client.guilds.size, true)
      .addField(`Total users:`, client.users.size, true)
      .addField(`Used library:`, `discord.js`, true)
      .addField(`Developed by:`, `${dev.tag} and contributors`, true)
      .addField(`Amount of servers shared with the command invoker:`, shared.size, true)
      .setFooter(`Command executed by ${message.author.tag}`, message.author.displayAvatarURL())
      .setTimestamp()
      .setColor(color);
    await message.channel.send({ embed });
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `botinfo`,
  description: `Shows general information about FMcord.`,
  usage: `botinfo`
};
