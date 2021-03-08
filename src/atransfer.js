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
    const Albums = client.sequelize.import(`../models/Albums.js`);
	const Crowns = client.sequelize.import(`../models/ACrowns.js`);
    const Notifs = client.sequelize.import(`../models/Notifs.js`);
	
	for(var i = 1; i < 31654; i++){
		var crownExists = await Crowns.findOne({
		  where: {
			id: i
		  }
		});
		if(crownExists != null){
			if(crownExists.artistName != null && crownExists.albumName != null&& crownExists.albumURL != null){
				var albumExists = await Albums.findOne({
				  where: {
					artistName: crownExists.artistName,
					albumName: crownExists.albumName
				  }
				});
				if(albumExists != null){
					if(albumExists.albumURL == null){
						await Albums.update({
							  albumURL: crownExists.albumURL
							},
							{
							  where: {
								artistName: crownExists.artistName,
								albumName: crownExists.albumName
							  }
						});
						console.log(`updated ` + crownExists.artistName + ` - ` + crownExists.albumName);
					}
				}
				else{
					await Albums.create({
						artistName: crownExists.artistName,
						albumName: crownExists.albumName,
						albumURL: crownExists.albumURL
					});
					console.log(`created ` + crownExists.artistName + ` - ` + crownExists.albumName);
				}
			}
		}
	}
	
	
	
		
  } catch (e) {
    if (e.name !== `SequelizeUniqueConstraintError`) {
      console.error(e);
			await message.reply(`an error occurred. Last.fm may currently be experiencing issues.`);
	 }
  }
};

exports.help = {
  name: `atransfer`,
  description: `Transfers albums from Crowns to Albums.`,
  usage: `atransfer`,
  notes: `N/A`
};
