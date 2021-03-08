const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const { Op } = require(`sequelize`);
const Library = require(`../lib/index.js`);
const ReactionInterface = require(`../utils/ReactionInterface`);

const sortingFunc = (a, b) => (parseInt(b.plays) - parseInt(a.plays) == 0) ? a.name.localeCompare(b.name) : parseInt(b.plays) - parseInt(a.plays);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

exports.run = async (client, message, args) => {
  const fetchUser = new fetchuser(client, message);
  const fetchTrack = new fetchtrack(client, message);
  const lib = new Library(client.config.lastFM.apikey);
  const orig_art = args.join(` `);
  var msg = null;
  try {
    const Users = client.sequelize.import(`../models/Users.js`);
    const ACrowns = client.sequelize.import(`../models/ACrowns.js`);
	const Albums = client.sequelize.import(`../models/Albums.js`);
    const Notifs = client.sequelize.import(`../models/Notifs.js`);
	const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
	const Time = client.sequelize.import(`../models/Time.js`);
	var lastScrobbled = 0;
    let overallName = args.join(` `);
	let overallName2 = overallName.split(` | `);
	let artistName = overallName2[0];
	let albumName = overallName2[1];
	
    const user = await fetchUser.username();
    if (!overallName[0]) {
      if (!user) return message.reply(`you haven't registered your Last.fm ` +
      `account, therefore, I can't check what you're listening to. To set ` +
      `your Last.fm nickname, do \`&login <lastfm username>\`.`);
      var track = await fetchTrack.getcurrenttrack();
      if (!track[`@attr`]){
		const fuser = await fetchUser.getById(message.author.id);
		var data3 = await lib.user.getRecentTracks(user);
		track = data3.recenttracks.track[0];
		artistName = track.artist[`#text`];
		albumName = track.album[`#text`];
		lastScrobbled = 1;
	  }
      else{
		  artistName = track.artist[`#text`];
		  albumName = track.album[`#text`];
	  }
    }
	else{
		artistName = overallName2[0];
		albumName = overallName2[1];
	}
	
	
	var time_before = Date.now();
	const know = [];
	var data;
	try{
		data = await lib.album.getInfo(artistName, albumName);
	}
	catch(e){
		console.error(e);
		var embed = new MessageEmbed()
		  .setColor(message.member.displayColor)
		  .setAuthor(artistName + ` — ` + albumName, `https://i.imgur.com/AyfxHoW.gif`)
		  .setTitle(`E R R O R. . .`)
		  .setDescription(`the album was not found on Last.fm.`)
		  .setFooter(`invoked by ` + message.author.username, message.author.displayAvatarURL());
		msg = await message.channel.send({embed});
		return msg;
	}
	const art_data = await lib.artist.getInfo(artistName);
	message.react(`✅`);
	//message.channel.startTyping();
	
	var time = await Time.findAll({
		where: {
			guildID: message.guild.id,
			isAlbum: `true`
		}
		
	});
	
	//console.log(time.length);
	//console.log(data.album.image[3][`#text`]);
	var time_avg = 0;
	if (time.length > 0){
		var time_sum = 0;
		for (var t = 0; t < time.length; t++){
			time_sum += parseFloat(time[t].ms);
		}
		time_avg = ((time_sum/time.length)/1000).toFixed(2);
	}
	if(lastScrobbled == 0){
		var embed = new MessageEmbed()
		  .setColor(message.member.displayColor)
		  .setAuthor(data.album.artist + ` — ` + data.album.name, `https://i.imgur.com/tOuSBYf.gif`)
		  .setTitle(`L O A D I N G. . .`)
		  .setDescription(message.guild.name + `'s avg album crown check time: \`` + time_avg + ` seconds\``)
		  .setThumbnail(data.album.image[2][`#text`])
		  .setFooter(`invoked by ` + message.author.username, message.author.displayAvatarURL());
		msg = await message.channel.send({embed});
	}
	else{
		var embed = new MessageEmbed()
		  .setColor(message.member.displayColor)
		  .setAuthor(data.album.artist + ` — ` + data.album.name, `https://i.imgur.com/tOuSBYf.gif`)
		  .setTitle(`L O A D I N G. . .\nNOTE: cannot fetch currently playing track. the last album scrobbled is being used.`)
		  .setDescription(message.guild.name + `'s avg album crown check time: \`` + time_avg + ` seconds\``)
		  .setThumbnail(data.album.image[2][`#text`])
		  .setFooter(`invoked by ` + message.author.username, message.author.displayAvatarURL());
		msg = await message.channel.send({embed});
	}
	

	/*
	var albumObj = await Albums.findOne({
	  where: {
		artistName: data.album.artist,
		albumName: data.album.name
	  }
	});
	*/
	
	
    const hasCrown = await ACrowns.findOne({
	  where: {
		guildID: message.guild.id,
		artistName: data.album.artist,
		albumName: data.album.name
	  }
	});
	
	var origKing = ``;
	var origKingPlays = ``;
	var origKingUser = ``;
	if(hasCrown != null){
		origKing = hasCrown.userID;
	}
	
	var id_array = [];
	var member_array = [];
    var guild = await message.guild.members.fetch().then(function(data){
		
		for (const [id, member] of data) {
			id_array.push(id);
			member_array.push(member);
		}
		
	});
	
	
	var i = 0;
	var i = 0;
	 for (const id of id_array) {
		 const use = await fetchUser.usernameFromId(id);
		 if(use){
			i++;
		 }
    }
	
	if(i >= 5){
		await msg.react(`1️⃣`);
	}
	
	
	
	var count = 0;
	var counter = 0;
	var total = 0;
	var listeners = 0;
    for (var mem = 0; mem < member_array.length; mem++) {
	  var id = member_array[mem].id;
	  var member = member_array[mem];
      const user = await fetchUser.usernameFromId(id);
      if (!user) continue;
	  count++;
	  if((i >= 5) && (count % Math.floor(i/5) == 0)){
			counter++;
			if(counter + 1 == 2){
				await msg.react(`2️⃣`);
			}
			if(counter + 1 == 3){
				await msg.react(`3️⃣`);
			}
			if(counter + 1 == 4){
				await msg.react(`4️⃣`);
			}
			if(counter + 1 == 5){
				await msg.react(`5️⃣`);
			}
		}
	  
	  var req = await lib.album.getInfo(artistName, albumName, user);
	  
	  if(id == origKing){
		 if(req.album.userplaycount){
			 origKingPlays = req.album.userplaycount;
			 origKingUser = user;
		 }
		 else{
			 origKingPlays = `0`;
			 origKingUser = user;
			 continue;
		 } 
	  }

      if (!req.album.userplaycount) continue;
		
	  total += parseInt(req.album.userplaycount);
	  if(parseInt(req.album.userplaycount) > 0){
		  listeners++;
	  }
	  
      const data = {
        name: member.user.username,
        userID: member.user.id,
        plays: req.album.userplaycount
      };
      know.push(data);
    }
	    // Giving a top-ranking listener in the guild his crown, if he still has none.
    const sorted = know.sort(sortingFunc)[0];
	
	/*
	if (i > 4){
		await msg.react(`❗`);
	}
	*/
	var cc = 0;
	emoji_string = "🍓 🍎 🍉 🥝 🍍 🫐 🍌 🌽 🥭 🍈 🍕 🥕 🥓 🥫 🍜 🍨 🍭 🥨 🍰 ☕ 🍵 🍸 🍹 🧃 🍩 🌮 🍾 🧇 🍻 😎 🥰 🥵 🤯 😳 😏 😇 😱 🥸 💀 👻 👽 😈 🎭 🎹 🥁 🪘 🎷 🎺 🎸 🪕 🎻 🪗 🛰️ 🪃 🪀 🏓 🛹 🚀 🛸 ⚓ ⛵ 🏖️ 🏝️ 🏜️ 🌋 🌅 🌄 🌌 🐶 🐱 🦊 🐸 🐧 🐦 🐣 🦆 🦉 🦇 🐛 🦋 🐌 🐞 🐢 🦎 🦕 🐙 🦀 🐠 🦧 🐘 🦚 🦜 🦢 🐳 🦒 🦦 🦥 🦔 🌵 🍀 🍄 🪴 🌸 🐚 🌛 🌎 🪐 💫 ✨ 🌈 🌷 🌻 💿 📡 💎 ⚖️ 🧱 🧲 🔫 🧨 ⚰️ 🏺 🔮 🔭 💊 🧬 🦠 🎈 🎵 🍑 🧻 💯 ♻️ 👀 🤠 🤩 🗿 🥶 👹 👏 👑 💼 🧶 🎡 🌃 🥡 🪁 🏆 🚨 🚁 💸 💵 🧯 🕯️ 💉 🖍️ ⁉️ 🃏 🎴 🛡️ 💰 ⛩️ 🕵️ 🥷 🧙 🧙‍♀️ 🧙‍♂️ 🍒 🥩 💩 🎨 ✈️ 🪅 ❤️ 💙 💜 🚩"
	emoji_list = emoji_string.split(" ");
	rand_num = getRandomInt(0, emoji_list.length - 1);
	if(i >= 5){
		try{
			await msg.react(emoji_list[rand_num]);
		}
		catch(e){
			console.error(e);
		}
	}
	
	
	
	if (hasCrown === null && sorted.plays > `0`) {
      await ACrowns.create({
        guildID: message.guild.id,
        userID: sorted.userID,
		albumName: data.album.name,
        artistName: data.album.artist,
        albumPlays: sorted.plays,
		serverPlays: total,
		serverListeners: listeners,
		albumURL: data.album.url
      });
    }
	
	else if (hasCrown !== null) {
	  const userID = hasCrown.userID;
	  const isUser = await Users.findOne({
		where: {
		  [Op.or]: [{discordUserID: userID}, {discordUserID: sorted.userID}]
		}
	  });
	  await ACrowns.update({
		  serverPlays: total,
		  serverListeners: listeners,
		  albumURL: data.album.url
		},
		{
		  where: {
			guildID: message.guild.id,
			albumName: data.album.name,
			artistName: data.album.artist
		  }
		});
	  var plays = hasCrown.albumPlays;
	  if(!id_array.includes(origKing)){
		  try{
			await ACrowns.update({
			  userID: sorted.userID,
			  albumPlays: sorted.plays
			},
			{
			  where: {
				guildID: message.guild.id,
				albumName: data.album.name,
				artistName: data.album.artist
			  }
			});
			const notifiable = await Notifs.findOne({
			  where: {
				userID: userID
			  }
			});
			if (notifiable && isUser) client.emit(`crownTaken`, {
			  prevOwner: userID,
			  newOwner: sorted.userID,
			  guild: message.guild.name,
			  artist: data.album.artist,
			  album: data.album.name
			});
			const notifiableW = await WNotifs.findOne({
			  where: {
				userID: sorted.userID
			  }
			});
			if (notifiableW && isUser) client.emit(`crownWon`, {
			  prevOwner: userID,
			  newOwner: sorted.userID,
			  guild: message.guild.name,
			  artist: data.album.artist,
			  album: data.album.name
			});
		  }
		  catch(e){
			 console.log(e);
		  }
	  }
	  if (parseInt(sorted.plays) > parseInt(plays) || (parseInt(origKingPlays) != parseInt(plays) && parseInt(sorted.plays) > 0)){
			try{
				var kingPlays = -1;
				for(var tries = 0; tries < 10; tries++){
				   var orig = await lib.album.getInfo(artistName, albumName, origKingUser);
				   if (parseInt(orig.album.userplaycount) > 1 || orig.album.userplaycount == `0`){
					   kingPlays = parseInt(orig.album.userplaycount);
					   break;
				   }
				}
				//console.log(kingPlays);
				if(kingPlays >= parseInt(sorted.plays)){
					sorted.plays = kingPlays;
					sorted.userID = origKing;
				}
				if(kingPlays >= 0){
					await ACrowns.update({
					  userID: sorted.userID,
					  albumPlays: sorted.plays
					},
					{
					  where: {
						guildID: message.guild.id,
						albumName: data.album.name,
						artistName: data.album.artist
					  }
					});
					const notifiable = await Notifs.findOne({
					  where: {
						userID: userID
					  }
					});
					if (notifiable && isUser) client.emit(`crownTaken`, {
					  prevOwner: userID,
					  newOwner: sorted.userID,
					  guild: message.guild.name,
					  artist: data.album.artist,
					  album: data.album.name
					});
					const notifiableW = await WNotifs.findOne({
					  where: {
						userID: sorted.userID
					  }
					});
					if (notifiableW && isUser) client.emit(`crownWon`, {
					  prevOwner: userID,
					  newOwner: sorted.userID,
					  guild: message.guild.name,
					  artist: data.album.artist,
					  album: data.album.name
					});
				}
			}
			catch(e){
				console.log(e);
			}
		}
	}
	
		var time_after = Date.now();
		var time_diff = time_after - time_before;
		time_diff = time_diff.toString();
		await Time.create({
			ms: time_diff,
			isAlbum: `true`,
			guildID: message.guild.id
		});
	
		time_diff = parseFloat((parseFloat(time_diff)/1000).toFixed(2));
	
	if (know.length === 0 || know.every(x => x.plays === `0`)){
	  if(i >= 5){
		// await msg.reactions.removeAll();
	  }
      embed = new MessageEmbed()
		  .setColor(message.member.displayColor)
		  .setAuthor(data.album.artist + ` — ` + data.album.name, `https://i.imgur.com/tOuSBYf.gif`)
		  .setTitle(`No one in the server listens to \`` + data.album.artist + ` — ` + data.album.name + `\`.`)
		  .setThumbnail(data.album.image[2][`#text`])
		  .setDescription(message.guild.name + `'s avg album crown check time: \`` + time_avg + ` seconds\`\nthis time took: \`` + time_diff + ` seconds\``)
		  .setFooter(`invoked by ` + message.author.username, message.author.displayAvatarURL());	  
		var edit = await msg.edit({embed});
		return edit;
	}
	
	/*
	if(time_diff > 5){
		var embed = new MessageEmbed()
		  .setColor(message.member.displayColor)
		  .setAuthor(data.album.artist + ` — ` + data.album.name, `https://i.imgur.com/tOuSBYf.gif`)
		  .setTitle(`L O A D I N G. . .`)
		  .setDescription(message.guild.name + `'s avg album crown check time: \`` + time_avg + ` seconds\`\nthis time took: \`` + time_diff + ` seconds\``);
		await msg.edit({embed});
		await sleep(1500);
	}
	*/
	if(i >= 5){
		// await msg.reactions.removeAll();
	}
    know.sort(sortingFunc);
    let x = 0;
	var sortList = know.sort(sortingFunc);
    const description = sortList
      .slice(0, 10)
      .filter(k => k.plays !== `0`)
      .map(k => (parseInt(k.plays) != 1) ? `${++x}. ${k.name} → **${k.plays}** scrobbles (` + parseFloat(((parseFloat(k.plays)/parseFloat(total))*100).toFixed(2)) + `%)` : `${++x}. ${k.name} → **${k.plays}** scrobble (` + parseFloat(((parseFloat(k.plays)/parseFloat(total))*100).toFixed(2)) + `%)`) 
      .join(`\n`);
    embed = new MessageEmbed()
      .setColor(message.member.displayColor)
	  .setAuthor(data.album.artist, `https://i.imgur.com/bCeKwDd.gif`, art_data.artist.url)
      .setTitle(`*${data.album.name}*`)
      .setURL(data.album.url)
	  .setThumbnail(data.album.image[2][`#text`])
      .setDescription(description)
	  .setFooter((listeners != 1) ? `${total} scrobbles | ${listeners} listeners | ` + parseFloat((parseFloat(total)/parseFloat(listeners)).toFixed(2)) + ` avg\nthis crown check took ` + time_diff + ` seconds` : (total != 1) ? `${total} scrobbles | ${listeners} listener | ` + parseFloat((parseFloat(total)/parseFloat(listeners)).toFixed(2)) + ` avg\nthis crown check took ` + time_diff + ` seconds` : `${total} scrobble | ${listeners} listener | ` + parseFloat((parseFloat(total)/parseFloat(listeners)).toFixed(2)) + ` avg\nthis crown check took ` + time_diff + ` seconds`, message.author.displayAvatarURL())
      //.setTimestamp();
    await msg.edit({embed});
	 //message.channel.stopTyping();
	if (know.filter(k => k.plays !== `0`).length > 10) {
		await msg.reactions.removeAll();
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(know.filter(k => k.plays !== `0`).length / 10);
        let offset = 0, page = 1;
        const func = async off => {
          let num = off;
          const description = sortList
			.slice(off, off + 10)
			.filter(k => k.plays !== `0`)
			.map(k => (parseInt(k.plays) != 1) ? `${++num}. ${k.name} → **${k.plays}** scrobbles (` + parseFloat(((parseFloat(k.plays)/parseFloat(total))*100).toFixed(2)) + `%)` : `${++num}. ${k.name} → **${k.plays}** scrobble (` + parseFloat(((parseFloat(k.plays)/parseFloat(total))*100).toFixed(2)) + `%)`) 
			.join(`\n`);
			const embed = new MessageEmbed()
			  .setColor(message.member.displayColor)
			  .setAuthor(data.album.artist, `https://i.imgur.com/bCeKwDd.gif`, art_data.artist.url)
			  .setTitle(`*${data.album.name}*`)
			  .setURL(data.album.url)
			  .setThumbnail(data.album.image[2][`#text`])
			  .setDescription(description)
			  .setFooter((listeners != 1) ? `${total} scrobbles | ${listeners} listeners | ` + parseFloat((parseFloat(total)/parseFloat(listeners)).toFixed(2)) + ` avg\nthis crown check took ` + time_diff + ` seconds` : (total != 1) ? `${total} scrobbles | ${listeners} listener | ` + parseFloat((parseFloat(total)/parseFloat(listeners)).toFixed(2)) + ` avg\nthis crown check took ` + time_diff + ` seconds` : `${total} scrobble | ${listeners} listener | ` + parseFloat((parseFloat(total)/parseFloat(listeners)).toFixed(2)) + ` avg\nthis crown check took ` + time_diff + ` seconds`, message.author.displayAvatarURL())
			await msg.edit({embed});
	};
        const toFront = () => {
          if (page !== length) {
            offset += 10, page++;
            func(offset);
          }
        };
        const toBack = () => {
          if (page !== 1) {
            offset -= 10, page--;
            func(offset);
          }
        };
		const emptyFunc = () => {
        };
        await rl.setKey(client.snippets.arrowLeft, toBack);
        await rl.setKey(client.snippets.arrowRight, toFront);
		await rl.setKey(emoji_list[rand_num], emptyFunc);
     }
	
  }

catch (e) {
    if (e.name !== `SequelizeUniqueConstraintError`) {
      console.error(e);
	  if(msg != null){
		  var embed = new MessageEmbed()
			  .setColor(message.member.displayColor)
			  .setAuthor(`Oh no!`, `https://i.imgur.com/AyfxHoW.gif`)
			  .setTitle(`E R R O R. . .`)
			  .setDescription(`an unexpected error occurred. Last.fm may be experiencing issues.`)
			  .setFooter(`invoked by ` + message.author.username, message.author.displayAvatarURL());
		  var edit = await msg.edit({embed});
		  return edit;
	  }
	  else{
		  var embed = new MessageEmbed()
			  .setColor(message.member.displayColor)
			  .setAuthor(`Oh no!`, `https://i.imgur.com/AyfxHoW.gif`)
			  .setTitle(`E R R O R. . .`)
			  .setDescription(`an unexpected error occurred. Last.fm may be experiencing issues.`)
			  .setFooter(`invoked by ` + message.author.username, message.author.displayAvatarURL());
		  await message.channel.send({embed});
		  
	  }
	}
  }
};

exports.help = {
  name: `a`,
  description: `**A**LBUM: Checks if anyone in a guild listens to a certain album. If ` +
  `no album is defined, the bot will try to look up the album you are ` +
  `currently listening to.`,
  usage: `a <artist name> | <album name>`,
  notes: `This feature might be quite slow, because it sends a lot of API ` +
  `requests. Also, it only works in a guild. Similar to the -wk command.`
};
