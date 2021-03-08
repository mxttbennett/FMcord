const Command = require(`../classes/Command`);
const Library = require(`../lib/index`);
const List = require(`../classes/List`);

const removeParens = str => str
  .replace(`(`, `%28`)
  .replace(`)`, `%29`)
  .replace(`[`, `%5B`)
  .replace(`]`, `%5D`);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}


exports.run = async (client, message) => {
    try {
      if (message.author.id === `542248338406375439`) {
        this.context.reason = `Saf tried to use the command.`;
        throw this.context;
      }
      const lib = new Library(client.config.lastFM.apikey);
      const Users = client.sequelize.import(`../models/Users.js`);
      const users = await Users.findAll({
        where: {
          discordUserID: message.guild.members.map(x => x.id)
        }
      });
      if (!users.length) {
        await message.reply(`no one is registered to the bot in this server.`);
        this.context.reason = `No users found.`;
        throw this.context;
      }
      const names = new List(...users.map(x => ({
        discord: message.guild.members.get(x.discordUserID).user.username,
        lastFM: x.lastFMUsername
      })));
      const username = names.random;
      const userURL = `https://last.fm/user/${username.lastFM}`;
	  const scrob = await lib.user.getInfo(username.lastFM);
	  const count = scrob.user.playcount;
	  var a = parseInt(count);
	  //var rand = getRandomInt(1, a);
	  
	  var n = "";
	  while (n == ""){
		  try{
			var rand = getRandomInt(1, a/2);			  
			user = await lib.user.getTopTracks(username.lastFM, `overall`, `1`, rand);
			const track1 = user.toptracks.track[0];
			n = track1.name;
			song = "";
			m = track1.artist.name;
			/*
			div = m.split(` `);
			for (var i = 0; i < div.length; i++){
				str = div[i].shuffle();
				song += str;
				song += ` `;
			}
			*/
			await message.channel.send(`track #` + rand + ` from ` + `\`` + username.discord + `\`` + ` (lfm: ` + username.lastFM + `)`);
			await message.channel.send(`<` + track1.url + `>`);
		  }
		  catch{
			  
			  //await message.channel.send(`error test`);
		  }
	  }
	  
	  /*
      const trackInfo = await lib.track.getInfo(track.artist.name, track.name);
      const { artist, name, url, album, toptags } = trackInfo.track;
      const embed = new FMcordEmbed(message)
        .setTitle(`Random song from ${username.lastFM} (${username.discord})`)
        .setURL(userURL)
        .addField(`Artist`, `[${artist.name}](${removeParens(artist.url)})`, true)
        .addField(`Track`, `[${name}](${removeParens(url)})`, true);
      if (album) {
        embed.addField(`Album`, `[${album.title}](${removeParens(album.url)})`, true);
        if (album.image.length > 0) {
          embed.setThumbnail(album.image[1][`#text`]);
        }
      }
      embed.addField(`Listens by ${username.lastFM}`, track.playcount, true);
      if (toptags.tag.length > 0) {
        embed.addField(`Tags`, toptags.tag.map(x => `[${x.name}](${x.url})`).join(` - `), true);
      }
      await message.channel.send(embed);
      return this.context;
	  */
}catch (e) {

      this.context.stack = e.stack;
      throw this.context;
	  
    }
  };

exports.help = {
  name: `lucky`,
  description: `Picks a random song that a user in the server has scrobbled.`,
  usage: `lucky`
};
