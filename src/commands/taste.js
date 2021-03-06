const { MessageEmbed } = require(`discord.js`);
const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);

const matchErr = `you can't compare your taste with your taste, ` +
`that's illogical.`;

const difference = (a, b) => {
  if (a > b) return a - b;
  else return b - a;
};

exports.run = async (client, message, args) => {
  const fetchUser = new fetchuser(client, message);
  const lib = new Library(client.config.lastFM.apikey);
  try {
    if (!args[0]) return message.reply(`specify a user you want to compare ` +
    `tastes with!`);

    const author = await fetchUser.username();
    if (!author) return message.reply(client.snippets.noLogin);
    let userID;
    const mention = message.mentions.users.first();
    if (mention && mention.id === message.author.id)
      return message.reply(matchErr);
    if (mention) userID = mention.id;
    else {
      const typed = mention ? mention.id : message.guild.members.find(x => {
        const user = args.join(` `).toLowerCase();
        return user === x.user.username.toLowerCase();
      });
      if (typed) {
        if (typed.id === message.author.id) return message.reply(matchErr);
        else userID = typed.id;
      }
    }
    if (!userID) return message.channel.send(`Couldn't find the user ` +
    `in Discord. Make sure you provided a valid user correctly and try again!`);
    const user = await fetchUser.usernameFromId(userID);
    if (!user) return message.channel.send(`This user hasn't logged ` +
    `on to my system.`);
    const authorData = await lib.user.getTopArtists(author);
    const userData = await lib.user.getTopArtists(user);
    const matches = [];
    for (const a of userData.topartists.artist) {
      const match = authorData.topartists.artist.find(x => x.name === a.name);
      if (match) {
        const playcounts = [parseInt(match.playcount), parseInt(a.playcount)];
        const diff = difference(...playcounts);
        const data = {
          name: match.name,
          authorPlays: match.playcount,
          userPlays: a.playcount,
          difference: diff,
        };
        if (matches.length !== 10) matches.push(data);
        else break;
      }
    }
    if (matches.length === 0) return message.reply(`you and `
    + `${user} share no common artists.`);
    matches.sort((a, b) => a.difference - b.difference);
    const embed = new MessageEmbed()
      .setColor(message.member.displayColor)
      .setTitle(`${author} and ${user} taste comparison`)
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Command invoked by ${message.author.tag}`);
    matches.forEach(m => {
      const comp = `${m.authorPlays} plays - ${m.userPlays} plays`;
      embed.addField(`${m.name}`, comp, true);
    });
    await message.channel.send({embed});
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `taste`,
  description: `Compares artists you and a mentioned user listen to, and ` +
  `amounts of plays you both have.`,
  usage: `taste <user mention>`,
  notes: `This only works in a guild and only if both of the users are ` +
  `registered to the bot.`
};
