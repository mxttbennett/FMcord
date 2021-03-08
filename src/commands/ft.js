const Library = require(`../lib/index.js`);
const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const ReactionInterface = require(`../utils/ReactionInterface`);
const { Op } = require(`sequelize`);
const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);



exports.run = async (client, message) => {
  try {
    const lib = new Library(client.config.lastFM.apikey);
    const user = new fetchuser(client, message);
	const ACrowns = client.sequelize.import(`../models/ACrowns.js`);
	const Crowns = client.sequelize.import(`../models/Crowns.js`);

    if (await user.get()) {
      const ft = new fetchtrack(client, message);
      const track = await ft.getcurrenttrack(client, message);
	 
		if (track) {
			
			var album = track.album[`#text`].toString();
			var artist = track.artist[`#text`].toString();
			var alb = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20` + encodeURIComponent(album) + `%20release%20reviews%20ratings` + `%20site%3Arateyourmusic.com%2Frelease%2F`
			var art = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20artist%20songs%20discography%20biography` + `%20site%3Arateyourmusic.com/artist/`	
			const name = await user.usernameFromId(message.author.id);
			var fm_img = track.image[2][`#text`];
			var embed = new MessageEmbed()
				  .setColor(message.member.displayColor)
				  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
				  .setTitle(`**${track.name}**`)
				  .setDescription(`[**${track.artist[`#text`]}**]( ${art} 'search rym for ${artist} ')\n` +
				   `${track.album[`#text`] ? `[***` + track.album[`#text`] + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
				  .setThumbnail(fm_img)
				  .setFooter(`loading your data...`, `https://i.imgur.com/tOuSBYf.gif`)
			var msg = await message.channel.send({ embed });
				
			
			try{
				const data = await lib.album.getInfo(track.artist[`#text`], track.album[`#text`], name, 0);
				const art_data = await lib.artist.getInfo(track.artist[`#text`], name, 0);
				var fimg = `https://i.imgur.com/GBuQOhn.gif`

				
				
				var foot = ``;
				const userData = await lib.user.getInfo(await user.username());
				const albplay = data.album.userplaycount;
				const artplay = art_data.artist.stats.userplaycount;
				
				const hasCrown = await ACrowns.findOne({
				  where: {
					guildID: message.guild.id,
					albumName: data.album.name,
					artistName: data.album.artist
				  }
				});
				
				/*
				var artistCrowns = await Crowns.findAll({
					where: {
						guildID: message.guild.id,
						userID: message.author.id
					}
				});
				var albumCrowns = await ACrowns.findAll({
					where: {
						guildID: message.guild.id,
						userID: message.author.id
					}
				});
				
				var artCrownCount = artistCrowns.length;
				var albCrownCount = albumCrowns.length;
				
				*/
				
				if (hasCrown != null){
					if (hasCrown.userID === message.author.id){
						fimg = `https://i.imgur.com/bCeKwDd.gif`
					}
					else{
						fimg = `https://i.imgur.com/Qgo8myA.gif`
					}
				}
				
				
				//console.log(`fm_img: ` + fm_img);
				if(track.image[2][`#text`] == `https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png` && parseInt(albplay) == 0){
					var albumCrowns = await ACrowns.findAll({
						where: {
							albumName: album
						}
					});
					//console.log(albumCrowns);
					try{
						if (albumCrowns.length > 0){
							for(var i = 0; i < albumCrowns.length; i++){
								if(albumCrowns[i].artistName != artist){
									const data = await lib.album.getInfo(albumCrowns[0].artistName, albumCrowns[0].albumName, name, 0);
									fm_img = data.album.image[2][`#text`];
									break;
								}
							}
						}
					}
					catch(e){
						console.error(e);
					}
				}
				if (parseInt(artplay) > 0){
					if (parseInt(albplay) > 0){
						var foot = `scrobbles → ` +
								`all: ${userData.user.playcount} | artist: ${artplay} | album: ${albplay}`;
					}
					else{
						var foot = `scrobbles → ` +
						`all: ${userData.user.playcount} | artist: ${artplay}`;
					}
				}
				else{
					
					var foot = `scrobbles → ` +
					`all: ${userData.user.playcount}`;
							
				}
				//console.log(data.album.image[2][`#text`]);
				
				//foot += `\ncrowns → all: ${artCrownCount + albCrownCount} | artist: ${artCrownCount} | album: ${albCrownCount}`;
				
				// + `\n` + artCrownCount + ` artist crowns, ` + albCrownCount + ` album crowns`
				embed = new MessageEmbed()
				  .setColor(message.member.displayColor)
				  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
				  .setTitle(`**${track.name}**`)
				  .setDescription(`[**${track.artist[`#text`]}**]( ${art} 'search rym for ${artist} ')\n` +
				   `${track.album[`#text`] ? `[***` + track.album[`#text`] + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
				  .setThumbnail(fm_img)
				  .setFooter(foot, fimg)
				await msg.edit({ embed });
				// await message.channel.send(`test`);
				
				try {
					const Users = client.sequelize.import(`../models/Users.js`);
					const Crowns = client.sequelize.import(`../models/Crowns.js`);
					const Artists = client.sequelize.import(`../models/Artists.js`);
					const Notifs = client.sequelize.import(`../models/Notifs.js`);
					const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
					const know = [];
					
					const data = await lib.artist.getInfo(artist);

					const guild = await message.guild.fetchMembers();
					
					
					const hasCrown = await Crowns.findOne({
					  where: {
						guildID: message.guild.id,
						artistName: data.artist.name,
					  }
					});
					
					var origKing = ``;
					var origKingPlays = ``;
					var origKingUser = ``;
					if(hasCrown != null){
						origKing = hasCrown.userID;
					}
					
					var total = 0;
					var listeners = 0;
					for (const [id, member] of guild.members) {
					  const lfmusername = await user.usernameFromId(id);
					  if (!lfmusername) continue;
					  const req = await lib.artist.getInfo(artist, lfmusername);
					  
					  if(member.user.id == origKing){
						if(req.artist.stats.userplaycount){
						   origKingPlays = req.artist.stats.userplaycount;
						   origKingUser = lfmusername;
						}
						else{
							 origKingPlays = `0`;
							 origKingUser = lfmusername;
							 continue;
						 } 
					  }
					  
					  if (!req.artist.stats.userplaycount) continue;
					  
					  total += parseInt(req.artist.stats.userplaycount);
					  if(parseInt(req.artist.stats.userplaycount) > 0){
						  listeners++;
					  }

					  const data = {
						name: member.user.username,
						userID: member.user.id,
						plays: req.artist.stats.userplaycount	
					  };
					  know.push(data);
					}

					// Giving a top-ranking listener in the guild his crown, if he still has none.
					const sorted = know.sort(sortingFunc)[0];

					if (hasCrown === null && sorted.plays !== `0`) {
					  await Crowns.create({
						guildID: message.guild.id,
						userID: sorted.userID,
						artistName: data.artist.name,
						artistPlays: sorted.plays,
						serverPlays: total,
						serverListeners: listeners,
						artistURL: data.artist.url
					  });
					}


					else if (hasCrown !== null) {
					  const userID = hasCrown.userID;
					  const isUser = await Users.findOne({
						where: {
						  [Op.or]: [{discordUserID: userID}, {discordUserID: sorted.userID}]
						}
					  });
					await Crowns.update({
					  serverPlays: total,
					  serverListeners: listeners,
					  artistURL: data.artist.url
					},
					{
					  where: {
						guildID: message.guild.id,
						artistName: data.artist.name
					  }
					});
					  var plays = hasCrown.artistPlays;
					if (parseInt(sorted.plays) > parseInt(plays) || (parseInt(origKingPlays) != parseInt(plays) && parseInt(sorted.plays) > 0)){
					  try{
						var kingPlays = -1;
						for(var i = 0; i < 10; i++){
						   var orig = await lib.artist.getInfo(artist, origKingUser);
						   if (parseInt(orig.artist.stats.userplaycount) > 1 || orig.artist.stats.userplaycount == `0`){
							   kingPlays = parseInt(orig.artist.stats.userplaycount);
							   break;
						   }
						}
						if(kingPlays >= parseInt(sorted.plays)){
							sorted.plays = kingPlays;
							sorted.userID = origKing;
						}
						if(kingPlays >= 0){
							await Crowns.update({
							  userID: sorted.userID,
							  artistPlays: sorted.plays
							},
							{
							  where: {
								guildID: message.guild.id,
								artistName: data.artist.name
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
							  artist: data.artist.name
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
							  artist: data.artist.name
							});
						}
					 }
					 catch(e){
						console.error(e);
					  }
					 }
					}
										
				  } catch (e) {
					if (e.name !== `SequelizeUniqueConstraintError`) {
					  console.error(e);
					  //await message.channel.send(client.snippets.error);
					}
				  }
				
				
				try {
					const Users = client.sequelize.import(`../models/Users.js`);
					const ACrowns = client.sequelize.import(`../models/ACrowns.js`);
					const Albums = client.sequelize.import(`../models/Albums.js`);
					const Notifs = client.sequelize.import(`../models/Notifs.js`);
					const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
					const know = [];
					const data = await lib.album.getInfo(artist, album);

					const guild = await message.guild.fetchMembers();
					
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
					
					var total = 0;
					var listeners = 0;
					for (const [id, member] of guild.members) {
					  const lfmusername = await user.usernameFromId(id);
					  if (!lfmusername) continue;
					  const req = await lib.album.getInfo(artist, album, lfmusername);
					  
					  if(member.user.id == origKing){
						if(req.album.userplaycount){
						   origKingPlays = req.album.userplaycount;
						   origKingUser = lfmusername;
						}
						else{
							 origKingPlays = `0`;
							 origKingUser = lfmusername;
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

					const sorted = know.sort(sortingFunc)[0];

					if (hasCrown === null && sorted.plays !== `0`) {
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
					 if (parseInt(sorted.plays) > parseInt(plays) || (parseInt(origKingPlays) != parseInt(plays) && parseInt(sorted.plays) > 0)){
					  try{
						var kingPlays = -1;
						for(var i = 0; i < 10; i++){
						   var orig = await lib.album.getInfo(artist, album, origKingUser);
						   if (parseInt(orig.album.userplaycount) > 1 || orig.album.userplaycount == `0`){
							   kingPlays = parseInt(orig.album.userplaycount);
							   break;
						   }
						}
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
					
					
				  } catch (e) {
					if (e.name !== `SequelizeUniqueConstraintError`) {
					  console.error(e);
					  //await message.channel.send(client.snippets.error);
					}
				  }
			}
				catch (e){
				if (e.name !== `SequelizeUniqueConstraintError`) {
					  console.error(e);
				}
				try{
					//console.log(`here`);
					const art_data = await lib.artist.getInfo(track.artist[`#text`], name, 1);
					var album = track.album[`#text`].toString();
					var artist = track.artist[`#text`].toString();
					var alb = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20` + encodeURIComponent(album) + `%20release%20reviews%20ratings` + `%20site%3Arateyourmusic.com%2Frelease%2F`
					var art = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20artist%20songs%20discography%20biography` + `%20site%3Arateyourmusic.com/artist/`
					
					
					var fimg = `https://i.imgur.com/GBuQOhn.gif`
					
					const userData = await lib.user.getInfo(await user.username());
					const artplay = art_data.artist.stats.userplaycount;

					
					if (parseInt(artplay) > 0){
						var foot = `scrobbles → ` +
						`all: ${userData.user.playcount} | artist: ${artplay}`;
					}
					else{
						var foot = `scrobbles → ` +
						`all: ${userData.user.playcount}`;
								
					}
					
					/*
					var artistCrowns = await Crowns.findAll({
					where: {
						guildID: message.guild.id,
						userID: message.author.id
					}
					});
					
					
					var artCrownCount = artistCrowns.length;
					var albCrownCount = albumCrowns.length;
					
					foot += `\ncrowns → all: ${artCrownCount + albCrownCount} | artist: ${artCrownCount} | album: ${albCrownCount}`;
					*/
					var fm_img = track.image[2][`#text`];
					if(track.image[2][`#text`] == `https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png`){
						var albumCrowns = await ACrowns.findAll({
							where: {
								albumName: album
							}
						});
						
						try{
							if (albumCrowns.length > 0){
								for(var i = 0; i < albumCrowns.length; i++){
									if(albumCrowns[i].artistName != artist){
										const data = await lib.album.getInfo(albumCrowns[0].artistName, albumCrowns[0].albumName, name, 0);
										fm_img = data.album.image[2][`#text`];
										break;
									}
								}
							}
						}
						catch(e){
							console.error(e);
						}
					}
					//console.log(`here`);
					
					const embed = new MessageEmbed()
					  .setColor(message.member.displayColor)
					  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
					  .setTitle(`**${track.name}**`)
					  .setDescription(`[**${track.artist[`#text`]}**]( ${art} 'search rym for ${artist} ')\n` +
					   `${track.album[`#text`] ? `[***` + track.album[`#text`] + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
					  .setThumbnail(fm_img)
					  .setFooter(foot, fimg)
					await msg.edit({ embed });
					
					try {
						const Users = client.sequelize.import(`../models/Users.js`);
						const Crowns = client.sequelize.import(`../models/Crowns.js`);
						const Artists = client.sequelize.import(`../models/Artists.js`);
						
						const Notifs = client.sequelize.import(`../models/Notifs.js`);
						const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
						const know = [];
						const data = await lib.artist.getInfo(artist);

						const guild = await message.guild.fetchMembers();
						
						const hasCrown = await Crowns.findOne({
						  where: {
							guildID: message.guild.id,
							artistName: data.artist.name,
						  }
						});
						
						var origKing = ``;
						var origKingPlays = ``;
						origKingUser = ``;
						if(hasCrown != null){
							origKing = hasCrown.userID;
						}
						
						var total = 0;
						var listeners = 0;
						for (const [id, member] of guild.members) {
						  const lfmusername = await user.usernameFromId(id);
						  if (!lfmusername) continue;
						  const req = await lib.artist.getInfo(artist, lfmusername);
						  
						  if(member.user.id == origKing){
							if(req.artist.stats.userplaycount){
							   origKingPlays = req.artist.stats.userplaycount;
							   origKingUser = lfmusername;
							}
							else{
								 origKingPlays = `0`;
								 origKingUser = lfmusername;
								 continue;
							 } 
						  }
						  
						  if (!req.artist.stats.userplaycount) continue;
							
						  total += parseInt(req.artist.stats.userplaycount);
						  if(parseInt(req.artist.stats.userplaycount) > 0){
							  listeners++;
						  }
						  
						  const data = {
							name: member.user.username,
							userID: member.user.id,
							plays: req.artist.stats.userplaycount	
						  };
						  know.push(data);
						}

						const sorted = know.sort(sortingFunc)[0];

						if (hasCrown === null && sorted.plays !== `0`) {
						  await Crowns.create({
							guildID: message.guild.id,
							userID: sorted.userID,
							artistName: data.artist.name,
							artistPlays: sorted.plays,
							serverPlays: total,
							serverListeners: listeners,
							artistURL: data.artist.url
						  });
						}


						else if (hasCrown !== null) {
						  const userID = hasCrown.userID;
						  const isUser = await Users.findOne({
							where: {
							  [Op.or]: [{discordUserID: userID}, {discordUserID: sorted.userID}]
							}
						  });
						  await Crowns.update({
							  serverPlays: total,
							  serverListeners: listeners,
							  artistURL: data.artist.url
							},
							{
							  where: {
								guildID: message.guild.id,
								artistName: data.artist.name
							  }
							});
						  var plays = hasCrown.artistPlays;
						  if (parseInt(sorted.plays) > parseInt(plays) || (parseInt(origKingPlays) != parseInt(plays) && parseInt(sorted.plays) > 0)){
						  try{
							var kingPlays = -1;
							for(var i = 0; i < 10; i++){
							   var orig = await lib.artist.getInfo(artist, origKingUser);
							   if (parseInt(orig.artist.stats.userplaycount) > 1 || orig.artist.stats.userplaycount == `0`){
								   kingPlays = parseInt(orig.artist.stats.userplaycount);
								   break;
							   }
							}
							if(kingPlays >= parseInt(sorted.plays)){
								sorted.plays = kingPlays;
								sorted.userID = origKing;
							}
							if(kingPlays >= 0){
								await Crowns.update({
								  userID: sorted.userID,
								  artistPlays: sorted.plays
								},
								{
								  where: {
									guildID: message.guild.id,
									artistName: data.artist.name
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
								  artist: data.artist.name
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
								  artist: data.artist.name
								});
							 }
							}
							catch(e){
								console.error(e);
							  }
						   }
						}
											
					  } catch (e) {
						if (e.name !== `SequelizeUniqueConstraintError`) {
						  console.error(e);
						  //await message.channel.send(client.snippets.error);
						}
					  }
				
				}
				catch{
					var album = track.album[`#text`].toString();
					var artist = track.artist[`#text`].toString();
					var alb = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20` + encodeURIComponent(album) + `%20release%20reviews%20ratings` + `%20site%3Arateyourmusic.com%2Frelease%2F`
					var art = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20artist%20songs%20discography%20biography` + `%20site%3Arateyourmusic.com/artist/`
					
					
					var fimg = `https://i.imgur.com/GBuQOhn.gif`
					
					const userData = await lib.user.getInfo(await user.username());
					var foot = `scrobbles → all: ${userData.user.playcount}`;
					
					/*
					var artistCrowns = await Crowns.findAll({
					where: {
						guildID: message.guild.id,
						userID: message.author.id
					}
					});
					var albumCrowns = await ACrowns.findAll({
						where: {
							guildID: message.guild.id,
							userID: message.author.id
						}
					});
					
					var artCrownCount = artistCrowns.length;
					var albCrownCount = albumCrowns.length;
					
					foot += `\ncrowns → all: ${artCrownCount + albCrownCount} | artist: ${artCrownCount} | album: ${albCrownCount}`;
				
					*/
					const embed = new MessageEmbed()
					  .setColor(message.member.displayColor)
					  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
					  .setTitle(`**${track.name}**`)
					  .setDescription(`[**${track.artist[`#text`]}**]( ${art} 'search rym for ${artist} ')\n` +
					   `${track.album[`#text`] ? `[***` + track.album[`#text`] + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
					  .setThumbnail(track.image[2][`#text`])
					  .setFooter(foot, fimg)
					await msg.edit({ embed });
				}
			}
		  } 
		  else {
					
				const fetchUser = new fetchuser(client, message);
				const user = await fetchUser.username();
				var recents = await lib.user.getRecentTracks(user);
				const track = recents.recenttracks.track[0];
				const name = await fetchUser.usernameFromId(message.author.id);
				let foot = `cannot fetch currently playing track.\nthis is the last track scrobbled.`;
				var fimg = `https://i.imgur.com/GBuQOhn.gif`
				
				var album = track.album[`#text`].toString();
				var artist = track.artist[`#text`].toString();
				var alb = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20` + encodeURIComponent(album) + `%20release%20reviews%20ratings` + `%20site%3Arateyourmusic.com%2Frelease%2F`
				var art = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20artist%20songs%20discography%20biography` + `%20site%3Arateyourmusic.com/artist/`
				
				/*
				var artistCrowns = await Crowns.findAll({
					where: {
						guildID: message.guild.id,
						userID: message.author.id
					}
					});
					var albumCrowns = await ACrowns.findAll({
						where: {
							guildID: message.guild.id,
							userID: message.author.id
						}
					});
					
				var artCrownCount = artistCrowns.length;
				var albCrownCount = albumCrowns.length;
				*/	
					
					
				const embed = new MessageEmbed()
					.setColor(message.member.displayColor)
					.setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
					.setTitle(`**${track.name}**`)
					.setDescription(`[**${track.artist[`#text`]}**]( ${art} 'search rym for ${artist} ')\n` +
				   `${track.album[`#text`] ? `[***` + track.album[`#text`] + `***]( ${alb} 'search rym for ${artist} - ${album}' )` : `[no album]`}`, true)
					.setThumbnail(track.image[2][`#text`])
					.setFooter(foot)
					
				const msg = await message.channel.send({ embed });
				
		  }
    } else {
      await message.reply(client.snippets.noLogin);
    }
	
}  catch (e) {
    console.error(e);
		try{
				const fetchUser = new fetchuser(client, message);
				const user = await fetchUser.username();
				var recents = await lib.user.getRecentTracks(user);
				const track = recents.recenttracks.track[0];
				const name = await fetchUser.usernameFromId(message.author.id);
				let foot = `cannot fetch currently playing track.\nthis is the last track scrobbled.`;
				var fimg = `https://i.imgur.com/GBuQOhn.gif`
				
				var album = track.album[`#text`].toString();
				var artist = track.artist[`#text`].toString();
				var alb = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20` + encodeURIComponent(album) + `%20release%20reviews%20ratings` + `%20site%3Arateyourmusic.com%2Frelease%2F`
				var art = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20artist%20songs%20discography%20biography` + `%20site%3Arateyourmusic.com/artist/`
				
				/*
				var artistCrowns = await Crowns.findAll({
					where: {
						guildID: message.guild.id,
						userID: message.author.id
					}
					});
					var albumCrowns = await ACrowns.findAll({
						where: {
							guildID: message.guild.id,
							userID: message.author.id
						}
					});
					
				var artCrownCount = artistCrowns.length;
				var albCrownCount = albumCrowns.length;
				*/	
					
					
				const embed = new MessageEmbed()
					.setColor(message.member.displayColor)
					.setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
					.setTitle(`**${track.name}**`)
					.setDescription(`[**${track.artist[`#text`]}**]( ${art} 'search rym for ${artist} ')\n` +
				   `${track.album[`#text`] ? `[***` + track.album[`#text`] + `***]( ${alb} 'search rym for ${artist} - ${album}' )` : `[no album]`}`, true)
					.setThumbnail(track.image[2][`#text`])
					.setFooter(foot)
					
				const msg = await message.channel.send({ embed });
		}
		catch{
			message.reply(`an error occurred. Last.fm may be experiencing issues at the moment.`);
		}
	 }
		  
    

};
exports.help = {
  name: `f`,
  description: `Posts the song you are listening to right now or the last one scrobbled if no currently playing song is detected on last.fm.`,
  usage: `f`
};


