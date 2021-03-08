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
				  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
				  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n` +
				   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
				  .setThumbnail(fm_img)
				  .setFooter(`loading your data...`, `https://i.imgur.com/tOuSBYf.gif`)
			var msg = await message.channel.send({ embed });
				
			
			try{
				const data = await lib.album.getInfo(track.artist[`#text`], track.album[`#text`].split(`*`).join(`&ast`), name);
				const art_data = await lib.artist.getInfo(track.artist[`#text`], name);
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
				
				var orig_fimg = fimg;
				var albumArtist = null;
				//console.log(`fm_img: ` + fm_img);
				
				
				
				/*
				
				** VARIOUS ARTISTS CORRECTOR **
				
				if(track.image[2][`#text`] == `https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png` && parseInt(albplay) == 0){
					
					if(artist == `King Crimson`){
						
						if(album.split(`Court`).join(`afsoihosahioiahfoia`) != album){
							
							fimg = `https://i.imgur.com/GWaFWGs.png`;
						}
						
					}
					else{
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
										albumArtist = data.album.artist;
										break;
									}
								}
							}
						}
						catch(e){
							console.error(e);
						}
					}
				}
				*/
				
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
				
				
			if(albumArtist != null){
				alb = `https://www.google.com/search?q=` + encodeURIComponent(albumArtist) + `%20` + encodeURIComponent(album) + `%20release%20reviews%20ratings` + `%20site%3Arateyourmusic.com%2Frelease%2F`
				art = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20artist%20songs%20discography%20biography` + `%20site%3Arateyourmusic.com/artist/`
			
				embed = new MessageEmbed()
				  .setColor(message.member.displayColor)
				  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
				  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
				  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n[${`**` + albumArtist + `**`}\n` +
				   `***${track.album[`#text`].split(`*`).join(`&ast`)}***](${alb} 'search rym for ${albumArtist} - ${album}')`, true)
				  .setThumbnail(fm_img)
				  .setFooter(foot, fimg)
				await msg.edit({ embed });
				
				var altData = await lib.album.getInfo(albumArtist, album, name, 0);
				if (parseInt(altData.album.userplaycount) > 0){
					foot += ` | album: ` + altData.album.userplaycount;
					
					try{
						var albumArray = [];
						var artistArray =[];
						var weekRank = -1;
						var orig_artist = artist;
						var orig_album = album;
						for (var i = 0; i < 4; i++){
							var weekAlbums = await lib.user.getTopAlbums(name, `7day`, 300, i + 1);
							//console.log(weekAlbums);
							var { album } = weekAlbums.topalbums;
							var tempAlbumArray = [];
							var tempArtistArray = [];
							album.forEach(a => tempArtistArray.push(`${a.artist.name}`));
							album.forEach(a => tempAlbumArray.push(`${a.name}`));
							if(tempAlbumArray.length == 0 || tempArtistArray.length == 0){
								break;
							}
							album.forEach(a => artistArray.push(`${a.artist.name}`));
							album.forEach(a => albumArray.push(`${a.name}`));
							
							
							for(var j = 0; j < albumArray.length; j++){
								if(artistArray[j].toUpperCase() == altData.album.artist.toUpperCase() && albumArray[j].toUpperCase() == altData.album.name.toUpperCase()){
									weekRank = j + 1;
									//console.log(j + 1);
									break;
								}
							}
							
							if(weekRank != -1){
								break;
							}
							
						}
						
						artist = orig_artist;
						album = orig_album;
						
						var last_foot = foot;

						if(weekRank > -1){
							foot += `\nalbum ranks → w: #` + weekRank;
							embed = new MessageEmbed()
							  .setColor(message.member.displayColor)
							  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
							  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
							  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n[${`**` + albumArtist + `**`}\n` +
							   `***${track.album[`#text`].split(`*`).join(`&ast`)}***](${alb} 'search rym for ${albumArtist} - ${album}')`, true)
							  .setThumbnail(fm_img)
							  .setFooter(foot, fimg)
							await msg.edit({ embed });
						}
					}
					catch(e){
						console.error(e);
					}
						
					
					try{
						var albumArray = [];
						var artistArray =[];
						var monthRank = -1;
						var orig_artist = artist;
						var orig_album = album;
						for (var i = 0; i < 10; i++){
							var monthAlbums = await lib.user.getTopAlbums(name, `1month`, 300, i + 1);
							var { album } = monthAlbums.topalbums;
							var tempAlbumArray = [];
							var tempArtistArray = [];
							album.forEach(a => tempArtistArray.push(`${a.artist.name}`));
							album.forEach(a => tempAlbumArray.push(`${a.name}`));
							if(tempAlbumArray.length == 0 || tempArtistArray.length == 0){
								break;
							}
							album.forEach(a => artistArray.push(`${a.artist.name}`));
							album.forEach(a => albumArray.push(`${a.name}`));
							
							
							for(var j = 0; j < albumArray.length; j++){
								
								if(artistArray[j].toUpperCase() == altData.album.artist.toUpperCase() && albumArray[j].toUpperCase() == altData.album.name.toUpperCase()){
									monthRank = j + 1;
									//console.log(j + 1);
									break;
								}
							}
							
							if(monthRank != -1){
								break;
							}
							
						}
						
						artist = orig_artist;
						album = orig_album;
						
						last_foot = foot;

						if(monthRank > -1){
							if(weekRank == -1){
								foot += `\nalbum ranks → m: #` + monthRank;
							}
							else{
								foot += ` | m: #` + monthRank;
							}
							embed = new MessageEmbed()
							  .setColor(message.member.displayColor)
							  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
							  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
							  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n[${`**` + albumArtist + `**`}\n` +
							   `***${track.album[`#text`].split(`*`).join(`&ast`)}***](${alb} 'search rym for ${albumArtist} - ${album}')`, true)
							  .setThumbnail(fm_img)
							  .setFooter(foot, fimg)
							await msg.edit({ embed });
						}
					}
					catch(e){
						console.error(e);
					}
					
					try{
						var albumArray = [];
						var artistArray =[];
						var yearRank = -1;
						var orig_artist = artist;
						var orig_album = album;
						for (var i = 0; i < 50; i++){
							var yearAlbums = await lib.user.getTopAlbums(name, `12month`, 350, i + 1);
							var { album } = yearAlbums.topalbums;
							var tempAlbumArray = [];
							var tempArtistArray = [];
							album.forEach(a => tempArtistArray.push(`${a.artist.name}`));
							album.forEach(a => tempAlbumArray.push(`${a.name}`));
							if(tempAlbumArray.length == 0 || tempArtistArray.length == 0){
								break;
							}
							album.forEach(a => artistArray.push(`${a.artist.name}`));
							album.forEach(a => albumArray.push(`${a.name}`));
							
							
							for(var j = 0; j < albumArray.length; j++){
								
								if(artistArray[j].toUpperCase() == altData.album.artist.toUpperCase() && albumArray[j].toUpperCase() == altData.album.name.toUpperCase()){
									yearRank = j + 1;
									//console.log(j + 1);
									break;
								}
							}
							
							if(yearRank != -1){
								break;
							}
							
						}
						
						artist = orig_artist;
						album = orig_album;
						
						last_foot = foot;
						
						
						
						if(yearRank > -1){
							if(weekRank == -1 && monthRank == -1){
								foot += `\nalbum ranks → y: #` + yearRank;
							}
							else{
								foot += ` | y: #` + yearRank;
							}
						embed = new MessageEmbed()
						  .setColor(message.member.displayColor)
						  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
						  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
						  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n[${`**` + albumArtist + `**`}\n` +
						   `***${track.album[`#text`].split(`*`).join(`&ast`)}***](${alb} 'search rym for ${albumArtist} - ${album}')`, true)
						  .setThumbnail(fm_img)
						  .setFooter(foot, fimg)
						await msg.edit({ embed });
						}
					}
					catch(e){
						console.error(e);
					}
					
					try{
						var albumArray = [];
						var artistArray =[];
						var overallRank = -1;
						var orig_artist = artist;
						var orig_album = album;
						for (var i = 0; i < 100; i++){
							var overallAlbums = await lib.user.getTopAlbums(name, `overall`, 350, i + 1);
							var { album } = overallAlbums.topalbums;
							var tempAlbumArray = [];
							var tempArtistArray = [];
							album.forEach(a => tempArtistArray.push(`${a.artist.name}`));
							album.forEach(a => tempAlbumArray.push(`${a.name}`));
							if(tempAlbumArray.length == 0 || tempArtistArray.length == 0){
								break;
							}
							album.forEach(a => artistArray.push(`${a.artist.name}`));
							album.forEach(a => albumArray.push(`${a.name}`));
							
							
							
							for(var j = 0; j < albumArray.length; j++){
								
								if(artistArray[j].toUpperCase() == altData.album.artist.toUpperCase() && albumArray[j].toUpperCase() == altData.album.name.toUpperCase()){
									overallRank = j + 1;
									//console.log(j + 1);
									break;
								}
							}
							
							if(overallRank != -1){
								break;
							}
							
						}
						
						artist = orig_artist;
						album = orig_album;
						
						last_foot = foot;
						
						if(overallRank > -1){
							if(weekRank == -1 && monthRank == -1 && yearRank == -1){
								foot += `\nalbum rank → o: #` + overallRank;
							}
							else{
								foot += ` | o: #` + overallRank;
							}
							embed = new MessageEmbed()
							  .setColor(message.member.displayColor)
							  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
							  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
							  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n[${`**` + albumArtist + `**`}\n` +
							   `***${track.album[`#text`].split(`*`).join(`&ast`)}***](${alb} 'search rym for ${albumArtist} - ${album}')`, true)
							  .setThumbnail(fm_img)
							  .setFooter(foot, fimg)
						await msg.edit({ embed });
						
						}
						
					}
					catch(e){
						console.error(e);
					}
				}
				
			}
			else{
				embed = new MessageEmbed()
				  .setColor(message.member.displayColor)
				  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
				  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
				  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')${albumArtist != null ? `\n**` + albumArtist + `**` : ``}\n` +
				   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
				  .setThumbnail(fm_img)
				  .setFooter(foot, fimg)
				await msg.edit({ embed });
				
				if (parseInt(data.album.userplaycount) > 0){
					
				try{
					var albumArray = [];
					var artistArray =[];
					var weekRank = -1;
					var orig_artist = artist;
					var orig_album = album;
					for (var i = 0; i < 1; i++){
						var weekAlbums = await lib.user.getTopAlbums(name, `7day`, 300, i + 1);
						var { album } = weekAlbums.topalbums;
						var tempAlbumArray = [];
						var tempArtistArray = [];
						album.forEach(a => tempArtistArray.push(`${a.artist.name}`));
						album.forEach(a => tempAlbumArray.push(`${a.name}`));
						if(tempAlbumArray.length == 0 || tempArtistArray.length == 0){
							break;
						}
						album.forEach(a => artistArray.push(`${a.artist.name}`));
						album.forEach(a => albumArray.push(`${a.name}`));
						
						
						for(var j = 0; j < albumArray.length; j++){

							if(artistArray[j].toUpperCase() == data.album.artist.toUpperCase() && albumArray[j].toUpperCase() == data.album.name.toUpperCase()){
								weekRank = j + 1;
								//console.log(j + 1);
								break;
							}
						}
						
						if(weekRank != -1){
							break;
						}
						
					}
					
					artist = orig_artist;
					album = orig_album;
					
					var last_foot = foot;

					if(weekRank > -1){
						foot += `\nalbum ranks → w: #` + weekRank;
						embed = new MessageEmbed()
						  .setColor(message.member.displayColor)
						  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
						  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
						  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist}')\n` +
						   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
						  .setThumbnail(fm_img)
						  .setFooter(foot, fimg)
						await msg.edit({ embed });
					}
				}
				catch(e){
					console.error(e);
				}			
				
				try{
					var albumArray = [];
					var artistArray =[];
					var monthRank = -1;
					var orig_artist = artist;
					var orig_album = album;
					for (var i = 0; i < 3; i++){
						var monthAlbums = await lib.user.getTopAlbums(name, `1month`, 300, i + 1);
						var { album } = monthAlbums.topalbums;
						var tempAlbumArray = [];
						var tempArtistArray = [];
						album.forEach(a => tempArtistArray.push(`${a.artist.name}`));
						album.forEach(a => tempAlbumArray.push(`${a.name}`));
						if(tempAlbumArray.length == 0 || tempArtistArray.length == 0){
							break;
						}
						album.forEach(a => artistArray.push(`${a.artist.name}`));
						album.forEach(a => albumArray.push(`${a.name}`));
						
						
						for(var j = 0; j < albumArray.length; j++){
							
							if(artistArray[j].toUpperCase() == data.album.artist.toUpperCase() && albumArray[j].toUpperCase() == data.album.name.toUpperCase()){
								monthRank = j + 1;
								//console.log(j + 1);
								break;
							}
						}
						
						if(monthRank != -1){
							break;
						}
						
					}
					
					artist = orig_artist;
					album = orig_album;
					
					last_foot = foot;

					if(monthRank > -1){
						if(weekRank == -1){
							foot += `\nalbum ranks → m: #` + monthRank;
						}
						else{
							foot += ` | m: #` + monthRank;
						}
						embed = new MessageEmbed()
						  .setColor(message.member.displayColor)
						  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
						  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
						  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist}')\n` +
						   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
						  .setThumbnail(fm_img)
						  .setFooter(foot, fimg)
						await msg.edit({ embed });
					}
				}
				catch(e){
					console.error(e);
				}
				
				try{
					var albumArray = [];
					var artistArray =[];
					var yearRank = -1;
					var orig_artist = artist;
					var orig_album = album;
					for (var i = 0; i < 24; i++){
						var yearAlbums = await lib.user.getTopAlbums(name, `12month`, 350, i + 1);
						var { album } = yearAlbums.topalbums;
						var tempAlbumArray = [];
						var tempArtistArray = [];
						album.forEach(a => tempArtistArray.push(`${a.artist.name}`));
						album.forEach(a => tempAlbumArray.push(`${a.name}`));
						if(tempAlbumArray.length == 0 || tempArtistArray.length == 0){
							break;
						}
						album.forEach(a => artistArray.push(`${a.artist.name}`));
						album.forEach(a => albumArray.push(`${a.name}`));
						
						
						for(var j = 0; j < albumArray.length; j++){
							
							if(artistArray[j].toUpperCase() == data.album.artist.toUpperCase() && albumArray[j].toUpperCase() == data.album.name.toUpperCase()){
								yearRank = j + 1;
								//console.log(j + 1);
								break;
							}
						}
						
						if(yearRank != -1){
							break;
						}
						
					}
					
					artist = orig_artist;
					album = orig_album;
					
					last_foot = foot;
					
					
					
					if(yearRank > -1){
						if(weekRank == -1 && monthRank == -1){
							foot += `\nalbum ranks → y: #` + yearRank;
						}
						else{
							foot += ` | y: #` + yearRank;
						}
					embed = new MessageEmbed()
					  .setColor(message.member.displayColor)
					  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
					  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
					  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist}')\n` +
					   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
					  .setThumbnail(fm_img)
					  .setFooter(foot, fimg)
					await msg.edit({ embed });
					}
				}
				catch(e){
					console.error(e);
				}
				
				try{
					var albumArray = [];
					var artistArray = [];
					var scrobbleArray = [];
					var overallRank = -1;
					var overallScrob = -1;
					var orig_artist = artist;
					var orig_album = album;
					for (var i = 0; i < 60; i++){
						var overallAlbums = await lib.user.getTopAlbums(name, `overall`, 350, i + 1);
						var { album } = overallAlbums.topalbums;
						var tempAlbumArray = [];
						var tempArtistArray = [];
						album.forEach(a => tempArtistArray.push(`${a.artist.name}`));
						album.forEach(a => tempAlbumArray.push(`${a.name}`));
						if(tempAlbumArray.length == 0 || tempArtistArray.length == 0){
							break;
						}
						album.forEach(a => artistArray.push(`${a.artist.name}`));
						album.forEach(a => albumArray.push(`${a.name}`));
						album.forEach(a => scrobbleArray.push(`${a.playcount}`));
						
						for(var j = 0; j < albumArray.length; j++){
							
							if(artistArray[j].toUpperCase() == data.album.artist.toUpperCase() && albumArray[j].toUpperCase() == data.album.name.toUpperCase()){
								overallRank = j + 1;
								overallScrob = parseInt(scrobbleArray[i]);
								//console.log(j + 1);
								break;
							}
						}
						
						if(overallRank != -1){
							break;
						}
						
					}
					
					artist = orig_artist;
					album = orig_album;
					
					last_foot = foot;
					
					if(overallRank > -1){
						if(weekRank == -1 && monthRank == -1 && yearRank == -1){
							foot += `\nalbum rank → o: #` + overallRank;
						}
						else{
							foot += ` | o: #` + overallRank
						}
						
						
						embed = new MessageEmbed()
						  .setColor(message.member.displayColor)
						  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
						  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
						  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist}')\n` +
						   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
						  .setThumbnail(fm_img)
						  .setFooter(foot, fimg)
						await msg.edit({ embed });
					
					}
				}
				catch(e){
					console.error(e);
				}
			  }
			}
				
				try {
					var time_before = Date.now();
					const Users = client.sequelize.import(`../models/Users.js`);
					const ACrowns = client.sequelize.import(`../models/ACrowns.js`);
					const Albums = client.sequelize.import(`../models/Albums.js`);
					const Notifs = client.sequelize.import(`../models/Notifs.js`);
					const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
					const Time = client.sequelize.import(`../models/Time.js`);
					
					const know = [];
					const data = await lib.album.getInfo(artist, album);
					
					var id_array = [];
					var member_array = [];
					var guild = await message.guild.members.fetch().then(function(data){
						
						for (const [id, member] of data) {
							id_array.push(id);
							member_array.push(member);
						}
						
					});
					
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
					for (var mem = 0; mem < member_array.length; mem++) {
					  var id = member_array[mem].id;
					  var member = member_array[mem];
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
							 console.error(e);
						 }
					 }
					 else if (parseInt(sorted.plays) > parseInt(plays) || (parseInt(origKingPlays) != parseInt(plays) && parseInt(sorted.plays) > 0)){
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
					var time_after = Date.now();
					var time_diff = time_after - time_before;
					time_diff = time_diff.toString();
					await Time.create({
						ms: time_diff,
						isAlbum: `true`,
						guildID: message.guild.id
					});
					
					var crownHolder = await ACrowns.findOne({
						where: 	{
							guildID: message.guild.id,
							albumName: data.album.name,
							artistName: data.album.artist
							
						}
					});
					
					if(crownHolder != null){
						if(crownHolder.userID == message.author.id){
							fimg = `https://i.imgur.com/bCeKwDd.gif`;
						}
						else{
							fimg = `https://i.imgur.com/Qgo8myA.gif`;
						}
						
						if (fimg != orig_fimg){
							
							if(albumArtist != null){
									alb = `https://www.google.com/search?q=` + encodeURIComponent(albumArtist) + `%20` + encodeURIComponent(album) + `%20release%20reviews%20ratings` + `%20site%3Arateyourmusic.com%2Frelease%2F`
									art = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20artist%20songs%20discography%20biography` + `%20site%3Arateyourmusic.com/artist/`
								
									embed = new MessageEmbed()
									  .setColor(message.member.displayColor)
									  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
									  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
									  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n[${`**` + albumArtist + `**`}\n` +
									   `***${track.album[`#text`].split(`*`).join(`&ast`)}***](${alb} 'search rym for ${albumArtist} - ${album}')`, true)
									  .setThumbnail(fm_img)
									  .setFooter(foot, fimg)
									await msg.edit({ embed });
									
									
							}
							else{
							
								embed = new MessageEmbed()
								  .setColor(message.member.displayColor)
								  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
								  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
								  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n` +
								   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
								  .setThumbnail(fm_img)
								  .setFooter(foot, fimg)
								await msg.edit({ embed });
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
					var time_before = Date.now();
					const Users = client.sequelize.import(`../models/Users.js`);
					const Crowns = client.sequelize.import(`../models/Crowns.js`);
					const Artists = client.sequelize.import(`../models/Artists.js`);
					const Notifs = client.sequelize.import(`../models/Notifs.js`);
					const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
					const Time = client.sequelize.import(`../models/Time.js`);
					const know = [];
					const data = await lib.artist.getInfo(artist);

					var id_array = [];
					var member_array = [];
					var guild = await message.guild.members.fetch().then(function(data){
						
						for (const [id, member] of data) {
							id_array.push(id);
							member_array.push(member);
						}
						
					});
					
					
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
					for (var mem = 0; mem < member_array.length; mem++) {
					  var id = member_array[mem].id;
					  var member = member_array[mem];
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
				    if (!id_array.includes(origKing)){
					 try{
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
					 catch(e){
						 console.error(e);
					 }
					}
					else if (parseInt(sorted.plays) > parseInt(plays) || (parseInt(origKingPlays) != parseInt(plays) && parseInt(sorted.plays) > 0)){
					  try{
						var kingPlays = -1;
						for(var i = 0; i < 10; i++){
						   var orig = await lib.artist.getInfo(artist, origKingUser);
						   if (parseInt(orig.artist.stats.userplaycount) > 1 || orig.artist.stats.userplaycount == `0`){
							   kingPlays = parseInt(orig.artist.stats.userplaycount);
							   break;
						   }
						}
						if (kingPlays >= parseInt(sorted.plays)){
							sorted.plays = kingPlays;
							sorted.userID = origKing;
						}
						if (kingPlays >= 0){
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
					var time_after = Date.now();
					var time_diff = time_after - time_before;
					time_diff = time_diff.toString();
					await Time.create({
						ms: time_diff,
						isArtist: `true`,
						guildID: message.guild.id
					});				
				  } catch (e) {
					if (e.name !== `SequelizeUniqueConstraintError`) {
					  console.error(e);
					}
			  }
			}
			  catch(e) {
				try{
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

					var fm_img = track.image[2][`#text`];
					var albumArtist = null;
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
										albumArtist = data.album.artist;
										break;
									}
								}
							}
						}
						catch(e){
							console.error(e);
						}
					}
					
					const embed = new MessageEmbed()
					  .setColor(message.member.displayColor)
					  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
					  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
					  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n` +
					   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
					  .setThumbnail(fm_img)
					  .setFooter(foot, fimg)
					await msg.edit({ embed });
					
					try {
						var time_before = Date.now();
						const Users = client.sequelize.import(`../models/Users.js`);
						const Crowns = client.sequelize.import(`../models/Crowns.js`);
						const Artists = client.sequelize.import(`../models/Artists.js`);
						
						const Notifs = client.sequelize.import(`../models/Notifs.js`);
						const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
						const Time = client.sequelize.import(`../models/Time.js`);
						
						var time_before = Date.now();
						const know = [];
						const data = await lib.artist.getInfo(artist);
						
						var id_array = [];
						var member_array = [];
						var guild = await message.guild.members.fetch().then(function(data){
							
							for (const [id, member] of data) {
								id_array.push(id);
								member_array.push(member);
							}
							
						});
						
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
						for (var mem = 0; mem < member_array.length; mem++) {
						  var id = member_array[mem].id;
						  var member = member_array[mem];
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
						  if (!id_array.includes(origKing)){
							 try{
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
							 catch(e){
								 console.error(e);
							 }
						  }
						  else if (parseInt(sorted.plays) > parseInt(plays) || (parseInt(origKingPlays) != parseInt(plays) && parseInt(sorted.plays) > 0)){
						  try{
							var kingPlays = -1;
							for (var i = 0; i < 10; i++){
							   var orig = await lib.artist.getInfo(artist, origKingUser);
							   if (parseInt(orig.artist.stats.userplaycount) > 1 || orig.artist.stats.userplaycount == `0`){
								   kingPlays = parseInt(orig.artist.stats.userplaycount);
								   break;
							   }
							}
							if (kingPlays >= parseInt(sorted.plays)){
								sorted.plays = kingPlays;
								sorted.userID = origKing;
							}
							if (kingPlays >= 0){
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
						var time_after = Date.now();
						var time_diff = time_after - time_before;
						time_diff = time_diff.toString();
						await Time.create({
							ms: time_diff,
							isArtist: `true`,
							guildID: message.guild.id
						});					
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
					
					const embed = new MessageEmbed()
					  .setColor(message.member.displayColor)
					  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name)
					  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
					  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n` +
					   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
					  .setThumbnail(track.image[2][`#text`])
					  .setFooter(foot, fimg)
					await msg.edit({ embed });
				}
			}
		  } 
		  else {
			const fetchUser = new fetchuser(client, message);
			const user = await fetchUser.username();
			var recents = await lib.user.getRecentTracks(user, 1);
			const track = recents.recenttracks.track[0];
			var album = track.album[`#text`].toString();
			var artist = track.artist[`#text`].toString();
			var alb = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20` + encodeURIComponent(album) + `%20release%20reviews%20ratings` + `%20site%3Arateyourmusic.com%2Frelease%2F`
			var art = `https://www.google.com/search?q=` + encodeURIComponent(artist) + `%20artist%20songs%20discography%20biography` + `%20site%3Arateyourmusic.com/artist/`	
			var fm_img = track.image[2][`#text`];
			
			var embed;
			if(track[`@attr`]){

					
				embed = new MessageEmbed()
					  .setColor(message.member.displayColor)
					  .setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+user)
					  .setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
					  .setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n` +
					   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***](${alb} 'search rym for ${artist} - ${album}')` : `[no album]`}`, true)
					  .setThumbnail(fm_img)
					  .setFooter(`loading your data...`, `https://i.imgur.com/tOuSBYf.gif`)
				var msg = await message.channel.send({ embed });
				var data = null;
				var art_data = null;
				var userData = await lib.user.getInfo(user);
				var albplay = null;
				var artplay = null;
				var fimg = `https://i.imgur.com/GBuQOhn.gif`
				try{
					data = await lib.album.getInfo(artist, album, user, 0);
					albplay = data.album.userplaycount;
					art_data = await lib.artist.getInfo(artist, user, 0);
					artplay = art_data.artist.stats.userplaycount;
					var crownExists = await ACrowns.findOne({
					  where: {
						guildID: message.guild.id,
						albumName: data.album.name,
						artistName: data.album.artist
					  }
					});
					
					
					if (crownExists != null){
						if (crownExists.userID === message.author.id){
							fimg = `https://i.imgur.com/bCeKwDd.gif`
						}
						else{
							fimg = `https://i.imgur.com/Qgo8myA.gif`
						}
					}
				}
				catch(e){
					console.error(e);
					try{
						art_data = await lib.artist.getInfo(artist, user, 0);
						artplay = art_data.artist.stats.userplaycount;
					}
					catch(e){
						console.error(e);
					}
				}
				
				
				
				var foot = `scrobbles → all: ${userData.user.playcount} ${art_data == null ? `` : `| artist: ` + artplay} ${data == null ? `` : `| album: ` + albplay}`;
				
			}
			else{
				var foot = `cannot fetch currently playing track.\nthis is the last track scrobbled.`;
			}
			
			embed = new MessageEmbed()
				.setColor(message.member.displayColor)
				.setAuthor(message.author.username, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+user)
				.setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
				.setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n` +
			   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***]( ${alb} 'search rym for ${artist} - ${album}' )` : `[no album]`}`, true)
				.setThumbnail(track.image[2][`#text`])
				.setFooter(foot, fimg)
			if(track[`@attr`]){	
				msg.edit({ embed });
				
			}
			else{
				var msg = await message.channel.send({ embed });
			}
				
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
					.setTitle(`**${track.name.split(`*`).join(`&ast`)}**`)
					.setDescription(`[**${track.artist[`#text`].split(`*`).join(`&ast`)}**]( ${art} 'search rym for ${artist} ')\n` +
				   `${track.album[`#text`].split(`*`).join(`&ast`) ? `[***` + track.album[`#text`].split(`*`).join(`&ast`) + `***]( ${alb} 'search rym for ${artist} - ${album}' )` : `[no album]`}`, true)
					.setThumbnail(track.image[2][`#text`])
					.setFooter(foot)
					
				await msg.edit({ embed });
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


