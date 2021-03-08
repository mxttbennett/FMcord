/*
for(var i = 0, size = artistArray.length; i < size; i++){
		console.log(i.toString() + " index (" + thread + ")");
		try {
			const Users = client.sequelize.import(`../models/Users.js`);
			const Crowns = client.sequelize.import(`../models/Crowns.js`);
			const Artists = client.sequelize.import(`../models/Artists.js`);
			const Notifs = client.sequelize.import(`../models/Notifs.js`);
			const WNotifs = client.sequelize.import(`../models/WNotifs.js`);
			var artistName = artistArray[i];
			if(message.guild.id == 447838857606463489 || message.guild.id == 519948282814791680 || message.guild.id == 671074176622264320){
				var time = 0;
			}
			else{
				var time = getRandomInt(1200000, 3600000);
			}
			console.log(`[Thread No. ` + thread + ` - #` + iter + `] ` + message.author.username + ` (` + message.guild.id + `) [` + time + ` ms]\nupdating crowns for ` + artistName);
			iter++;
			const user = await fetchUser.username();
			const know = [];
			const data = await lib.artist.getInfo(artistName);
			
			
			const hasCrown = await Crowns.findOne({
			  where: {
				guildID: message.guild.id,
				artistName: data.artist.name
			  }
			});
			

			var origKing = ``;
			var origKingPlays = ``;
			var origKingUser = ``;
			if(hasCrown != null){
				origKing = hasCrown.userID;
			}
			
			const guild = await message.guild.fetchMembers();
			var total = 0;
			var listeners = 0;
			for (const [id, member] of guild.members) {
			  const user = await fetchUser.usernameFromId(id);
			  if (!user) continue;
			  const req = await lib.artist.getInfo(artistName, user);
			  
			  if(member.user.id == origKing){
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
				name: member.user.username,
				userID: member.user.id,
				plays: req.artist.stats.userplaycount	
			  };
			  know.push(data);
			  await sleep(500);
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
					console.log(e);
				 }
			  }
			}
			
			if(message.guild.id != 447838857606463489 && message.guild.id != 519948282814791680 && message.guild.id != 671074176622264320){
				await sleep(time);
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
			var artistName = artistArray[i];
			var albumName = albumArray[i];
			if(message.guild.id == 447838857606463489 || message.guild.id == 519948282814791680 || message.guild.id == 671074176622264320){
				var time = getRandomInt(150000, 750000);
			}
			else{
				var time = getRandomInt(1200000, 3600000);
			}
			console.log(`[Thread No. ` + thread + ` - #` + iter + `] ` + message.author.username + ` (` + message.guild.id + `) [` + time + ` ms]\nupdating crowns for ` + artistName + ` - ` + albumName);
			iter++;
			const user = await fetchUser.username();
			const know = [];
			const data = await lib.album.getInfo(artistName, albumName);
				
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

			const guild = await message.guild.fetchMembers();
			var total = 0;
			var listeners = 0;
			for (const [id, member] of guild.members) {
			  const user = await fetchUser.usernameFromId(id);
			  if (!user) continue;
			  const req = await lib.album.getInfo(artistName, albumName, user);
				
			  if(member.user.id == origKing){
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
			  await sleep(500);
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
			
			await sleep(time);
			
		  } catch (e) {
			if (e.name !== `SequelizeUniqueConstraintError`) {
			  console.error(e);
			  //await message.channel.send(client.snippets.error);
			}
		  }
	}
*/