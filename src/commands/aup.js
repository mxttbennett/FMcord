const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);
const Library = require(`../lib/index.js`);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function removeDuplicates(originalArray, objKey1, objKey2) {
  var trimmedArray = [];
  var values = [];
  var artist;
  var album;

  for(var i = 0; i < originalArray.length; i++) {
    artist = originalArray[i][objKey1];
	album = originalArray[i][objKey2];

    if(values.indexOf(artist + ` ||| ` + album) === -1){
      trimmedArray.push(originalArray[i]);
      values.push(artist + ` ||| ` + album);
    }
  }

  return trimmedArray;

};

exports.run = async (client, message, args) => {
  try {
	if(message.author.id != `175199958314516480`){
		return message.reply(`you do not have access to this command.`);
	}
	  message.channel.send(`updating album crown database...`);
      const fetchUser = new fetchuser(client, message);
      const Crowns = client.sequelize.import(`../models/ACrowns.js`);
	  const Albums = client.sequelize.import(`../models/Albums.js`);
	  const lib = new Library(client.config.lastFM.apikey);
      
      const userCrowns = await Crowns.findAll();
      var validCrowns = userCrowns
        .map(x => {
          return {
			albname: x.get(`albumName`),
            name: x.get(`artistName`),
            plays: parseInt(x.get(`albumPlays`)),
            userID: x.get(`userID`),
            guildID: x.get(`guildID`),
			url: x.get(`albumURL`)
          };
        })
		.sort((a,b) => b.plays - getRandomInt(1, b.plays * 2));
	  
	  var alreadyChecked = [];
	  var counter = 0;
	  var destroyed = 0;
	  var mismatches = 0;
	  var url = 0;
	  for(var i = 0; i < validCrowns.length; i++){
		  if(!alreadyChecked.includes(validCrowns[i].name + ` ~!|412678|!~ ` + validCrowns[i].albname)){
			  // console.log(`${++counter} ` + validCrowns[i].name + ` - ` + validCrowns[i].albname);
			var data;
			try{
				data = await lib.album.getInfo(validCrowns[i].name, validCrowns[i].albname);
			}
			catch(e){
				// console.log(`${counter} ` + e);
				data = await lib.album.getInfo(`Coldplay`, `Parachutes`);
				if(!data.album){
					continue;
				}
				else{
					// console.log(`ALBUM CROWNS / ALBUMS: Destroyed crowns for ` + validCrowns[i].name + ` - ` + validCrowns[i].albname);
					if(args[0] != `--quiet`){
						message.channel.send(`ALBUM CROWNS / ALBUMS: Destroyed crowns for \`` + validCrowns[i].name + ` - ` + validCrowns[i].albname + `\``);
					}
					destroyed++;
					await Crowns.destroy({
							  where: {
								artistName: validCrowns[i].name,
								albumName: validCrowns[i].albname
							  }
							});
					await Albums.destroy({
							  where: {
								artistName: validCrowns[i].name,
								albumName: validCrowns[i].albname
							  }
							});
					continue;
				}
			}

			
			if(validCrowns[i].name != data.album.artist || validCrowns[i].albname != data.album.name || validCrowns[i].url != data.album.url){
				if(validCrowns[i].url != data.album.url && validCrowns[i].name == data.album.artist && validCrowns[i].albname == data.album.name){
					// console.log(`ALBUM CROWNS / ALBUMS: URL changed for ` + validCrowns[i].name + ` - ` + validCrowns[i].albname);
					if(args[0] != `--quiet`){
						message.channel.send(`ALBUM CROWNS / ALBUMS: URL changed for \`` + validCrowns[i].name + ` - ` + validCrowns[i].albname + `\``);
					}
					url++;
				}
				else{
					// console.log(`ALBUM CROWNS / ALBUMS: Corrected a mismatch for ` + validCrowns[i].name + ` - ` + validCrowns[i].albname + ` (changed to ` + data.album.artist + ` - ` + data.album.name + `)`);
					if(args[0] != `--quiet`){
						message.channel.send(`ALBUM CROWNS / ALBUMS: Corrected a mismatch for \`` + validCrowns[i].name + ` - ` + validCrowns[i].albname + `\` (changed to \`` + data.album.artist + ` - ` + data.album.name + `\`)`);
					}
					mismatches++;
				}
					await Crowns.update({
							artistName: data.album.artist,
							albumName: data.album.name,
							albumURL: data.album.url,
							tinyURL: null
						},
						{
						  where: {
							artistName: validCrowns[i].name,
							albumName: validCrowns[i].albname
						  }
						});
					await Albums.update({
							artistName: data.album.artist,
							albumName: data.album.name,
							albumURL: data.album.url
						},
						{
						  where: {
							artistName: validCrowns[i].name,
							albumName: validCrowns[i].albname
						  }
						});
			}
			alreadyChecked.push(validCrowns[i].name + ` ~!|412678|!~ ` + validCrowns[i].albname);
		  }
	  }
	  
	  
	  // removing duplicates
	  const userCrowns2 = await Crowns.findAll();
	  var validCrowns2 = userCrowns2
        .map(x => {
          return {
			albname: x.get(`albumName`),
            name: x.get(`artistName`),
            plays: parseInt(x.get(`albumPlays`)),
            userID: x.get(`userID`),
            guildID: x.get(`guildID`),
			url: x.get(`albumURL`),
			id: x.get(`id`)
          };
        })
		.sort((a,b) => b.plays - getRandomInt(1, b.plays * 2));
		
		var alreadyCheckedDupe = [];
		var duplicates = 0;
		for(var i = 0; i < validCrowns2.length; i++){
			if(!alreadyCheckedDupe.includes(validCrowns2[i].name + ` ~!|412678|!~ ` + validCrowns2[i].albname + ` ~!|41267fafaf8|!~ ` + validCrowns2[i].guildID)){
				var getCrown = await Crowns.findAll({
				  where: {
					artistName: validCrowns2[i].name,
					albumName: validCrowns2[i].albname,
					guildID: validCrowns2[i].guildID
				  }
				});
				if(getCrown.length > 1){
					var max = -Infinity;
					var id;
					for(var i = 0; i < getCrown.length; i++){
						if(parseInt(getCrown[i].albumPlays) > max){
							max = parseInt(getCrown[i].albumPlays);
							id = getCrown[i].id;
						}
					}
					for(var i = 0; i < getCrown.length; i++){
						if(getCrown[i].id != id){
							// console.log(`ALBUM CROWNS: Destroyed a duplicate copy for ` + getCrown[i].artistName + ` - ` + getCrown[i].albumName);
							if(args[0] != `--quiet`){
								message.channel.send(`ALBUM CROWNS: Destroyed a duplicate copy for \`` + getCrown[i].artistName + ` - ` + getCrown[i].albumName + `\``);
							}
							duplicates++;							
							await Crowns.destroy({
								  where: {
									id: getCrown[i].id
								  }
							});
						}
					}
				}
				var getAlbum = await Albums.findAll({
				  where: {
					artistName: validCrowns2[i].name,
					albumName: validCrowns2[i].albname
				  }
				});
				if(getAlbum.length > 1){
					var id = getAlbum[0].id;
					for(var i = 0; i < getAlbum.length; i++){
						if(getAlbum[i].id != id){
							// console.log(`ALBUMS: Destroyed a duplicate copy for ` + getAlbum[i].artistName + ` - ` + getAlbum[i].albumName);
							if(args[0] != `--quiet`){
								message.channel.send(`ALBUMS: Destroyed a duplicate copy for \`` + getAlbum[i].artistName + ` - ` + getAlbum[i].albumName + `\``);
							}								
							await Albums.destroy({
								  where: {
									id: getAlbum[i].id
								  }
							});
						}
					}
				}
				alreadyCheckedDupe.push(validCrowns2[i].name + ` ~!|412678|!~ ` + validCrowns2[i].albname + ` ~!|41267fafaf8|!~ ` + validCrowns2[i].guildID);
			}
		}
		var errors = destroyed + mismatches + duplicates + url;
		var destroy = destroyed + duplicates;
		message.reply(`out of **${validCrowns.length}** album crowns, **${errors}** total errors encountered (` + parseFloat(parseFloat(parseFloat(errors)/parseFloat(validCrowns.length)*100).toFixed(2)) + `%). **${mismatches}** mismatches handled, **${url}** URLs changed, and **${destroy}** crowns destroyed, **${duplicates}** of which were duplicates and the remaining **${destroyed}** were mistagged.`);
    } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `aup`,
  description: `**A**LBUM **UP**DATE: Updates the album crown database. Since this is a very resource-intensive process, only the bot owner has permission to use this command.`,
  usage: `aup`,
  notes: `Admin command`
};
