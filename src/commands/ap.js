const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);

exports.run = async (client, message, args) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, message);
  const fetchTrack = new fetchtrack(client, message);
  try {
	let overallName = args.join(` `);
	let overallName2 = overallName.split(` | `);
	let artistName = overallName2[0];
	let albumName = overallName2[1];
    const user = await fetchUser.username();
    if (!overallName[0]) {
      if (!user) return message.reply(`you haven't registered your Last.fm ` +
      `account, therefore, I can't check what you're listening to. To set ` +
      `your Last.fm nickname, do \`&login <lastfm username\`.`);
      const track = await fetchTrack.getcurrenttrack();
      if (!track[`@attr`])
        return message.reply(`currently, you are not listening to anything.`);
      else {
		  artistName = track.artist[`#text`];
		  albumName = track.album[`#text`];
	  }
    }
    if (!user) return message.reply(client.snippets.noLogin);
    const data = await lib.album.getInfo(artistName, albumName, user);
	const data2 = await lib.artist.getInfo(artistName, user);
	
    if (!data.album.userplaycount) await message.reply(`you haven't ` +
    `scrobbled \`${data2.artist.name} - ${data.album.name}\`.`);
    else await message.reply(`you have scrobbled  \`${data2.artist.name}\`  —  \`${data.album.name}\`  ` +
    `**${data.album.userplaycount}** times.`);

  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `ap`,
  description: `**A**LBUM **P**LAYS: Shows you how many times you have played an album. If no ` +
  `album is defined, the bot will look up the album you are currently ` +
  `listening to.`,
  usage: `ap <artist name> | <album name>`
};
