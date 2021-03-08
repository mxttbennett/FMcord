const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const { Op } = require(`sequelize`);
const Library = require(`../lib/index.js`);
const ReactionInterface = require(`../utils/ReactionInterface`);

exports.run = async (client, message, args) => {
  const fetchUser = new fetchuser(client, message);
  const fetchTrack = new fetchtrack(client, message);
  const lib = new Library(client.config.lastFM.apikey);
  const orig_art = args.join(` `);
  try {
    const Users = client.sequelize.import(`../models/Users.js`);
    const Artists = client.sequelize.import(`../models/Artists.js`);
	const Crowns = client.sequelize.import(`../models/Crowns.js`);
    const Notifs = client.sequelize.import(`../models/Notifs.js`);
	
	/*
	for(var i = 1; i < 26678; i++){
		var crownExists = await Crowns.findOne({
		  where: {
			id: i
		  }
		});
		if(crownExists != null){
			if(crownExists.artistName != null && crownExists.artistURL != null){
				var artistExists = await Artists.findOne({
				  where: {
					artistName: crownExists.artistName
				  }
				});
				if(artistExists != null){
					if(artistExists.artistURL == null){
						await Artists.update({
							  artistURL: crownExists.artistURL
							},
							{
							  where: {
								artistName: crownExists.artistName
							  }
						});
						console.log(`updated ` + crownExists.artistName);
					}
				}
				else{
					await Artists.create({
						artistName: crownExists.artistName,
						artistURL: crownExists.artistURL
					});
					console.log(`created ` + crownExists.artistName);
				}
			}
		}
	}
	*/
	
	
		
  } catch (e) {
    if (e.name !== `SequelizeUniqueConstraintError`) {
      console.error(e);
			await message.reply(`an error occurred. Last.fm may currently be experiencing issues.`);
	 }
  }
};

exports.help = {
  name: `transfer`,
  description: `Transfers artists from Crowns to Artists.`,
  usage: `transfer`,
  notes: `N/A`
};
