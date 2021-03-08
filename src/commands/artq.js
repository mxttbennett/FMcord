
const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const Library = require(`../lib/index.js`);
const { Op } = require(`sequelize`);
const ReactionInterface = require(`../utils/ReactionInterface`);
require('events').EventEmitter.defaultMaxListeners = 15;
const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);
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

function calcTime(offset) {

    // create Date object for current location
    d = new Date();

    // convert to msec
    // add local time zone offset 
    // get UTC time in msec
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    return new Date(utc + (3600000*offset));

}

exports.run = async (client, message, args) => {
	const lib = new Library(client.config.lastFM.apikey);
	const fetchUser = new fetchuser(client, message);
	const ArtistQueue = client.sequelize.import(`../models/ArtistQueue.js`);
	const Time = client.sequelize.import(`../models/Time.js`);
	const TotalsAndAvgs = client.sequelize.import(`../models/TotalsAndAvgs.js`);
	const ACrowns = client.sequelize.import(`../models/ACrowns.js`);
	var artistList = await ArtistQueue.findAll();
	var artistLength = artistList.length;
	var thread = getRandomInt(1, 1000000);
	var arguments = [`--r`, `r`, `--s`, `--start`, `--run`, `--pages`, `--lr`, `--rl`];
	
	var timeAvgFetch = await TotalsAndAvgs.findAll();
	
	
	var TOTAL_ARTISTS = parseInt(timeAvgFetch[0].totalArtists);
	var ARTIST_AVG = parseFloat(timeAvgFetch[0].artistAvg).toFixed(2);
	ARTIST_AVG *= 1000;
	
	
	var TOTAL_ALBUMS = parseInt(timeAvgFetch[0].totalAlbums);
	var ALBUM_AVG = parseFloat(timeAvgFetch[0].albumAvg).toFixed(2);
	ALBUM_AVG *= 1000;

	
	if(artistLength == 0 && args[0] == `--pages`){
			return message.reply(`the artist crown queue is currently empty.`);
	}
	
	if(args[0] != `--r` || message.member.id != `175199958314516480`){
	try{
		var timeList = await Time.findAll();
		var checkedGuilds = [];
		var sums = [];
		var avgs = [];
		var count = [];
		var weight = [];
		var totalArtists = 0;
		var totalArtistsSum = 0;
		var totalArtistsAvg = 0;
		var global_count = [];
		if(timeList.length > 0 && timeList.length < 1000){
			for(var i = 0; i < timeList.length; i++){
				//console.log(i);
				if(timeList[i].isArtist == `true`){
					totalArtists++;
					totalArtistsSum += parseFloat(timeList[i].ms);
					if(!checkedGuilds.includes(timeList[i].guildID)){
						var counter = 0;
						for(var j = 0; j < timeList.length; j++){
							if(timeList[j].guildID == timeList[i].guildID && timeList[j].isArtist == `true`){
								if(counter == 0){
									sums.push(parseFloat(timeList[j].ms));
									count.push(1);
									
									counter += 1;
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
			
			for(y = 0; y < artistList.length; y++){
				if(checkedGuilds[i] == artistList[y].guildID){
					
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
			weight.push(parseFloat(weightCount[i])/parseFloat(artistList.length));
		}
		
		/*
		for(var i = 0; i < checkedGuilds.length; i++){
			//console.log(i);
			avgs.push(parseFloat(sums[i])/parseFloat(count[i]));	
			weight.push(parseFloat(count[i])/parseFloat(timeList.length));
		)
		*/
		
		var time_avg = 0;
		for(var i = 0; i < relevantGuilds.length; i++){
			time_avg += parseFloat(avgs[i] * weight[i]/1000)
			//console.log(time_avg);
		}
		
		var minutes = false;
		time_avg = parseFloat(time_avg.toFixed(2));
		var total_minutes = false;
		
		totalArtistsSum += (ARTIST_AVG * TOTAL_ARTISTS);
		totalArtists += TOTAL_ARTISTS;
		totalArtistsAvg = parseFloat(totalArtistsSum / totalArtists / 1000)
		totalArtistsAvg = parseFloat(totalArtistsAvg.toFixed(2));
		
		//console.log(count);
		//console.log(avgs);
		
		if(minutes){
			var eta = parseFloat(((artistLength * time_avg)/60).toFixed(2));
		}
		else{
			var eta = parseFloat(((artistLength * time_avg)/60/60).toFixed(2));
		}
		var totalProcessingTime = parseFloat(((totalArtistsSum)/1000/60/60/24).toFixed(2));
	
	}
	catch(e){
		console.error(e);
	}

	var ARTIST_AVG_DISPLAY = (ARTIST_AVG/1000).toFixed(2);
	var x = 0;
    var description = artistList
      .slice(0, 10)
      .map(k => `${++x}. **${k.artistName}**\n${k.guildName} | ${k.userName} - ${k.chartType} ${k.crownHolder != `` ? `| :crown: [` + k.crownHolder + `](https://www.last.fm/user/` + k.crownHolder + `) (` + k.crownPlays + `) :crown:` : ``}`) 
      .join(`\n`);
    var embed = new MessageEmbed()
      .setColor(message.member.displayColor)
      .setTitle(`**Artist Crown Queue**`)
      .setDescription(description)
	  .setFooter(artistLength + ` artists in queue | ${artistLength == 0 ? `0` : time_avg} ${minutes == true ? `min/artist` : `sec/artist`} | ~` + eta + ` hours until complete\n` +
				 totalArtists + ` total artists processed | ` + ARTIST_AVG_DISPLAY + ` ${total_minutes == true ? `min/artist` : `sec/artist`} | ~` + totalProcessingTime + ` days spent processing` , `https://i.imgur.com/ysyfHk7.gif`)
      //.setTimestamp();
    var msg = await message.channel.send({embed});
	
	
	var global_page = 1;
	var global_offset = 0;
	 if (artistList.length > 10 && args[0] != `--live`) {
        const rl = new ReactionInterface(msg, message.author);
        const length = Math.ceil(artistList.length / 10);
        let offset = 0, page = 1;
        const func = async off => {
          let num = off;
          const description = artistList
			  .slice(off, off + 10)
			  .map(k => `${++num}. **${k.artistName}**\n${k.guildName} | ${k.userName} - ${k.chartType} ${k.crownHolder != `` ? `| :crown: [` + k.crownHolder + `](https://www.last.fm/user/` + k.crownHolder + `) (` + k.crownPlays + `) :crown:` : ``}`) 
 			  .join(`\n`);
		  const embed = new MessageEmbed()
			  .setColor(message.member.displayColor)
			  .setTitle(`**Artist Crown Queue**`)
			  .setDescription(description)
			  .setFooter(artistLength + ` artists in queue | ${artistLength == 0 ? `0` : time_avg} ${minutes == true ? `min/artist` : `sec/artist`} | ~` + eta + ` hours until complete\n` +
				 totalArtists + ` total artists processed | ` + totalArtistsAvg + ` ${total_minutes == true ? `min/artist` : `sec/artist`} | ~` + totalProcessingTime + ` days spent processing` , `https://i.imgur.com/ysyfHk7.gif`)
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
	if(arguments.includes(args[0]) && message.member.id == `175199958314516480` && args[0] != `--pages` && args[0] != `--live`){
		message.channel.send(`starting artist crown queue...\n\`` + artistLength + `\` artist crowns to process.`);
	}
	if(args[0] == `--r` && message.member.id == `175199958314516480`){
		var REFRESH_COUNTER = 0;
		while (artistLength != 0){
			try{
			    if(artistLength >= 0){
					REFRESH_COUNTER += 1;
					//if (REFRESH_COUNTER % 10 == 0){
						timeAvgFetch = await TotalsAndAvgs.findAll();
						TOTAL_ARTISTS = parseInt(timeAvgFetch[0].totalArtists);
						ARTIST_AVG = parseFloat(timeAvgFetch[0].artistAvg).toFixed(15);
						ARTIST_AVG *= 1000;
					//}
					
					var timeList = await Time.findAll();
					var checkedGuilds = [];
					var sums = [];
					var avgs = [];
					var count = [];
					var weight = [];
					var totalArtists = 0;
					var totalArtistsSum = 0;
					var totalArtistsAvg = 0;
					var global_count = [];
					if(timeList.length > 0 && timeList.length < 1000){
						for(var i = 0; i < timeList.length; i++){
							if(timeList[i].isArtist == `true`){
								totalArtists++;
								totalArtistsSum += parseFloat(timeList[i].ms);
								if(!checkedGuilds.includes(timeList[i].guildID)){
									var counter = 0;
									for(var j = 0; j < timeList.length; j++){
										if(timeList[j].guildID == timeList[i].guildID && timeList[j].isArtist == `true`){
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
					
					//console.log(checkedGuilds + `checked guilds`);
					//console.log(sums + `sums array`);
					//console.log(count + `count array`);
					var relevantGuilds = [];
					var relevantSums = [];
					var relevantCount = [];
					var weightCount = [];
					for(var i = 0; i < checkedGuilds.length; i++){
						var counter = 0;
						//console.log(checkedGuilds[i]);
						for(y = 0; y < artistList.length; y++){
							if(checkedGuilds[i] == artistList[y].guildID){
								//console.log(checkedGuilds[i]);
								if(counter == 0){
									relevantGuilds.push(checkedGuilds[i]);
									relevantSums.push(sums[i]);
									relevantCount.push(count[i]);
									weightCount.push(1);
									counter += 1;
								}
								else{
									weightCount[weightCount.length - 1] += 1;
									//relevantCount[relevantCount.length -1] +=  1
								}
							}
						}
					}
					
					for(var i = 0; i < relevantGuilds.length; i++){
						//console.log(relevantGuilds.length + `guilds length` + relevantGuilds[i]);
						//console.log(relevantSums.length + `sums length` + sums[i]);
						//console.log(count[i] + `count`);
						avgs.push(parseFloat(relevantSums[i])/parseFloat(relevantCount[i]));
						//console.log(i + `. ${relevantGuilds[i]} ` + relevantSums[i] + ` rel sums / ` + relevantCount[i] + ` = ` + avgs[i]);
						weight.push(parseFloat(weightCount[i])/parseFloat(artistList.length));
					}
					
					//console.log(avgs);
					
					
					for(var i = 0; i < weight.length; i++){
						//console.log(weight[i] + `weight`);
					}
					
					
					var time_avg = 0;
					for(var i = 0; i < relevantGuilds.length; i++){
						time_avg += parseFloat(avgs[i] * weight[i]/1000)
					}

					totalArtistsSum += (ARTIST_AVG * TOTAL_ARTISTS);
					totalArtists += TOTAL_ARTISTS;
					totalArtistsAvg = parseFloat(totalArtistsSum / totalArtists / 1000)
					var eta = parseFloat(((artistLength * time_avg)/60/60).toFixed(2));
					var totalProcessingTime = parseFloat(((totalArtistsSum)/1000/60/60/24).toFixed(2));
					
					var minutes1 = false;
					time_avg = parseFloat(time_avg.toFixed(2));
					
					var total_minutes = false;
					
					if(totalArtistsAvg >= 60){
						totalArtistsAvg = parseFloat((totalArtistsAvg/60).toFixed(2));
						total_minutes = true;
					}
					else{
						totalArtistsAvg = parseFloat(totalArtistsAvg.toFixed(2));
					}
					
					const ARecord = client.sequelize.import(`../models/ArtistRecord.js`);
					var aRec = await ARecord.findAll();
					
					var c = 0;
					var description = artistList
					  .slice(0, 10)
					  .map(k => `${++c}. **${k.artistName}**\n${k.guildName} | ${k.userName} - ${k.chartType} ${k.crownHolder != `` ? `| :crown: [` + k.crownHolder + `](https://www.last.fm/user/` + k.crownHolder + `) (` + k.crownPlays + `) :crown:` : ``}`) 
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
						.map(k => `${++z}. **${k.artistName}**\n${k.guildName} ${k.prevOwner != `` ? `| :crown: [` + k.prevOwner + `]` + `(https://www.last.fm/user/` + k.prevOwner + `) (` + k.prevPlays + `)  **→** [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:` : `| :crown: New: [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:`}`) 
						.join(`\n`);
						if(description.length > 2048){
							z = 0;
							description = temp_desc + `\n\n**Recently Processed**\n`;
							description += aRec
							.slice(aRec.length - 2, aRec.length)
							.map(k => `${++z}. **${k.artistName}**\n${k.guildName} ${k.prevOwner != `` ? `| :crown: [` + k.prevOwner + `]` + `(https://www.last.fm/user/` + k.prevOwner + `) (` + k.prevPlays + `)  **→** [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:` : `| :crown: New: [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:`}`) 
							.join(`\n`);
							
							if(description.length > 2048){
								z = 0;
								description = temp_desc + `\n\n**Recently Processed**\n`;
								description += aRec
								.slice(aRec.length - 1, aRec.length)
								.map(k => `${++z}. **${k.artistName}**\n${k.guildName} ${k.prevOwner != `` ? `| :crown: [` + k.prevOwner + `]` + `(https://www.last.fm/user/` + k.prevOwner + `) (` + k.prevPlays + `)  **→** [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:` : `| :crown: New: [` + k.newOwner + `](https://www.last.fm/user/` + k.newOwner + `) (` + k.newPlays + `) :crown:`}`) 
								.join(`\n`);
								if(description.length > 2048){
									description = temp_desc;
								}
							}
							
						}
	
					}
					//console.log(ARTIST_AVG);
					var ARTIST_AVG_DISPLAY = (totalArtistsAvg/1000).toFixed(2);
					var embed = new MessageEmbed()
					  .setColor(message.member.displayColor)
					  .setTitle(`**Artist Crown Queue**`)
					  .setDescription(description)
					  .setTimestamp()
					  .setFooter(artistLength + ` artists in queue | ` + time_avg + ` ${minutes1 == true ? `min/artist` : `sec/artist`} | ~` + eta + ` hours until complete\n` +
								totalArtists + ` total artists processed | ` + totalArtistsAvg + ` ${total_minutes == true ? `min/artist` : `sec/artist`} | ~` + totalProcessingTime + ` days spent processing\n` , `https://i.imgur.com/ysyfHk7.gif`)
					if(msg){
						await msg.edit({embed});
					}
					else{
						var msg = await message.channel.send({embed});
					}
					if(artistLength == 0){
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
				const Crowns = client.sequelize.import(`../models/Crowns.js`);
				const Artists = client.sequelize.import(`../models/Artists.js`);
				const Notifs = client.sequelize.import(`../models/Notifs.js`);
				const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
				const ArtistRecord = client.sequelize.import(`../models/ArtistRecord.js`);
				
				var artistName = artistList[0].artistName;
				//console.log(artistName);
				const know = [];
				const data = await lib.artist.getInfo(artistName);
					
				const hasCrown = await Crowns.findOne({
					  where: {
						guildID: artistList[0].guildID,
						artistName: data.artist.name
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
				var gIDs = artistList[0].guildUserIDs.split(`,`);
				var gUsers = artistList[0].guildUsers.split(`~,~`);
				for (var i = 0; i < gIDs.length; i++) {
				  const user = await fetchUser.usernameFromId(gIDs[i]);
				  if (!user) continue;
				  
				  const req = await lib.artist.getInfo(artistName, user);
				  
				  if(gIDs[i] == origKing){
					 if(req.artist.stats.userplaycount){
						 origKingPlays = req.artist.stats.userplaycount;
						 origKingUser = user;
					 }
					 else{
						 origKingPlays = `0`;
						 origKingUser = user;
						 continue;
					 } 
				  }

				  if (!req.artist.stats.userplaycount) continue;
					
				  total += parseInt(req.artist.stats.userplaycount);
				  if(parseInt(req.artist.stats.userplaycount) > 0){
					  listeners++;
				  }
				  
				  const data = {
					name: gUsers[i],
					userID: gIDs[i],
					plays: req.artist.stats.userplaycount	
				  };
				  know.push(data);
				}

				const sorted = know.sort(sortingFunc)[0];
				
				if (hasCrown === null && sorted.plays !== `0`) {
					  await Crowns.create({
						guildID: artistList[0].guildID,
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
						guildID: artistList[0].guildID,
						artistName: data.artist.name
					  }
					});
				  var plays = hasCrown.artistPlays;
				  if (!gIDs.includes(origKing)){
					 try{
						await Crowns.update({
						  userID: sorted.userID,
						  artistPlays: sorted.plays
						},
						{
						  where: {
							guildID: artistList[0].guildID,
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
						  guild: artistList[0].guildName,
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
						  guild: artistList[0].guildName,
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
						for(var tries = 0; tries < 10; tries++){
						   var orig = await lib.artist.getInfo(artistName, origKingUser);
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
								guildID: artistList[0].guildID,
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
							  guild: artistList[0].guildName,
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
							  guild: artistList[0].guildName,
							  artist: data.artist.name
							});
						}
					 }
					 
					 
					 
					 
					 
					 
					 catch(e){
						console.log(e);
						await ArtistQueue.destroy({
						  where: {
							guildID: artistList[0].guildID,
							artistName: artistList[0].artistName
						  }
						});
					 }
				  }
				}
				
				var crownExists = await Crowns.findOne({
						
						where: {
							
							artistName: data.artist.name,
							guildID: artistList[0].guildID
							
						}
						
					});
					
					//console.log(crownExists);
					
					if(crownExists != null){
						
						var newHolder = await fetchUser.usernameFromId(crownExists.userID);
						
						
						await ArtistRecord.create({
							
							artistName: data.artist.name,
							guildName: artistList[0].guildName,
							prevOwner: artistList[0].crownHolder,
							newOwner: newHolder,
							prevPlays: artistList[0].crownPlays,
							newPlays: crownExists.artistPlays
							
							
						});
						
						
					}
				
				
				
				
			 }
					catch(e){
							console.log(e);
							await ArtistQueue.destroy({
							  where: {
								guildID: artistList[0].guildID,
								artistName: artistList[0].artistName
							  }
							});
						 }
					var time_after = Date.now();
						var time_diff = time_after - time_before;
						time_diff = time_diff.toString();
						await Time.create({
							ms: time_diff,
							isArtist: `true`,
							guildID: artistList[0].guildID
					});
					
					
				
					await ArtistQueue.destroy({
					  where: {
						guildID: artistList[0].guildID,
						artistName: artistList[0].artistName
					  }
					});
					
					
					artistList = await ArtistQueue.findAll();
				  artistLength = artistList.length;
				  if(artistLength == 0){
						return message.reply(`the artist crown queue is now empty!`);
					}
					
		
					//await sleep(30000);
					
				await sleep(0);
				
					
				
			  }
			}
				  artistList = await ArtistQueue.findAll();
				  artistLength = artistList.length;
				  if(artistLength == 0){
						return message.reply(`the artist crown queue is now empty!`);
					}
		}
};

exports.help = {
  name: `artq`,
  description: `**ART**IST **Q**UEUE: check the artist queue`,
  usage: `only the bot owner can run the queue and use a live queue`
};