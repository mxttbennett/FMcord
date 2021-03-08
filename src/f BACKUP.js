const Library = require(`../lib/index.js`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const ReactionInterface = require(`../utils/ReactionInterface`);



exports.run = async (client, message) => {
  try {
    const lib = new Library(client.config.lastFM.apikey);
    const user = new fetchuser(client, message);
	const ACrowns = client.sequelize.import(`../models/ACrowns.js`);

    if (await user.get()) {
      const ft = new fetchtrack(client, message);
      const track = await ft.getcurrenttrack(client, message);
	  message.react(`✅`);
	  

	if (track) {
		const name = await user.usernameFromId(message.author.id);
		const data = await lib.album.getInfo(track.artist[`#text`], track.album[`#text`], name, 1);
		const data2 = await lib.artist.getInfo(track.artist[`#text`], name, 1);
		let album = track.album[`#text`];
		var origalb = album;
		album = album.split(` `);
		let artist = track.artist[`#text`];
		var origart = artist;
		artist = artist.split(` `);
		var alb = ``;
		var art = ``;
		 for(var z = 0; z < album.length; z++){ 
		 if (z == album.length-1){
			 alb += album[z];
		 }
		 else{
			 alb += album[z];
			 alb += `+`;
		}
		}
		
		for(var y = 0; y < artist.length; y++){ 
			art += artist[y];
			art += `+`;
		}
		
		alb = alb.replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
		art = art.replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
		
		var fimg = `https://i.imgur.com/GBuQOhn.gif`

		
		
		const hasCrown = await ACrowns.findOne({
		  where: {
			guildID: message.guild.id,
			albumName: data.album.name,
			artistName: data2.artist.name
		  }
		});
		if (hasCrown != null){
			if (hasCrown.userID === message.author.id){
				fimg = `https://i.imgur.com/bCeKwDd.gif`
			}
			else{
				fimg = `https://i.imgur.com/Qgo8myA.gif`
			}
		}
		

		var foot = ``;
        const userData = await lib.user.getInfo(await user.username());
		
		
		var badArr = [
		
			"seen live",
			"money",
			"drain gang",
			"albums i own",
			"best of 2007",
			"favorite albums",
			"All"
		
		];
		
		
		var tags = data.album.tags.tag;
		var tagField = tags.map(t => `${t.name}`).join(` ● `);
		var tag2 = tagField.split(` ● `);
		
		
		tag2 = tag2.filter(function(value, index, arr){
				
			
			return !(badArr.includes(value)) &&
			(value.indexOf('0') == -1) &&
			(value.indexOf('1') == -1) &&
			(value.indexOf('2') == -1) &&
			(value.indexOf('3') == -1) &&
			(value.indexOf('4') == -1) &&
			(value.indexOf('5') == -1) &&
			(value.indexOf('6') == -1) &&
			(value.indexOf('7') == -1) &&
			(value.indexOf('8') == -1) &&
			(value.indexOf('9') == -1) &&
			(value.indexOf('albums') == -1)
			
		;
		});
		
		var discName = message.author.username;
		
		if (tag2[0] != "" && tag2.length > 0){
			if(parseInt(data2.artist.stats.userplaycount) >= 0 && parseInt(data.album.userplaycount) == 0){
				if (parseInt(data2.artist.stats.userplaycount) == 0){
					
					
					if (tag2.length < 3){
						if (tag2.length == 1){
							foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount}`;
						}
						else if (tag2.length == 2){
							foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount}`;
						}
						else{
							foot = `scrobbles → ` +
					`all: ${userData.user.playcount}`;
						}
					}
					else{
					foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙ ` + tag2[2].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount}`;
					}
					
					
					
				}
				else{
					if (tag2.length < 3){
						if (tag2.length == 1){
							foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${data2.artist.stats.userplaycount}`;
						}
						else if (tag2.length == 2){
							foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${data2.artist.stats.userplaycount}`;
						}
						else{
							foot = `scrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${data2.artist.stats.userplaycount}`;
						}
					}
					else{
					foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙ ` + tag2[2].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${data2.artist.stats.userplaycount}`;
					}
				}
			}
			else{
				if (tag2.length < 3){
					if (tag2.length == 1){
						foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${data2.artist.stats.userplaycount} | album: ${data.album.userplaycount}`;
					}
					else if (tag2.length == 2){
						foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙\nscrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${data2.artist.stats.userplaycount} | album: ${data.album.userplaycount}`;
					}
					else{
						foot = `scrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${data2.artist.stats.userplaycount} | album: ${data.album.userplaycount}`;
					}
				}
				else{
				foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙ ` + tag2[2].toLowerCase() + ` ∙\nscrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${data2.artist.stats.userplaycount} | album: ${data.album.userplaycount}`;
				}
			}
			
			
	}
	

	else{
		
		//await message.channel.send(`pulling from artist`);
		tags = data2.artist.tags.tag;
		tagField = tags.map(t => `${t.name}`).join(` ● `);
		tag2 = tagField.split(` ● `);
		tag2 = tag2.filter(function(value, index, arr){
			return !(badArr.includes(value)) &&
			(value.indexOf('0') == -1) &&
			(value.indexOf('1') == -1) &&
			(value.indexOf('2') == -1) &&
			(value.indexOf('3') == -1) &&
			(value.indexOf('4') == -1) &&
			(value.indexOf('5') == -1) &&
			(value.indexOf('6') == -1) &&
			(value.indexOf('7') == -1) &&
			(value.indexOf('8') == -1) &&
			(value.indexOf('9') == -1) &&
			(value.indexOf('albums') == -1)
			;
		});
		
		var artplay = data2.artist.stats.userplaycount;
		var albplay = data.album.userplaycount;
		
		if(parseInt(artplay) >= 0 && parseInt(albplay) == 0){
			if (parseInt(artplay) == 0){
				
				if (tag2.length < 3){
					if (tag2.length == 1){
						foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount}`;
					}
					else if (tag2.length == 2){
						foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount}`;
					}
					else{
						foot = `scrobbles → ` +
					`all: ${userData.user.playcount}`;
					}
				}
				else{
					foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙ ` + tag2[2].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount}`;
				}
				
				
			}
			else{
				if (tag2.length < 3){
					if (tag2.length == 1){
						foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${artplay}`;
					}
					else if (tag2.length == 2){
						foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${artplay}`;
					}
					else{
						foot = `scrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${artplay}`;
					}
				}
				else{
					foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙ ` + tag2[2].toLowerCase() + ` ∙\nscrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${artplay}`;
				}
			}
		}
		else{
			if (tag2.length < 3){
				if (tag2.length == 1){
					foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${artplay} | album: ${albplay}`;
				}
				else if (tag2.length == 2){
					foot = `∙ ` + tag2[0].toLowerCase() + ` ∙\nscrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${artplay} | album: ${albplay}`;
				}
				else{
					foot = `scrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${artplay} | album: ${albplay}`;
				}
			}
			else{
				foot = `∙ ` + tag2[0].toLowerCase() + ` ∙ ` + tag2[1].toLowerCase() + ` ∙ ` + tag2[2].toLowerCase() + ` ∙\nscrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${artplay} | album: ${albplay}`;
			}
		}
	}
		
		footarr = foot.split(`\n`);
		if (footarr[0] == "∙  ∙" || footarr[0] == "∙ ∙"){
			if(parseInt(artplay) >= 0 && parseInt(albplay) == 0){
				if(artplay == 0){
					
					foot = `scrobbles → ` +
					`all: ${userData.user.playcount}`;
					
				}
				else{
					foot = `scrobbles → ` +
					`all: ${userData.user.playcount} | artist: ${artplay}`;
				}
			}
			else{
				foot = `scrobbles → ` +
				`all: ${userData.user.playcount} | artist: ${artplay} | album: ${albplay}`;
			}
		}
	
        const embed = new RichEmbed()
		

          //.addField(`${track.artist[`#text`]}\n` +
            //`*${track.album[`#text`] ? track.album[`#text`] : `no album`}*`, `[\:mag_right:  rym search  \:mag:](http://www.google.com/search?q=${art}${alb}&as_sitesearch=rateyourmusic.com)`, true)
          .setColor(message.member.displayColor)
          //.setTitle(`:mag_right:  rym search  :mag:`)
		  .setAuthor(discName, message.author.avatarURL, 'https://www.last.fm/user/'+name)
		  .setTitle(`**${track.name}**`)
          //.setURL(`http://www.google.com/search?q=${art}${alb}&as_sitesearch=rateyourmusic.com`)
		  .setDescription(`[**${track.artist[`#text`]}**](http://www.google.com/search?q=${art}&as_sitesearch=rateyourmusic.com 'search rym for ${origart}')\n` +
           `[***${track.album[`#text`] ? track.album[`#text`] : `[no album]`}***](http://www.google.com/search?q=${art}${alb}&as_sitesearch=rateyourmusic.com 'search rym for ${origart} - ${origalb}')`, true)
          .setThumbnail(track.image[2][`#text`])
          .setFooter(foot, fimg)
          //.setTimestamp();
        const msg = await message.channel.send({ embed });
		/*
		const rl = new ReactionInterface(msg, message.author);
		if (message.guild.id == 519948282814791680){
			await rl.setKey(`541373581180010506`);
			await rl.setKey(`577759200499728384`);
		}
		else{
			await rl.setKey(`482339744823509002`);
			await rl.setKey(`474691662006845450`);
		}
		*/
      } else {
				
				const fetchUser = new fetchuser(client, message);
		  		var discName2 = message.author.username;
				const user2 = await fetchUser.username();
				const data2 = await lib.user.getRecentTracks(user2);
				const userData = await lib.user.getInfo(await fetchUser.username());
				const track = data2.recenttracks.track[0];
				const name = await fetchUser.usernameFromId(message.author.id);
				let foot = `cannot fetch current playing track.\nthis is the last track scrobbled.`;
				var fimg = `https://i.imgur.com/GBuQOhn.gif`
				
				let album = track.album[`#text`];
				  var origalb = album;
				  album = album.split(` `);
				  let artist = track.artist[`#text`];
				  var origart = artist;
				  /*
				  artist = artist.split(` `);
					var alb = ``;
					var art = ``;
					 for(var z = 0; z < album.length; z++){ 
					 if (z == album.length-1){
						 alb += album[z];
					 }
					 else{
						 alb += album[z];
						 alb += `+`;
					}
					}
					
					for(var y = 0; y < artist.length; y++){ 
						art += artist[y];
						art += `+`;
					}
					*/
					
					alb = album.replace(/\s/g, `+`).replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
					art = artist.replace(/\s/g, `+`).replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
				
				
				
				
				const embed = new RichEmbed()
					.setColor(message.member.displayColor)
					.setAuthor(discName2, message.author.avatarURL, 'https://www.last.fm/user/'+name)
					.setTitle(`**${track.name}**`)
					.setDescription(`[**${track.artist[`#text`]}**](http://www.google.com/search?q=${art}&as_sitesearch=rateyourmusic.com 'search rym for ${origart}')\n` +
					`[***${track.album[`#text`] ? track.album[`#text`] : `no album`}***](http://www.google.com/search?q=${art}${alb}&as_sitesearch=rateyourmusic.com 'search rym for ${origart} - ${origalb}')`, true)
					.setThumbnail(track.image[2][`#text`])
					.setFooter(foot, fimg)
					
				const msg = await message.channel.send({ embed });
				
				
		const fuser = await user.getById(message.author.id);
	  //await message.channel.send(`Could not fetch current playing song.\nVerify that you are currently scrobbling.\n<https://last.fm/user/${fuser.get(`lastFMUsername`)}>`);
      }
    } else {
      await message.reply(client.snippets.noLogin);
    }
	
}  catch (e) {
    console.error(e);
	  try {
		const lib = new Library(client.config.lastFM.apikey);
		const user = new fetchuser(client, message);

		if (await user.get()) {
		  const ft = new fetchtrack(client, message);
		  const track = await ft.getcurrenttrack(client, message);
		  

		  if (track) {
		  let album = track.album[`#text`];
		  var origalb = album;
		  album = album.split(` `);
		  let artist = track.artist[`#text`];
		  var origart = artist;
		  artist = artist.split(` `);
			var alb = ``;
			var art = ``;
			 for(var z = 0; z < album.length; z++){ 
			 if (z == album.length-1){
				 alb += album[z];
			 }
			 else{
				 alb += album[z];
				 alb += `+`;
			}
			}
			
			for(var y = 0; y < artist.length; y++){ 
				art += artist[y];
				art += `+`;
			}
			
			alb = alb.replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
			art = art.replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
			
			var fimg = `https://i.imgur.com/GBuQOhn.gif`
			var discName = message.author.username;
			const name = await user.usernameFromId(message.author.id);
			const userData = await lib.user.getInfo(await user.username());
			const data2 = await lib.artist.getInfo(track.artist[`#text`], name, 1);
			if (data2.artist.stats.playcount != `0` ){
				var foot = `scrobbles → ` + `all: ${userData.user.playcount} | ` + `artist: ${data2.artist.stats.userplaycount}`;
			}
			else{
				var foot = `scrobbles → ` + `all: ${userData.user.playcount}`
			}
			const embed = new RichEmbed()
				
			  .setColor(message.member.displayColor)
			  .setAuthor(discName, message.author.avatarURL, 'https://www.last.fm/user/'+name)
			  //.setTitle(`:mag_right:  rym search  :mag:`)
			  .setTitle(`**${track.name}**`)
			  //.setURL(`http://www.google.com/search?q=${art}${alb}&as_sitesearch=rateyourmusic.com`)
			  .setDescription(`[**${track.artist[`#text`]}**](http://www.google.com/search?q=${art}&as_sitesearch=rateyourmusic.com 'search rym for ${origart}')\n` +
			   `[***${track.album[`#text`] ? track.album[`#text`] : `[no album]`}***](http://www.google.com/search?q=${art}${alb}&as_sitesearch=rateyourmusic.com 'search rym for ${origart} - ${origalb}')`, true)
			  .setThumbnail(track.image[1][`#text`])
			  .setFooter(foot, fimg)
			const msg = await message.channel.send({ embed });
		}	
		
		else {
			
				const fetchUser = new fetchuser(client, message);
		  		var discName2 = message.author.username;
				const user2 = await fetchUser.username();
				const data2 = await lib.user.getRecentTracks(user2);
				const userData = await lib.user.getInfo(await fetchUser.username());
				const track = data2.recenttracks.track[0];
				const name = await fetchUser.usernameFromId(message.author.id);
				let foot = `cannot fetch current playing track.\nthis is the last track scrobbled.`;
				var fimg = `https://i.imgur.com/GBuQOhn.gif`
				
				let album = track.album[`#text`];
				  var origalb = album;
				  album = album.split(` `);
				  let artist = track.artist[`#text`];
				  var origart = artist;
				  artist = artist.split(` `);
					var alb = ``;
					var art = ``;
					 for(var z = 0; z < album.length; z++){ 
					 if (z == album.length-1){
						 alb += album[z];
					 }
					 else{
						 alb += album[z];
						 alb += `+`;
					}
					}
					
					for(var y = 0; y < artist.length; y++){ 
						art += artist[y];
						art += `+`;
					}
					
					alb = alb.replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
					art = art.replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
				
				
				
				
				const embed = new RichEmbed()
					.setColor(message.member.displayColor)
					.setAuthor(discName2, message.author.avatarURL, 'https://www.last.fm/user/'+name)
					.setTitle(`**${track.name}**`)
					.setDescription(`[**${track.artist[`#text`]}**](http://www.google.com/search?q=${art}&as_sitesearch=rateyourmusic.com 'search rym for ${origart}')\n` +
					`[***${track.album[`#text`] ? track.album[`#text`] : `no album`}***](http://www.google.com/search?q=${art}${alb}&as_sitesearch=rateyourmusic.com 'search rym for ${origart} - ${origalb}')`, true)
					.setThumbnail(track.image[2][`#text`])
					.setFooter(foot, fimg)
					
				const msg = await message.channel.send({ embed });
				//const fuser = await user.getById(message.author.id);
				//await message.channel.send(`Could not fetch current playing song.\nVerify that you are currently scrobbling.\n<https://last.fm/user/${fuser.get(`lastFMUsername`)}>`);
			  }
			} else {
			  await message.reply(client.snippets.noLogin);
			}
		}
	  catch (e){
		  
		  try{
								const fetchUser = new fetchuser(client, message);
		  		var discName2 = message.author.username;
				const user2 = await fetchUser.username();
				const data2 = await lib.user.getRecentTracks(user2);
				const userData = await lib.user.getInfo(await fetchUser.username());
				const track = data2.recenttracks.track[0];
				const name = await fetchUser.usernameFromId(message.author.id);
				let foot = `cannot fetch current playing track.\nthis is the last track scrobbled.`;
				var fimg = `https://i.imgur.com/GBuQOhn.gif`
				
				let album = track.album[`#text`];
				  var origalb = album;
				  album = album.split(` `);
				  let artist = track.artist[`#text`];
				  var origart = artist;
				  artist = artist.split(` `);
					var alb = ``;
					var art = ``;
					 for(var z = 0; z < album.length; z++){ 
					 if (z == album.length-1){
						 alb += album[z];
					 }
					 else{
						 alb += album[z];
						 alb += `+`;
					}
					}
					
					for(var y = 0; y < artist.length; y++){ 
						art += artist[y];
						art += `+`;
					}
					
					alb = alb.replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
					art = art.replace(`&`, `&26`).replace(`(`, ``).replace(`)`, ``).replace(/\u200a/g, ``);
				
				
				
				
				
				const embed = new RichEmbed()
					.setColor(message.member.displayColor)
					.setAuthor(discName2, message.author.avatarURL, 'https://www.last.fm/user/'+name)
					.setTitle(`**${track.name}**`)
					.setDescription(`[**${track.artist[`#text`]}**](http://www.google.com/search?q=${art}&as_sitesearch=rateyourmusic.com 'search rym for ${origart}')\n` +
					`[***${track.album[`#text`] ? track.album[`#text`] : `no album`}***](${res} 'search rym for ${origart} - ${origalb}')`, true)
					.setThumbnail(track.image[2][`#text`])
					.setFooter(foot, fimg)
					
				const msg = await message.channel.send({ embed });
					
		  }
		  catch{
			console.error(e);
			const user = new fetchuser(client, message);
			const fuser = await user.getById(message.author.id);
			await message.channel.send(`Could not fetch current playing song.\nVerify that you are currently scrobbling.\n<https://last.fm/user/${fuser.get(`lastFMUsername`)}>`);
		  }
	 }
		  
    
  }
};
exports.help = {
  name: `f`,
  description: `Posts the song you are listening to right now or the last one scrobbled if no currently playing song is detected on last.fm.`,
  usage: `f`
};


