const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);
const Library = require(`../lib/index.js`);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function removeDuplicates(originalArray, objKey1) {
  var trimmedArray = [];
  var values = [];
  var artist;

  for(var i = 0; i < originalArray.length; i++) {
    artist = originalArray[i][objKey1];

    if(values.indexOf(artist) === -1){
      trimmedArray.push(originalArray[i]);
      values.push(artist);
    }
  }

  return trimmedArray;

};


exports.run = async (client, message, args) => {
  try {
	if(message.author.id != `175199958314516480`){
		return message.reply(`you do not have access to this command.`);
	}
	  message.channel.send(`updating artist crown database...`);
      const fetchUser = new fetchuser(client, message);
      const Crowns = client.sequelize.import(`../models/Crowns.js`);
	  const Artists = client.sequelize.import(`../models/Artists.js`);
	  const lib = new Library(client.config.lastFM.apikey);
      
	  const userCrowns = await Crowns.findAll();
      var validCrowns = userCrowns
        .map(x => {
          return {
			id: x.get(`id`),
            name: x.get(`artistName`),
            plays: parseInt(x.get(`artistPlays`)),
            userID: x.get(`userID`),
            guildID: x.get(`guildID`),
			url: x.get(`artistURL`)
          };
        })
		.sort((a,b) => b.plays - getRandomInt(1, b.plays * 2));
		
	  var alreadyChecked = [];
	  var counter = 0;
	  var destroyed = 0;
	  var mismatches = 0;
	  var url = 0;
	  for(var i = 0; i < validCrowns.length; i++){
		  if(!alreadyChecked.includes(validCrowns[i].name + ` ~!|412678|!~ `)){
			  // console.log(`${++counter} ` + validCrowns[i].name);
			var data;
			try{
				data = await lib.artist.getInfo(validCrowns[i].name);
			}
			catch(e){
				// console.log(`${counter} ` + e);
				data = await lib.artist.getInfo(`Coldplay`);
				if(!data.artist){
					continue;
				}
				else{
					// console.log(`ARTIST CROWNS / ARTISTS: Destroyed crowns for ` + validCrowns[i].name);
					if(args[0] != `--quiet`){
						message.channel.send(`ARTIST CROWNS / ARTISTS: Destroyed crowns for \`` + validCrowns[i].name + `\``);
					}
					destroyed++;
					await Crowns.destroy({
							  where: {
								artistName: validCrowns[i].name
							  }
							});
					await Artists.destroy({
							  where: {
								artistName: validCrowns[i].name
							  }
							});
					continue;
				}
			}

			
			if(validCrowns[i].name != data.artist.name || validCrowns[i].url != data.artist.url){
				if(validCrowns[i].url != data.artist.url && validCrowns[i].name == data.artist.name){
					// console.log(`ARTIST CROWNS / ARTISTS` + validCrowns[i].name);
					if(args[0] != `--quiet`){
						message.channel.send(`ARTIST CROWNS / ARTISTS: URL changed for \`` + validCrowns[i].name + `\``);
					}
					url++;
				}
				else{
					// console.log(`ARTIST CROWNS / ARTISTS: Corrected a mismatch for ` + validCrowns[i].name + ` (changed to ` + data.artist.name + `)`);
					if(args[0] != `--quiet`){
						message.channel.send(`ARTIST CROWNS / ARTISTS: Corrected a mismatch for \`` + validCrowns[i].name + `\` (changed to \`` + data.artist.name + `\`)`);
					}
					mismatches++;
				}
					
					await Crowns.update({
							artistName: data.artist.name,
							artistURL: data.artist.url,
							tinyURL: null
						},
						{
						  where: {
							artistName: validCrowns[i].name
						  }
						});
						
					await Artists.update({
							artistName: data.artist.name,
							artistURL: data.artist.url
						},
						{
						  where: {
							artistName: validCrowns[i].name
						  }
						});
			}
			alreadyChecked.push(validCrowns[i].name + ` ~!|412678|!~ `);
		  }
	  }
	  
	  
	  // removing duplicates
	  const userCrowns2 = await Crowns.findAll();
	  var validCrowns2 = userCrowns2
        .map(x => {
          return {
			id: x.get(`id`),
            name: x.get(`artistName`),
            plays: parseInt(x.get(`artistPlays`)),
            userID: x.get(`userID`),
            guildID: x.get(`guildID`),
			url: x.get(`artistURL`),
			id: x.get(`id`)
          };
        })
		.sort((a,b) => b.plays - getRandomInt(1, b.plays * 2));
		
		var alreadyCheckedDupe = [];
		var duplicates = 0;
		for(var i = 0; i < validCrowns2.length; i++){
			if(!alreadyCheckedDupe.includes(validCrowns2[i].name + ` ~!|412678|!~ ` + validCrowns2[i].guildID)){
				var getCrown = await Crowns.findAll({
				  where: {
					artistName: validCrowns2[i].name,
					guildID: validCrowns2[i].guildID
				  }
				});
				if(getCrown.length > 1){
					var max = -Infinity;
					var id;
					for(var i = 0; i < getCrown.length; i++){
						if(parseInt(getCrown[i].artistPlays) > max){
							max = parseInt(getCrown[i].artistPlays);
							id = getCrown[i].id;
						}
					}
					for(var i = 0; i < getCrown.length; i++){
						if(getCrown[i].id != id){
							// console.log(`destroyed a duplicate copy for ` + getCrown[i].artistName);
							if(args[0] != `--quiet`){
								message.channel.send(`destroyed a duplicate copy for \`` + getCrown[i].artistName + `\``);
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
				var getArtist = await Artists.findAll({
				  where: {
					artistName: validCrowns2[i].name
				  }
				});
				if(getArtist.length > 1){
					var id = getArtist[0].id;
					for(var i = 0; i < getArtist.length; i++){
						if(getArtist[i].id != id){
							// console.log(`ARTISTS: Destroyed a duplicate copy for ` + getArtist[i].artistName);
							if(args[0] != `--quiet`){
								message.channel.send(`ARTISTS: Destroyed a duplicate copy for \`` + getArtist[i].artistName + `\``);
							}								
							await Artists.destroy({
								  where: {
									id: getArtist[i].id
								  }
							});
						}
					}
				}
				alreadyCheckedDupe.push(validCrowns2[i].name + ` ~!|412678|!~ ` + validCrowns2[i].guildID);
			}
		}
		var errors = destroyed + mismatches + duplicates + url;
		var destroy = destroyed + duplicates;
		message.reply(`out of **${validCrowns.length}** artist crowns, **${errors}** total errors encountered (` + parseFloat(parseFloat(parseFloat(errors)/parseFloat(validCrowns.length)*100).toFixed(2)) + `%). **${mismatches}** mismatches handled, **${url}** URLs changed, and **${destroy}** crowns destroyed, **${duplicates}** of which were duplicates and the remaining **${destroyed}** were mistagged.`);

  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `up`,
  description: `**UP**DATE: Updates the artist crown database. Since this is a very resource-intensive process, only the bot owner has permission to use this command.`,
  usage: `up`,
  notes: `Admin command`
};
