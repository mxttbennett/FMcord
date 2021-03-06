const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const { MessageEmbed } = require(`discord.js`);

exports.run = async (client, message, args) => {
  const lib = new Library(client.config.lastFM.apikey);
  try {
    const fetchUser = new fetchuser(client, message);
    const username = await fetchUser.username();
    let artistName;
    if (args.length === 0) {
      const fetchTrack = new fetchtrack(client, message);
      const currTrack = await fetchTrack.getcurrenttrack();
      if (!currTrack) return message.reply(`currently, you are not listening ` +
      `to anything.`);
      artistName = currTrack.artist[`#text`];
    } else if (args[0]) {
      artistName = args.join(` `);
    } else {
      return message.reply(`you must provide a name of your artist!`);
    }
    const data = await lib.artist.getInfo(artistName, username);
    const { name, url } = data.artist;
    const { listeners, playcount, userplaycount } = data.artist.stats;
    const { summary } = data.artist.bio;
    const tags = data.artist.tags.tag;
    const color = message.member ? message.member.displayColor : 16777215;
    const tagField = tags.map(t => `[${t.name}](${t.url})`).join(` - `);
    const href = `<a href="${url}">Read more on Last.fm</a>`;
    const desc = summary.slice(0, summary.length - href.length - 1);
    const embed = new MessageEmbed()
      .setTitle(`Information about ${name}`)
      .setColor(color)
      .addField(`Listeners:`, listeners, true)
      .addField(`Scrobbles:`, playcount, true);
    if (tags.length > 0)
      embed.addField(`Tags:`, tagField, true);
    if (userplaycount)
      embed.addField(`User play count: `, userplaycount, true);
    if (desc.length > 0)
      embed.addField(`Summary:`, desc, true);
    embed
      .setFooter(`Command executed by ${message.author.tag}`, message.author.displayAvatarURL())
      .setURL(url)
      .setTimestamp();
    await message.channel.send({ embed });
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `artistinfo`,
  description: `Returns information about a provided artist.`,
  usage: `artistinfo <artist name>`,
};
