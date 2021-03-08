const Command = require(`../classes/Command`);
const Library = require(`../lib/index`);
const List = require(`../classes/List`);
const { fetchuser } = require(`../utils/fetchuser`);

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

function abbrNum(number, decPlaces) {
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
    var abbrev = [ "k", "m", "b", "t" ];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
             if((number == 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
}


exports.run = async (client, message) => {
    try {
	  const fetchUser = new fetchuser(client, message);
      const lib = new Library(client.config.lastFM.apikey);
      const Users = client.sequelize.import(`../models/Users.js`);
	  var member_array = [];
	  var guild = await message.guild.members.fetch().then(function(data){
			
			for (const [id, member] of data) {
				//id_array.push(id);
				member_array.push(member);
			}
			
		});
      const users = await Users.findAll({
        where: {
          discordUserID: member_array.map(x => x.id)
        }
      });
	  
	  var user_id_array = users
		  .map(x => {
			  return {
				lastfm: x.get(`lastFMUsername`),
				id: x.get(`discordUserID`)
			  };
			});

      if (!users.length) {
        await message.reply(`no one is registered to the bot in this server.`);
        this.context.reason = `No users found.`;
        throw this.context;
      }
	  
	  //console.log(user_id_array);
	  
	  var guildsize = user_id_array.length - 1;
	  
	  var rand_user = user_id_array[getRandomInt(0, guildsize)];
	  //console.log(rand_user);
	  var user_lastfm = await fetchUser.usernameFromId(rand_user.id);
	  var user_fetch = await lib.user.getInfo(user_lastfm);
	  var user_playcount = parseInt(user_fetch.user.playcount);
	  
	  //console.log(rand_user);
	  
	  var user_discord = ``;
	  for(var mem = 0; mem < member_array.length; mem++){
		 if(rand_user.id == member_array[mem].user.id){
			user_discord += member_array[mem].user.username;
		 }
	  }
	  
	  var track_artist = "";
	  var div = 1;
	  while (track_artist == ""){
		  try{
			var rand = getRandomInt(2, (user_playcount-1)/2);
			var track_fetch = await lib.user.getRecentTracks(rand_user.lastfm, 1, rand);
			var track = track_fetch.recenttracks.track[0];
			if(track[`@attr`]){
				track = track_fetch.recenttracks.track[1];
			}
			track_artist = track.artist[`#text`];
			artist = "";
			
			div = track_artist.split(` `);
			for (var i = 0; i < div.length; i++){
				str = div[i].shuffle();
				artist += str;
				artist += ` `;
			}
			const req = await lib.artist.getInfo(track_artist, user_lastfm);
			const tags = req.artist.tags.tag;
			const num = abbrNum(req.artist.stats.listeners,1);
			const tagField = tags.map(t => `\`${t.name}\``).join(` ● `);
			await message.channel.send(`\`` + user_discord + `\`` + ` **(` + req.artist.stats.userplaycount + ` scrobbles)**\n\`` + num + ` listeners on last.fm\`\n` + tagField + `\n\n\`` + artist.toUpperCase().slice(0, -1) + `\``);
			//await message.channel.send(track1.url);
		  }
		  catch(e){
			 console.error(e);
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
	  console.error(e);
      this.context.stack = e.stack;
      throw this.context;
	  
    }
  };

exports.help = {
  name: `g`,
  description: `Guess the artist.`,
  usage: `g`
};
