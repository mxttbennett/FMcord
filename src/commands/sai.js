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
    const Notifs = client.sequelize.import(`../models/Notifs.js`);
	var splitArr = args.join(` `).split(` | `);
    var artistName = splitArr[0];
	
	if(message.attachments.size == 1){
		var url = message.attachments.first().url;
	}
	else{
		return message.reply(`use \`-sai\` \`artist_name\` and upload the artist image at the same time to set the artist image.`);
	}
	/*
	else if(!splitArr[1] && message.attachments.size != 1){
		return message.reply(`you need to input an artist name and an image link in the following format: \`artist_name | image_url\`. Alternatively, you can upload an image and use \`-sai\` \`artist_name\`.`);
	}
	else{
		var url = splitArr[1];
	}*/
	
	message.react(`✅`);
	
    const data = await lib.artist.getInfo(artistName);
	if (!data.artist) return message.reply(`there is no such artist as ` +
    `\`${artistName}\` in Last.fm.`);
	
	var artistExists = await Artists.findOne({
	  where: {
		artistName: data.artist.name
	  }
	});
	
	var extension = url.slice(url.length - 4, url.length);
	if(extension == `jpeg`){
		extension = `.jpeg`;
	}
	
	if(extension != `.jpg` && extension != `.jpeg` && extension != `.png` && extension != `.gif`){
		return message.reply(`links must end with the following file extensions only: \`.jpg\`, \`.jpeg\`, or \`.png\`.`);
	}
	
	if ((artistExists != null && artistExists.contribID != `175199958314516480`) || (artistExists != null && artistExists.contribID == `175199958314516480` && message.author.id == `175199958314516480`)){
		await Artists.update({
			  artistURL: data.artist.url,
			  artistImgURL: url,
			  fileExtension: extension,
			  contribID: message.author.id
			},
			{
			  where: {
				artistName: data.artist.name
			  }
		});
	}
	else{
		await Artists.create({
			artistName: data.artist.name,
			artistURL: data.artist.url,
			artistImgURL: url,
			fileExtension: extension,
			contribID: message.author.id
		  });
	}
	
	var locateArtist = await Artists.findOne({
	  where: {
		artistName: data.artist.name
	  }
	});
	

	if(locateArtist.contribID != `175199958314516480` || (locateArtist.contribID == `175199958314516480` && message.author.id == `175199958314516480`)){
		
		var fs = require('fs'),
			request = require('request'),
			https = require('https');
	
		request({ url: url, encoding: null, forever: true }, (error, rsp, body) =>  {
		  fs.writeFile(`art_imgs/` + locateArtist.id + extension, body, 'binary', (err) => {
			console.log(data.artist.name + ` image saved`);
		  });
		});

		// request(url).pipe(fs.createWriteStream());

		return message.reply(`got it! the image for \`` + data.artist.name + `\` was set.`);
	}
	else{
		return message.reply(`you do not have permission to overwrite the image for this artist.`);
	}
		
  } catch (e) {
    if (e.name !== `SequelizeUniqueConstraintError`) {
      console.error(e);
			await message.reply(`an error occurred. Last.fm may currently be experiencing issues.`);
	 }
  }
};

exports.help = {
  name: `sai`,
  description: `Sets an artist image.`,
  usage: `sai \`artist_name\` (an image file must be uploaded with the conmand)`,
  notes: `Images with the following extensions are supported: \`.jpg\`, \`.jpeg\`, \`.png\`, \`gif\`.`
};
