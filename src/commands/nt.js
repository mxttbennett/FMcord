const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const Library = require(`../lib/index.js`);
const { Op } = require(`sequelize`);
const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);
let unique = new Set();
let period;
//const fs = require(`fs`);

/*
var artists_raw = 	fs.readFile(`${process.env.PWD}/artists.json`);
var artists = JSON.parse(artists_raw);
*/


const canvas = require(`canvas`);
canvas.registerFont(`${process.env.PWD}/NotoSansCJKjp-Regular.otf`, {
  family: `noto-sans`
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.run = async (client, message, args) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, message);
  const usageWarning = `Incorrect usage of a command! Correct usage ` +
  `would be: \`-nt <time period> <grid size>\``;
  let vals, x, y;

  if (!args[0]) {
    period = `7day`;
    vals = [`5`, `5`];
    [x, y] = [parseInt(vals[0]), parseInt(vals[1])];
  } else {
    switch (args[0]) {
    case `weekly`:
      period = `7day`;
      break;
    case `monthly`:
      period = `1month`;
      break;
    case `alltime`:
      period = `overall`;
      break;
    case `w`:
      period = `7day`;
      break;
    case `m`:
      period = `1month`;
      break;
    case `at`:
      period = `overall`;
      break;
    case `o`:
      period = `overall`;
      break;
	case `3month`:
      period = `3month`;
      break;
	case `3m`:
      period = `3month`;
      break;
	case `6month`:
      period = `6month`;
      break;
	case `6m`:
      period = `6month`;
      break;
	case `yearly`:
      period = `12month`;
      break;
	case `y`:
      period = `12month`;
      break;
    default:
      return message.channel.send(usageWarning);
    }

    if (!args[1]) {
      vals = [`5`, `5`];
      [x, y] = [parseInt(vals[0]), parseInt(vals[1])];
    } else {
      vals = args[1].split(`x`);
      if (vals === args[1] || vals.length !== 2)
        return message.channel.send(usageWarning);

      const axisArray = [parseInt(vals[0]), parseInt(vals[1])];
      if (axisArray.some(isNaN))
        return message.channel.send(usageWarning);

      [x, y] = axisArray;
	  /*
      if (x > 5 || y > 10) return message.channel.send(`The first number of ` +
      `the grid size must not be bigger than 5 tiles and the last number of ` +
      `the grid size must not be bigger than 10 tiles!`);
	  */
    }
  }

  try {
    const user = await fetchUser.username();
    if (!user) return message.reply(client.snippets.noLogin);
	var mult = parseInt(vals[0]) * parseInt(vals[1]);
	if (mult > 400) return message.reply(`the requested grid is too large. The grid's area must be 400 albums or fewer.`);
	if (mult > 200){
		if (vals[0] == 1 || vals[1] == 1){
			return message.reply(`if the requested grid's area is more than 200, one of the dimensions cannot be 1.`);
		}
	}
    message.react(`✅`);
	
	var mult = parseInt(vals[0]) * parseInt(vals[1]);
    const data = await lib.user.getTopAlbums(user, period, mult);

    const { album } = data.topalbums;

    const canv = canvas.createCanvas(x*100, y*100);
    const ctx = canv.getContext(`2d`);

    const proms = [];
    album.forEach(a => {
      if (a.image[3][`#text`].length > 0) {
        proms.push(canvas.loadImage(a.image[3][`#text`]));
      } else {
        proms.push(canvas.loadImage(`${process.env.PWD}/images/no_album.png`));
      }
    });
    const imgs = await Promise.all(proms);

    let iter = 0;
    for (let yAxis = 0; yAxis < y * 100; yAxis += 100) {
      if (imgs[iter] !== undefined) {
        for (let xAxis = 0; xAxis < x * 100; xAxis += 100) {
          if (imgs[iter] !== undefined) {
            ctx.drawImage(imgs[iter], xAxis, yAxis, 100, 100);
            iter++;
          } else break;
        }
      } else break;
    }

    const names = [];
	
	for(var z = 0; z < 100; z++){ 
		album.forEach(a => names.push(`${a.artist.name} - ${a.name}`));
	}
	
	
	
	
    let longestNum = -Infinity;
    let longestName;
    names.forEach(name => {
      if (longestNum < name.length) {
        longestNum = name.length;
        longestName = name;
      }
    });

    //const { width } = ctx.measureText(longestName);
    const xAxis = x * 100;
    const yAxis = y * 100;
    const finalCanvas = canvas.createCanvas(xAxis, yAxis);
    const fctx = finalCanvas.getContext(`2d`);
    fctx.fillStyle = `black`;
    fctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    fctx.drawImage(canv, 0, 0);
    fctx.fillStyle = `white`;
    fctx.font = `12px noto-sans`;
    let i = 0;
    for (let byChart = 0; byChart < 100 * y; byChart += 100) {
      for (let inChart = 15; inChart <= 15 * x; inChart += 15) {
        const yAxis = byChart + inChart;
        if (names[i])
          //fctx.fillText(names[i], x * 100 + 15, yAxis);
        i++;
      }
    }

    const buffer = finalCanvas.toBuffer();
	var timeframe = period;
	if (period == `7day`)
		timeframe = `weekly`;
	if (period == `1month`)
		timeframe = `monthly`;
	if (period == `3month`)
		timeframe = `3-month`;
	if (period == `6month`)
		timeframe = `6-month`;
	if (period == `12month`)
		timeframe = `yearly`;
	if (message.author.id == `435000596165165057`)
		await message.reply(`here is your \`` + timeframe + `\` chart. Get some damn album covers boiiiiiiiiiiiiiiiiiiii.`, { file: buffer });
	else
		await message.reply(`here is your \`` + timeframe + `\` chart.`, { file: buffer });
	
	
    
	
	
	
  } catch (e) {
    console.error(e);
    //await message.channel.send(client.snippets.error);
  }

  
/* 
for(var i = 0, size = unique2.length; i < size; i++){
	await message.channel.send("Artist #" + (i+1) + " " + unique2[i]);
}
*/

try{
	const Users = client.sequelize.import(`../models/Users.js`);
    const user = await fetchUser.username();
    const data2 = await lib.user.getTopAlbums(user, period, mult);
    const { album } = data2.topalbums;
    album.forEach(a => unique.add(`${a.artist.name}`));
	var unique2 = [];
	unique2 = Array.from(unique);
	
	//for(var p = 0, size = unique2.length; p < size; p++){
	 //await message.channel.send(`#` + p + ` updating crowns for ` + unique2[p]);
	//}
}
	
	catch (e) {
    console.error(e);
    //await message.channel.send(client.snippets.error);
  }

for(var i = 0, size = unique2.length; i < size; i++){ 
	try {
		const Users = client.sequelize.import(`../models/Users.js`);
		const Crowns = client.sequelize.import(`../models/Crowns.js`);
		const Notifs = client.sequelize.import(`../models/Notifs.js`);
		let artistName = unique2[i];
		//await message.channel.send(`updating crowns for ` + unique2[i]);
		const user = await fetchUser.username();
		const know = [];
		const data = await lib.artist.getInfo(artistName);

		const guild = await message.guild.fetchMembers();

		for (const [id, member] of guild.members) {
		  const user = await fetchUser.usernameFromId(id);
		  if (!user) continue;
		  const req = await lib.artist.getInfo(artistName, user);

		  if (!req.artist.stats.userplaycount) continue;

		  const data = {
			name: member.user.username,
			userID: member.user.id,
			plays: req.artist.stats.userplaycount
		  };
		  know.push(data);
		}

		// Giving a top-ranking listener in the guild his crown, if he still has none.
		const sorted = know.sort(sortingFunc)[0];
		const hasCrown = await Crowns.findOne({
		  where: {
			guildID: message.guild.id,
			artistName: data.artist.name
		  }
		});

		if (hasCrown === null && sorted.plays !== `0`) {
		  await Crowns.create({
			guildID: message.guild.id,
			userID: sorted.userID,
			artistName: data.artist.name,
			artistPlays: sorted.plays
		  });
		}


		else if (hasCrown !== null) {
		  const userID = hasCrown.userID;
		  const isUser = await Users.findOne({
			where: {
			  [Op.or]: [{discordUserID: userID}, {discordUserID: sorted.userID}]
			}
		  });
		  const plays = hasCrown.artistPlays;
		  if (parseInt(plays) < parseInt(sorted.plays)) {
			await Crowns.update({
			  userID: sorted.userID,
			  artistPlays: sorted.plays,
			},
			{
			  where: {
				guildID: message.guild.id,
				artistName: data.artist.name,
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
		  }
		}
		
		await sleep(20000);
		
	  } catch (e) {
		if (e.name !== `SequelizeUniqueConstraintError`) {
		  console.error(e);
		  //await message.channel.send(client.snippets.error);
		}
	  }
	};
};

exports.help = {
  name: `nt`,
  description: `Builds a no-titles chart out of your most listened albums.`,
  usage: `nt <time period> <chart dimensions>`,
  notes: `In time period, you can have "weekly" (alternatively "w"), "monthly" (alternatively "m"), "3month" (alternatively "3m"), "6month" (alternatively "6m"), "yearly" (alternatively "y"), or "alltime" (alternatively "o" or "at").`
};
