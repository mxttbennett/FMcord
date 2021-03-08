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
  `would be: \`-chart <time period> <grid size>\``;
  let vals, x, y;
  let multi;

  if (!args[0]) {
    period = `7day`;
    vals = [`5`, `5`];
    [x, y] = [parseInt(vals[0]), parseInt(vals[1])];
	multi = x * y;
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
	  multi = x * y;
    } else {
      vals = args[1].split(`x`);
      if (vals === args[1] || vals.length !== 2)
        return message.channel.send(usageWarning);

      const axisArray = [parseInt(vals[0]), parseInt(vals[1])];
      if (axisArray.some(isNaN))
        return message.channel.send(usageWarning);

      [x, y] = axisArray;
	  multi = x * y;
      if (x > 5 || y > 10) return message.channel.send(`The first number of ` +
      `the chart dimensions must not be bigger than 5 tiles and the last number of ` +
      `the chart dimensions must not be bigger than 10 tiles!`);
    }
  }

  try {
    const user = await fetchUser.username();
    if (!user) return message.reply(client.snippets.noLogin);
     message.react(`✅`);

    const data = await lib.user.getTopAlbums(user, period, multi);

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
	const scrobs = [];
	
	for(var z = 0; z < multi; z++){ 
		album.forEach(a => names.push(`${a.artist.name} - ${a.name}`));
	}
	
	for(var z = 0; z < multi; z++){ 
		album.forEach(a => scrobs.push(`[${a.playcount} scrobbles]`));
	}
	
	
	
	
    let longestNum = -Infinity;
    let longestName;
    names.forEach(name => {
      if (longestNum < name.length) {
        longestNum = name.length;
        longestName = name + ` [88888 scrobbles]`;
      }
    });

    const { width } = ctx.measureText(longestName);
    const xAxis = x * 100 + 120 + width;
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
      
		 if (scrobs[i]){
		  fctx.fillStyle = `#16E6FF`;
			if (scrobs[i] == `[1 scrobbles]`){
				fctx.fillText(names[i] + ` [1 scrobble]`, x * 100 + 15, yAxis);
			}
			else{
			fctx.fillText(names[i] + ` ` + scrobs[i], x * 100 + 15, yAxis);
			}
		 }
		 if (names[i])
			fctx.fillStyle = `white`;
          fctx.fillText(names[i], x * 100 + 15, yAxis);
		  fctx.fillText(names[i], x * 100 + 15, yAxis);
		  fctx.fillText(names[i], x * 100 + 15, yAxis);
		  fctx.fillText(names[i], x * 100 + 15, yAxis);
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
    await message.reply(`here is your \`` + timeframe + `\` chart.`, { file: buffer });
	
	
    
	
	
	
  } catch (e) {
    console.error(e);
    //await message.channel.send(client.snippets.error);
  }

  
try{
	const user = await fetchUser.username();
	var albumArray = [];
	var artistArray =[];
	for (var i = 0; i < 4; i++){
		var data2 = await lib.user.getTopAlbums(user, period, 500, parseInt(page) + i);
		var { album } = data2.topalbums;
		album.forEach(a => artistArray.push(`${a.artist.name}`));
		album.forEach(a => albumArray.push(`${a.name}`));
		
		await sleep(2000);
		
	}
}catch (e) {
    console.error(e);
}

const cType = `m`;
//console.log(artistArray);
//console.log(artistArray.length);
//await sleep(getRandomInt(15000, 120000));
const ArtistQueue = client.sequelize.import(`../models/ArtistQueue.js`);
const AlbumQueue = client.sequelize.import(`../models/AlbumQueue.js`);
const ACrowns = client.sequelize.import(`../models/ACrowns.js`);
var gIDs = ``;
var gUsers = ``;
const guild = await message.guild.fetchMembers();
for (const [id, member] of guild.members) {
	gIDs += id.toString() + `,`;
    gUsers += member.user.username + `~,~`;
}
for(var i = 0; i < artistArray.length; i++){
	var artistExists = await ArtistQueue.findOne({
		where: {
			guildID: message.guild.id,
			artistName: artistArray[i]
		}
	});
	if (artistExists == null){
		const Crowns = client.sequelize.import(`../models/Crowns.js`);
		var crownExists = await Crowns.findOne({
			where: {
				guildID: message.guild.id,
				artistName: artistArray[i]
			}
		});
		
		var lfmUsername = ``;
		var crownPlays = `0`;
		if(crownExists != null){
			lfmUsername = await fetchUser.usernameFromId(crownExists.userID);
			crownPlays = crownExists.artistPlays;
		}
		
		
		await ArtistQueue.create({
			guildID: message.guild.id,
			guildName: message.guild.name,
			guildUserIDs: gIDs,
			guildUsers: gUsers,
			userID: message.member.id,
			userName: message.member.user.username,
			artistName: artistArray[i],
			chartType: cType,
			crownHolder: lfmUsername,
			crownPlays: crownPlays
		  });
	}
	var albumExists = await AlbumQueue.findOne({
		where: {
			guildID: message.guild.id,
			artistName: artistArray[i],
			albumName: albumArray[i]
		}
	});
	if (albumExists == null){
		
		var albumCrownExists = await ACrowns.findOne({
			where: {
				guildID: message.guild.id,
				artistName: artistArray[i],
				albumName: albumArray[i]
			}
		});
		
		var lfmUsername = ``;
		var crownPlays = `0`;
		if(albumCrownExists != null){
			lfmUsername = await fetchUser.usernameFromId(albumCrownExists.userID);
			crownPlays = albumCrownExists.albumPlays;
		}
		
		await AlbumQueue.create({
			guildID: message.guild.id,
			guildName: message.guild.name,
			guildUserIDs: gIDs,
			guildUsers: gUsers,
			userID: message.member.id,
			userName: message.member.user.username,
			artistName: artistArray[i],
			albumName: albumArray[i],
			chartType: cType,
			crownHolder: lfmUsername,
			crownPlays: crownPlays
		});
	}
}
};

exports.help = {
  name: `chart`,
  description: `Builds a chart out of your most listened albums with ` +
  `names to the side.`,
  usage: `chart <time period> <chart dimensions>`,
  notes: `In time period, you can have "weekly" (alternatively "w"), "monthly" (alternatively "m"), "3month" (alternatively "3m"), "6month" (alternatively "6m"), "yearly" (alternatively "y"), or "alltime" (alternatively "o" or "at").`
};
