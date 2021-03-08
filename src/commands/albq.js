
const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const Library = require(`../lib/index.js`);
const { Op } = require(`sequelize`);
const ReactionInterface = require(`../utils/ReactionInterface`);
const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);
require('events').EventEmitter.defaultMaxListeners = 20;
let unique = new Set();
let period;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.run = async (client, message, args) => {
	const lib = new Library(client.config.lastFM.apikey);
	const fetchUser = new fetchuser(client, message);
	const AlbumQueue = client.sequelize.import(`../models/AlbumQueue.js`);
	const Time = client.sequelize.import(`../models/Time.js`);
	const TotalsAndAvgs = client.sequelize.import(`../models/TotalsAndAvgs.js`);
	const ACrowns = client.sequelize.import(`../models/ACrowns.js`);
	var albumList = await AlbumQueue.findAll();
	var albumLength = albumList.length;
	var thread = getRandomInt(1, 1000000);
	var arguments = [`--r`, `r`, `--s`, `--start`, `--run`, `--pages`, `--lr`, `--rl`];
	
	var timeAvgFetch = await TotalsAndAvgs.findAll();
	
	
	var TOTAL_ARTISTS = parseInt(timeAvgFetch[0].totalArtists);
	var ARTIST_AVG = parseFloat(timeAvgFetch[0].artistAvg).toFixed(2);
	ARTIST_AVG *= 1000;
	
	var TOTAL_ALBUMS = parseInt(timeAvgFetch[0].totalAlbums);
	var ALBUM_AVG = parseFloat(timeAvgFetch[0].albumAvg).toFixed(2);
	ALBUM_AVG *= 1000;
	
	
	if(albumLength == 0 && args[0] == `--pages`){
			return message.reply(`the album crown queue is currently empty.`);
	}
	
	if(args[0] != `--r` || message.member.id != `175199958314516480`){
	try{
		var timeList = await Time.findAll();
		var checkedGuilds = [];
		var sums = [];
		var avgs = [];
		var count = [];
		var weight = [];
		var totalAlbums = 0;
		var totalAlbumsSum = 0;
		var totalAlbumsAvg = 0;
		if(timeList.length > 0 && timeList.length < 1000){
			for(var i = 0; i < timeList.length; i++){
				if(timeList[i].isAlbum == `true`){
					totalAlbums++;
					totalAlbumsSum += parseFloat(timeList[i].ms);
					if(!checkedGuilds.includes(timeList[i].guildID)){
						var counter = 0;
						for(var j = 0; j < timeList.length; j++){
							if(timeList[j].guildID == timeList[i].guildID && timeList[j].isAlbum == `true`){
								if(counter == 0){
									sums.push(parseFloat(timeList[j].ms));
									counter++;
									count.push(1);
									
								}
								else{
									sums[sums.length - 1] += parseFloat(timeList[j].ms);
									count[count.length - 1] += 1;
								}
							}
						}
						checkedGuilds.push(timeList[i].guildID);
					}
				}
			}
		}
		else if (timeList.length >= 1000){
			var addedArtists = 0;
			var addedArtistsSum = 0;
			var addedAlbums = 0;
			var addedAlbumsSum = 0;
			var preservedIDs = [];
			var artistGuilds = [];
			var albumGuilds = [];
			
			
			var timeMap = timeList
			.map(x => {
			  return {
				id: x.get(`id`),
				isArtist: x.get(`isArtist`),
				isAlbum: x.get(`isAlbum`),
				guildID: x.get(`guildID`),
				ms: x.get(`ms`)
			  };
			})
			.sort((a,b) => (parseInt(b.ms) - getRandomInt(1, parseInt(b.ms) * 2)));
		
			for(var i = 0; i < timeMap.length; i++){
				if(timeMap[i].isArtist == `true`){
					if(artistGuilds.includes(timeMap[i].guildID)){
						addedArtists += 1;
						addedArtistsSum += parseFloat(timeMap[i].ms);
					}
					else{
						artistGuilds.push(timeMap[i].guildID);
						preservedIDs.push(timeMap[i].id);
					}	
				}
				if(timeMap[i].isAlbum == `true`){
					if(albumGuilds.includes(timeMap[i].guildID)){
						addedAlbums += 1;
						addedAlbumsSum += parseFloat(timeMap[i].ms);
					}
					else{
						albumGuilds.push(timeMap[i].guildID);
						preservedIDs.push(timeMap[i].id);
					}	
				}
				
				if(!preservedIDs.includes(timeMap[i].id)){
					await Time.destroy({
						  where: {
							id: timeMap[i].id
						  }
					});
				}
				
			}
			
			var newArtistTotal = TOTAL_ARTISTS + addedArtists;
			var newAlbumTotal = TOTAL_ALBUMS + addedAlbums;
			
			var newArtistAvg = parseFloat((((TOTAL_ARTISTS * ARTIST_AVG) + addedArtistsSum)/newArtistTotal)/1000).toFixed(15);
			var newAlbumAvg = parseFloat((((TOTAL_ALBUMS * ALBUM_AVG) + addedAlbumsSum)/newAlbumTotal)/1000).toFixed(15);
			
			TOTAL_ARTISTS = newArtistTotal;
			TOTAL_ALBUMS = newAlbumTotal;
			

			await TotalsAndAvgs.update({
					  totalArtists: newArtistTotal,
					  totalAlbums: newAlbumTotal,
					  artistAvg: newArtistAvg,
					  albumAvg: newAlbumAvg
					},
					{
					  where: {
						id: 1
					  }
			});
		}
		
		
		var relevantGuilds = [];
		var relevantSums = [];
		var relevantCount = [];
		var weightCount = [];
		for(var i = 0; i < checkedGuilds.length; i++){
			var counter = 0;
			
			for(y = 0; y < albumList.length; y++){
				if(checkedGuilds[i] == albumList[y].guildID){
					
					if(counter == 0){
						relevantGuilds.push(checkedGuilds[i]);
						relevantSums.push(sums[i]);
						relevantCount.push(count[i]);
						weightCount.push(1);
						counter += 1;
					}
					else{
						weightCount[weightCount.length - 1] += 1;
						
					}
				}
			}
		}
		
		for(var i = 0; i < relevantGuilds.length; i++){
			avgs.push(parseFloat(relevantSums[i])/parseFloat(relevantCount[i]));
			weight.push(parseFloat(weightCount[i])/parseFloat(albumList.length));
		}
		
		var time_avg = 0;
		for(var i = 0; i < relevantGuilds.length; i++){
			time_avg += parseFloat(avgs[i] * weight[i]/1000);
		}
		
		totalAlbumsSum += (ALBUM_AVG * TOTAL_ALBUMS);
		totalAlbums += TOTAL_ALBUMS;
		totalAlbumsAvg = parseFloat(totalAlbumsSum / totalAlbums / 1000)

		var totalProcessingTime = parseFloat(((totalAlbumsSum)/1000/60/60/24).toFixed(2));
		
		var minutes = false;
		time_avg = parseFloat(time_avg.toFixed(2));
		
		
		if(minutes){
			var eta = parseFloat(((albumLength * time_avg)/60).toFixed(2));
		}
		else{
			var eta = parseFloat(((albumLength * time_avg)/60/60).toFixed(2));	
		}
		
		var total_minutes = false;
		if(totalAlbumsAvg >= 60){
			totalAlbumsAvg = parseFloat((totalAlbumsAvg/60).toFixed(2));
			total_minutes = true;
		}
		else{
			totalAlbumsAvg = parseFloat(totalAlbumsAvg.toFixed(2));
		}
	
	}
	catch(e){
		console.error(e);
	}

	var ALBUM_AVG_DISPLAY = (ALBUM_AVG/1000).toFixed(2);
	var x = 0;
    var description = albumList
      .slice(0, 10)
      .map(k => `${++x}. __${k.artistName}__ — ***${k.albumName}***\n${k.guildName} | ${k.userName} - ${k.chartType} ${k.crownHolder != `` ? `| :crown: [` + k.crownHolder + `](https://www.last.fm/user/` + k.crownHolder + `) (` + k.crownPlays + `) :crown:` : ``}`) 
      .join(`\n`);
    var embed = new MessageEmbed()
      .setColor(message.member.displayColor)
      .setTitle(`**Album Crown Queue**`)
      .setDescription(description)
	  .setFooter(albumLength + ` albums in queue | ${albumLength == 0 ? `0` : time_avg} sec/album | ~` + eta + ` hours until complete\n` +
				 totalAlbums + ` total albums processed | ` + ALBUM_AVG_DISPLAY + ` sec/album | ~` + totalProcessingTime + ` days spent processing` , `https://i.imgur.com/ysyfHk7.gif`);
      //.setTimestamp();
    var msg = await message.channel.send({embed});
	
	
	var global_page = 1;
	var global_offset = 0;
	 if (albumList.length > 10 && args[0] != `--live`) {
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(albumList.length / 10);
        let offset = 0, page = 1;
        const func = async off => {
          let num = off;
          const description = albumList
			  .slice(off, off + 10)
			  .map(k => `${++num}. __${k.artistName}__ — ***${k.albumName}***\n${k.guildName} | ${k.userName} - ${k.chartType} ${k.crownHolder != `` ? `| :crown: [` + k.crownHolder + `](https://www.last.fm/user/` + k.crownHolder + `) (` + k.crownPlays + `) :crown:` : ``}`) 
 			  .join(`\n`);
		  const embed = new MessageEmbed()
			  .setColor(message.member.displayColor)
			  .setTitle(`**Album Crown Queue**`)
			  .setDescription(description)
			  .setFooter(albumLength + ` albums in queue | ${albumLength == 0 ? `0` : time_avg} ${minutes == true ? `min/album` : `sec/album`} | ~` + eta + ` hours until complete\n` +
						 totalAlbums + ` total albums processed | ` + totalAlbumsAvg + ` sec/album | ` + totalProcessingTime + ` days spent processing` , `https://i.imgur.com/ysyfHk7.gif`)
			  //.setTimestamp();
          await msg.edit({ embed });
        };
        const toFront = () => {
          if (page !== length) {
            offset += 10, page++;
			global_page++;
			global_offset += 10;
            func(offset);
          }
        };
        const toBack = () => {
          if (page !== 1) {
            offset -= 10, page--;
			global_page++;
			global_offset -= 10;
            func(offset);
          }
        };
        await rl.setKey(client.snippets.arrowLeft, toBack);
        await rl.setKey(client.snippets.arrowRight, toFront);
      }
	 }
	 //console.log(`hhdf`);
	if(arguments.includes(args[0]) && message.member.id == `175199958314516480` && args[0] != `--pages` && args[0] != `--live`){
		message.channel.send(`starting album crown queue...\n\`` + albumLength + `\` album crowns to process.`);
	}
	
	var msg_trip = 0;
	var msg = ``;
	if(args[0] == `--r` && message.member.id == `175199958314516480`){
		var REFRESH_COUNTER = 0;
		while (albumLength > 0){
			try{
			    if(albumLength >= 0){
					REFRESH_COUNTER += 1;
					//if (REFRESH_COUNTER % 10 == 0){
						timeAvgFetch = await TotalsAndAvgs.findAll();
						TOTAL_ALBUMS = parseInt(timeAvgFetch[0].totalAlbums);
						ALBUM_AVG = parseFloat(timeAvgFetch[0].albumAvg).toFixed(15);
						ALBUM_AVG *= 1000;
					//}
					var timeList = await Time.findAll();
					var checkedGuilds = [];
					var sums = [];
					var avgs = [];
					var count = [];
					var weight = [];
					var totalAlbums = 0;
					var totalAlbumsSum = 0;
					var totalAlbumsAvg = 0;
					if(timeList.length > 0 && timeList.length < 1000){
						for(var i = 0; i < timeList.length; i++){
							if(timeList[i].isAlbum == `true`){
								totalAlbums++;
								totalAlbumsSum += parseFloat(timeList[i].ms);
								if(!checkedGuilds.includes(timeList[i].guildID)){
									var counter = 0;
									for(var j = 0; j < timeList.length; j++){
										if(timeList[j].guildID == timeList[i].guildID && timeList[j].isAlbum == `true`){
											if(counter == 0){
												sums.push(parseFloat(timeList[j].ms));
												counter++;
												count.push(1);
												
											}
											else{
												sums[sums.length - 1] += parseFloat(timeList[j].ms);
												count[count.length - 1] += 1;
											}
										}
									}
									checkedGuilds.push(timeList[i].guildID);
								}
							}
						}
					}
					else if (timeList.length >= 1000){
						var addedArtists = 0;
						var addedArtistsSum = 0;
						var addedAlbums = 0;
						var addedAlbumsSum = 0;
						var preservedIDs = [];
						var artistGuilds = [];
						var albumGuilds = [];
						
						
						var timeMap = timeList
						.map(x => {
						  return {
							id: x.get(`id`),
							isArtist: x.get(`isArtist`),
							isAlbum: x.get(`isAlbum`),
							guildID: x.get(`guildID`),
							ms: x.get(`ms`)
						  };
						})
						.sort((a,b) => (parseInt(b.ms) - getRandomInt(1, parseInt(b.ms) * 2)));
					
						for(var i = 0; i < timeMap.length; i++){
							if(timeMap[i].isArtist == `true`){
								if(artistGuilds.includes(timeMap[i].guildID)){
									addedArtists += 1;
									addedArtistsSum += parseFloat(timeMap[i].ms);
								}
								else{
									artistGuilds.push(timeMap[i].guildID);
									preservedIDs.push(timeMap[i].id);
								}	
							}
							if(timeMap[i].isAlbum == `true`){
								if(albumGuilds.includes(timeMap[i].guildID)){
									addedAlbums += 1;
									addedAlbumsSum += parseFloat(timeMap[i].ms);
								}
								else{
									albumGuilds.push(timeMap[i].guildID);
									preservedIDs.push(timeMap[i].id);
								}	
							}
							
							if(!preservedIDs.includes(timeMap[i].id)){
								await Time.destroy({
									  where: {
										id: timeMap[i].id
									  }
								});
							}
							
						}
						
						var newArtistTotal = TOTAL_ARTISTS + addedArtists;
						var newAlbumTotal = TOTAL_ALBUMS + addedAlbums;
						
						var newArtistAvg = parseFloat((((TOTAL_ARTISTS * ARTIST_AVG) + addedArtistsSum)/newArtistTotal)/1000).toFixed(15);
						var newAlbumAvg = parseFloat((((TOTAL_ALBUMS * ALBUM_AVG) + addedAlbumsSum)/newAlbumTotal)/1000).toFixed(15);
						
						TOTAL_ARTISTS = newArtistTotal;
						TOTAL_ALBUMS = newAlbumTotal;
						

						await TotalsAndAvgs.update({
								  totalArtists: newArtistTotal,
								  totalAlbums: newAlbumTotal,
								  artistAvg: newArtistAvg,
								  albumAvg: newAlbumAvg
								},
								{
								  where: {
									id: 1
								  }
						});
					}
					
					var relevantGuilds = [];
					var relevantSums = [];
					var relevantCount = [];
					var weightCount = [];
					for(var i = 0; i < checkedGuilds.length; i++){
						var counter = 0;
						
						for(y = 0; y < albumList.length; y++){
							if(checkedGuilds[i] == albumList[y].guildID){
								
								if(counter == 0){
									relevantGuilds.push(checkedGuilds[i]);
									relevantSums.push(sums[i]);
									relevantCount.push(count[i]);
									weightCount.push(1);
									counter += 1;
								}
								else{
									weightCount[weightCount.length - 1] += 1;
									
								}
							}
						}
					}
					
					for(var i = 0; i < relevantGuilds.length; i++){
						avgs.push(parseFloat(relevantSums[i])/parseFloat(relevantCount[i]));
						weight.push(parseFloat(weightCount[i])/parseFloat(albumList.length));
					}
					
					var time_avg = 0;
					for(var i = 0; i < relevantGuilds.length; i++){
						time_avg += parseFloat(avgs[i] * weight[i]/1000);
					}
					
					totalAlbumsSum += (ALBUM_AVG * TOTAL_ALBUMS);
					totalAlbums += TOTAL_ALBUMS;
					totalAlbumsAvg = parseFloat(totalAlbumsSum / totalAlbums / 1000)
					var eta = parseFloat(((albumLength * time_avg)/60/60).toFixed(2));
					var totalProcessingTime = parseFloat(((totalAlbumsSum)/1000/60/60/24).toFixed(2));
					
					var minutes = false;
					time_avg = parseFloat(time_avg.toFixed(2));
					
					
					
					
					
					
					var total_minutes = false;
					totalAlbumsAvg = parseFloat(totalAlbumsAvg.toFixed(2));
					
					
					const ARecord = client.sequelize.import(`../models/AlbumRecord.js`);
					var aRec = await ARecord.findAll();
					
					var c = 0;
					var description = albumList
					  .slice(0, 10)
					  .map(k => `${++c}. __${k.artistName}__ — ***${k.albumName}***\n${k.guildName} | ${k.userName} - ${k.chartType} ${k.crownHolder != `` ? `| :crown: [` + k.crownHolder + `](https://www.last.fm/user/` + k.crownHolder + `) (` + k.crownPlays + `) :crown:` : ``}`) 
					  .join(`\n`);
						  
					if(aRec.length > 3){
						for(var rec = 0; rec < aRec.length - 3; rec++){
							
							await ARecord.destroy({
							  where: {
								id: aRec[rec].id
							  }
							});
							
						}
						var z = 0;
						var temp_desc = description;
						description += `\n\n**Recently Processed**\n`;
						description += aRec
									.slice(aRec.length - 3, aRec.length)
									.map(k => `${++z}. __${k.artistName}__ — ***${k.albumName}***\n${k.guildName} ${k.prevOwner != `` ? `| :crown: [` + k.prevOwner + `]` + `(https://www.last.fm/user/` + k.prevOwner + `) (` + k.prevPlays + `)  **→** [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:` : `| :crown: New: [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:`}`) 
									.join(`\n`);
						if (description.length > 2048){
							z = 0;
							description = temp_desc + `\n\n**Recently Processed**\n` + aRec
										.slice(aRec.length - 2, aRec.length)
										.map(k => `${++z}. __${k.artistName}__ — ***${k.albumName}***\n${k.guildName} ${k.prevOwner != `` ? `| :crown: [` + k.prevOwner + `]` + `(https://www.last.fm/user/` + k.prevOwner + `) (` + k.prevPlays + `)  **→** [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:` : `| :crown: New: [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:`}`) 
										.join(`\n`);
							if (description.length > 2048){
								z = 0;
								description = temp_desc + `\n\n**Recently Processed**\n` + aRec
											.slice(aRec.length - 1, aRec.length)
											.map(k => `${++z}. __${k.artistName}__ — ***${k.albumName}***\n${k.guildName} ${k.prevOwner != `` ? `| :crown: [` + k.prevOwner + `]` + `(https://www.last.fm/user/` + k.prevOwner + `) (` + k.prevPlays + `)  **→** [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:` : `| :crown: New: [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:`}`) 
											.join(`\n`);
								if (description.length > 2048){
									description = temp_desc;
								}								
								
							}
						}
	
					}
					
					//var ALBUM_AVG_DISPLAY = (ALBUM_AVG/1000).toFixed(2);
					var time = new Date();
					var embed = new MessageEmbed()
					  .setColor(message.member.displayColor)
					  .setTitle(`**Album Crown Queue**`)
					  .setDescription(description)
					  .setTimestamp()
					  .setFooter(albumLength + ` albums in queue | ` + time_avg + ` sec/album | ~` + eta + ` hours until complete\n` +
								totalAlbums + ` total albums processed | ` + totalAlbumsAvg + ` sec/album | ` + totalProcessingTime + ` days spent processing\n` , `https://i.imgur.com/ysyfHk7.gif`)
					try{
						await msg.edit({embed});
						
					}
					catch{
						msg = await message.channel.send({embed});
					}
					if(albumLength == 0){
						await sleep(120000);
					}
					else{
						//await sleep(20000);
					}
				}
				
				
		  }
			catch(e){
				console.error(e);
			}
			if(message.member.id == `175199958314516480` && arguments.includes(args[0]) && args[0] != `--pages` && args[0] != `--live`){
			 try {
				var time_before = Date.now();
				const Users = client.sequelize.import(`../models/Users.js`);
				const Albums = client.sequelize.import(`../models/Albums.js`);
				const Notifs = client.sequelize.import(`../models/Notifs.js`);
				const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
				const AlbumRecord = client.sequelize.import(`../models/AlbumRecord.js`);
				
				var artistName = albumList[0].artistName;
				var albumName = albumList[0].albumName;
				const user = await fetchUser.username();
				const know = [];
				const data = await lib.album.getInfo(artistName, albumName);
					
				const hasCrown = await ACrowns.findOne({
				  where: {
					guildID: albumList[0].guildID,
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

				//const guild = await message.guild.fetchMembers();
				var total = 0;
				var listeners = 0;
				var gIDs = albumList[0].guildUserIDs.split(`,`);
				var gUsers = albumList[0].guildUsers.split(`~,~`);
				for (var i = 0; i < gIDs.length; i++) {
				  const user = await fetchUser.usernameFromId(gIDs[i]);
				  if (!user) continue;
				  const req = await lib.album.getInfo(artistName, albumName, user);
					
				  if(gIDs[i] == origKing){
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
					name: gUsers[i],
					userID: gIDs[i],
					plays: req.album.userplaycount	
				  };
				  know.push(data);
				}

				const sorted = know.sort(sortingFunc)[0];
				
				if (hasCrown === null && sorted.plays !== `0`) {
				  await ACrowns.create({
					guildID: albumList[0].guildID,
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
							guildID: albumList[0].guildID,
							albumName: data.album.name,
							artistName: data.album.artist
						  }
				  });
				  var plays = hasCrown.albumPlays;
				  if(!gIDs.includes(origKing)){
					 try{
						 await ACrowns.update({
						  userID: sorted.userID,
						  albumPlays: sorted.plays
						},
						{
						  where: {
							guildID: albumList[0].guildID,
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
						  guild: albumList[0].guildName,
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
						  guild: albumList[0].guildName,
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
						for(var tries = 0; tries < 10; tries++){
						   var orig = await lib.album.getInfo(artistName, albumName, origKingUser);
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
								guildID: albumList[0].guildID,
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
							  guild: albumList[0].guildName,
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
							  guild: albumList[0].guildName,
							  artist: data.album.artist,
							  album: data.album.name
							});
							
						}
					}
					catch(e){
						console.error(e);
						await AlbumQueue.destroy({
						  where: {
							guildID: albumList[0].guildID,
							artistName: albumList[0].artistName,
							albumName: albumList[0].albumName
						  }
						});
					}
				  }
				}
					var time_after = Date.now();
						var time_diff = time_after - time_before;
						time_diff = time_diff.toString();
						await Time.create({
							ms: time_diff,
							isAlbum: `true`,
							guildID: albumList[0].guildID
					});
					
					var crownExists = await ACrowns.findOne({
						
						where: {
							
							artistName: data.album.artist,
							albumName: data.album.name,
							guildID: albumList[0].guildID
							
						}
						
					});
					
					//console.log(crownExists);
					
					if(crownExists != null){
						
						var newHolder = await fetchUser.usernameFromId(crownExists.userID);
						
						
						await AlbumRecord.create({
							
							artistName: data.album.artist,
							albumName: data.album.name,
							guildName: albumList[0].guildName,
							prevOwner: albumList[0].crownHolder,
							newOwner: newHolder,
							prevPlays: albumList[0].crownPlays,
							newPlays: crownExists.albumPlays
							
							
						});
						
						
					}
					
				
					await AlbumQueue.destroy({
					  where: {
						guildID: albumList[0].guildID,
						artistName: albumList[0].artistName,
						albumName: albumList[0].albumName
					  }
					});
					
					albumList = await AlbumQueue.findAll();
					albumLength = albumList.length;
					if(albumLength == 0){
						return message.reply(`the album crown queue is now empty!`);
					}
					
					
					//await sleep(30000);
					
				await sleep(0);
				
				
				
			  } catch (e) {
				if (e.name !== `SequelizeUniqueConstraintError`) {
				  console.error(e);
				  await AlbumQueue.destroy({
					  where: {
						guildID: albumList[0].guildID,
						artistName: albumList[0].artistName,
						albumName: albumList[0].albumName
					  }
					});
				}
			  }
			}
			
			albumList = await AlbumQueue.findAll();
			albumLength = albumList.length;
			if(albumLength == 0){
			return message.reply(`the album crown queue is now empty!`);
			}
			  
		}
			  
	}
		
};

exports.help = {
  name: `albq`,
  description: `**ALB**UM **Q**UEUE: check the album queue`,
  usage: `only the bot owner can run the queue and use a live queue`
};