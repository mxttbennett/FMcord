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

function removeDuplicates(array) {
  return array.filter((a, b) => array.indexOf(a) === b)
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.run = async (client, message, args) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, message);
  const ACrowns = client.sequelize.import(`../models/ACrowns.js`);
  const usageWarning = `Incorrect usage of a command! Correct usage ` +
  `would be: \`&chart <time period> <grid size>\``;
  let vals, x, y;

    period = `1month`;
    vals = [`5`, `10`];
    [x, y] = [parseInt(vals[0]), parseInt(vals[1])];
  trial = 0;
  while(trial < 3){
	  try {
		const user = await fetchUser.username();
		if (!user) return message.reply(client.snippets.noLogin);
		 message.react(`✅`);
		 //message.channel.startTyping();

		var page = args.join(` `);
		var data;
		if(!page){
			page = 1;
			data = await lib.user.getTopAlbums(user, period, `50`, `1`);
		}
		else{
			if(parseInt(page) > 0){
			data = await lib.user.getTopAlbums(user, period, `50`, parseInt(page).toString());
			}
			else{
				page = 1;
				const data = await lib.user.getTopAlbums(user, period, `50`, `1`);
			}
		}

		const { album } = data.topalbums;

		const canv = canvas.createCanvas(x*100, y*100);
		const ctx = canv.getContext(`2d`);

		const proms = [];
		var num_missing = 0;
		album.forEach(a => {
		  if (a.image[3][`#text`].length > 0) {
			proms.push(canvas.loadImage(a.image[3][`#text`]));
		  } else {
			 num_missing += 1;
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

		var names = [];
		var art = [];
		var alb = [];
		var totalscrobs = [];
		var crowns = [];
		const scrobs = [];
		const scrobnum = [];
		const scrobsum = [];
		
		var date = parseInt(Math.floor(parseInt(Date.now())/1000));
		var date2 = parseInt(date - 2592000);
		const lfmuser = await fetchUser.get();
		
		const lUsername = lfmuser.get(`lastFMUsername`);
		const tracks = await lib.user.getRecentTracks(lUsername, 1, 1, date2, date);
		
		var total = parseFloat(tracks.recenttracks[`@attr`].total);
		var totalint = parseInt(tracks.recenttracks[`@attr`].total);
		var avg = parseFloat((total/(2592000/86400)).toFixed(2));
		
		for(var z = 0; z < 50; z++){		
			album.forEach(a => names.push(`${a.artist.name} - ${a.name}`));
			album.forEach(a => art.push(`${a.artist.name}`));
			album.forEach(a => alb.push(`${a.name}`));
		}
		
		names = removeDuplicates(names);
		
		var counter = 0;
		for(var i = 0; i < names.length; i++){
			if(i % Math.floor(names.length/3) == 0){
					counter++;
					if(counter == 1){
						await message.react(`1️⃣`);
					}
					if(counter == 2){
						await message.react(`2️⃣`);
					}
					if(counter == 3){
						await message.react(`3️⃣`);
					}
				}
			try{
				var temp = await lib.album.getInfo(art[i], alb[i], lUsername);
				totalscrobs.push(temp.album.userplaycount);
				var hasCrown = await ACrowns.findOne({
					  where: {
						guildID: message.guild.id,
						albumName: temp.album.name,
						artistName: temp.album.artist
					  }
					});
				if (hasCrown != null){
						if (hasCrown.userID === message.author.id){
							crowns.push(1);
						}
						else{
							crowns.push(0);
						}
					}
					else{
						crowns.push(0);
					}
				

			}
			catch{
				totalscrobs.push(0);
				crowns.push(0);
			}
		}
		
		for(var z = 0; z < names.length; z++){ 
			album.forEach(a => scrobs.push(`[${a.playcount} scrobbles - `));
			album.forEach(a => scrobnum.push(parseFloat(parseFloat((parseFloat(a.playcount)/total)*100).toFixed(2))));
			album.forEach(a => scrobsum.push(parseInt(a.playcount)));
		}
		
		var sum = 0;
		for(var z = 0; z < names.length; z++){
			sum += parseInt(scrobsum[z]);
		}
		
		var avg2 = parseFloat((sum/(2592000/86400)).toFixed(2));
		
		if (sum > total){
			sum = total;
		}
		if (avg2 > avg){
			avg2 = avg;
		}
		
		
		let longestNum = -Infinity;
		let longestName;
		let longestName2;
		names.forEach(name => {
		  if (longestNum < name.length) {
			longestNum = name.length;
			//longestName = `X`.repeat(60 + parseInt(longestNum)); //`X` * (parseInt(longestNum)name + 69); // ` [88888 scrobbles - 100.00%]      [888888/888888 scrobbles - 100.00%]`;
			longestName = `X`.repeat(15 + parseInt(longestNum));
			longestName = longestName + ` [88888 scrobbles - 100.00%] [8888 total scrobbles]`;
		  }
		});
		
		if(names.length > 3){
			await message.react(`❗`);
		}
		var newalbs = 0;
		var crowncount = 0;
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
		var i = 0;
		for (let byChart = 0; byChart < 100 * y; byChart += 100) {
		  for (let inChart = 15; inChart <= 15 * x; inChart += 15) {
			const yAxis = byChart + inChart;
			 if (scrobs[i] && names[i]){
					if(parseInt(scrobsum[i]) == parseInt(totalscrobs[i])){
						newalbs++;
						if(crowns[i] == 1){
							crowncount++;
							if (scrobs[i] == `[1 scrobbles - `){
								fctx.fillStyle = `#ffff00`;						
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !! ♛`, x * 100 + 15, yAxis);
								fctx.fillStyle = `#32cd32`;
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillStyle = `#16E6FF`;
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
							}
							else{
								fctx.fillStyle = `#ffff00`;
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !! ♛`, x * 100 + 15, yAxis);
								fctx.fillStyle = `#32cd32`;
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);							
								fctx.fillStyle = `#16E6FF`;
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
							}
						}
						else{
							fctx.fillStyle = `#32cd32`;
							if (scrobs[i] == `[1 scrobbles - `){
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillStyle = `#16E6FF`;
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
							}
							else{
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] !! NEW !!`, x * 100 + 15, yAxis);
								fctx.fillStyle = `#16E6FF`;
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
							}
						}
					}
					else{
						if(crowns[i] == 1){
							crowncount++;
							if (scrobs[i] == `[1 scrobbles - `){
								if(totalscrobs[i] != 0){
									fctx.fillStyle = `#ffff00`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles] ♛`, x * 100 + 15, yAxis);
									fctx.fillStyle = `#ff00c0`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);								
									fctx.fillStyle = `#16E6FF`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								}
								else{
									fctx.fillStyle = `#ff00c0`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillStyle = `#16E6FF`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								}
									
							}
							else{
								if(totalscrobs[i] != 0){
									fctx.fillStyle = `#ffff00`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles] ♛`, x * 100 + 15, yAxis);
									fctx.fillStyle = `#ff00c0`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillStyle = `#16E6FF`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								}
								else{
									fctx.fillStyle = `#ff00c0`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillStyle = `#16E6FF`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								}
									
							}
						}
						else{
							if (scrobs[i] == `[1 scrobbles - `){
								if(totalscrobs[i] != 0){
									fctx.fillStyle = `#ff00c0`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);								
									fctx.fillStyle = `#16E6FF`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								}
								else{
									fctx.fillStyle = `#ff00c0`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillStyle = `#16E6FF`;
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` [1 scrobble - ` + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								}
									
							}
							else{
								if(totalscrobs[i] != 0){
									fctx.fillStyle = `#ff00c0`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[` + totalscrobs[i] + ` total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillStyle = `#16E6FF`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								}
								else{
									fctx.fillStyle = `#ff00c0`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%] ` + `[??? total scrobbles]`, x * 100 + 15, yAxis);
									fctx.fillStyle = `#16E6FF`;
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
									fctx.fillText(names[i] + ` ` + scrobs[i] + scrobnum[i] + `%]`, x * 100 + 15, yAxis);
								}
									
							}
						}
							
					}
			 }
			 if (names[i]){
				fctx.fillStyle = `white`;
				fctx.fillText(names[i], x * 100 + 15, yAxis);
				fctx.fillText(names[i], x * 100 + 15, yAxis);
				fctx.fillText(names[i], x * 100 + 15, yAxis);
				fctx.fillText(names[i], x * 100 + 15, yAxis);
			 }
			i++;
		  }
		}

		if (message.author.id == 435000596165165057){
			if (newalbs == 1){
				var totalstat = `★ ` + sum + ` / ` + totalint + ` scrobbles ★\n★ ` + avg2 + ` / ` + avg + ` scrobbles per day ★\n★ ` + parseFloat(parseFloat((parseFloat(sum)/total)*100).toFixed(2)) + `% chart coverage ★\n★ ` + newalbs + ` new album ★`;
			}
			else{
				var totalstat = `★ ` + sum + ` / ` + totalint + ` scrobbles ★\n★ ` + avg2 + ` / ` + avg + ` scrobbles per day ★\n★ ` + parseFloat(parseFloat((parseFloat(sum)/total)*100).toFixed(2)) + `% chart coverage ★\n★ ` + newalbs + ` new albums ★`;

			}
			if (crowncount == 1){
				totalstat += `\n★ ` + crowncount + ` crown ★`;
			}
			else{
				totalstat += `\n★ ` + crowncount + ` crowns ★`;
			}
			
			totalstat += `\n★ ` + num_missing + ` missing album covers 🤔 ★`;
			
		}
		else{
			if (newalbs == 1){
				var totalstat = `★ ` + sum + ` / ` + totalint + ` scrobbles ★\n★ ` + avg2 + ` / ` + avg + ` scrobbles per day ★\n★ ` + parseFloat(parseFloat((parseFloat(sum)/total)*100).toFixed(2)) + `% chart coverage ★\n★ ` + newalbs + ` new album ★`;
			}
			else{
				var totalstat = `★ ` + sum + ` / ` + totalint + ` scrobbles ★\n★ ` + avg2 + ` / ` + avg + ` scrobbles per day ★\n★ ` + parseFloat(parseFloat((parseFloat(sum)/total)*100).toFixed(2)) + `% chart coverage ★\n★ ` + newalbs + ` new albums ★`;
			}
			if (crowncount == 1){
				totalstat += `\n★ ` + crowncount + ` crown ★`;
			}
			else{
				totalstat += `\n★ ` + crowncount + ` crowns ★`;
			}
		}
		const name = await fetchUser.usernameFromId(message.author.id);
		const buffer = finalCanvas.toBuffer();
			const embed1 = new MessageEmbed();
			try{
				embed1.setColor(message.member.displayColor)
			}
			catch(e){
				console.log(e)
			}
			try{
				embed1
				.setColor(message.member.displayColor)
				.setAuthor(`Monthly Chart (Page #` + page.toString() + `)`, message.author.displayAvatarURL(), 'https://www.last.fm/user/'+name+`/library/albums?date_preset=LAST_30_DAYS&page=` + page.toString())
				.setDescription(totalstat)
				.attachFiles([buffer]);
				await message.channel.send({ embed : embed1 });
				break;
			}
			catch(e){
				embed1.attachFiles([buffer]);
				await message.channel.send({ embed : embed1 });
				break;
			}
			
		await message.channel.send({ embed : embed1 });
		break;
	  } catch (e) {
		
		console.error(e);
		attempt_num = trial + 1;
		await message.channel.send(`An error occurred. Trying again... (Attempt ` + attempt_num + `/3)`);
		trial++;
		// await message.channel.send(client.snippets.error);
		//message.channel.stopTyping();
	  }
  }

try{
	const user = await fetchUser.username();
	var albumArray = [];
	var artistArray =[];
	var i = -1;
	if(message.guild.id == `447838857606463489` || message.guild.id == `671074176622264320`){
		while (true){
			i++;
			var data2 = await lib.user.getTopAlbums(user, period, 250, parseInt(page) + i);
			var { album } = data2.topalbums;
			album.forEach(a => artistArray.push(`${a.artist.name}`));
			len = albumArray.length;
			album.forEach(a => albumArray.push(`${a.name}`));
			if (len == albumArray.length){
				break;
			}
			
			await sleep(10000);
			
		}
	}
	
	else{
		for (var i = 0; i < 5; i++){
			var data2 = await lib.user.getTopAlbums(user, period, 250, parseInt(page) + i);
			var { album } = data2.topalbums;
			album.forEach(a => artistArray.push(`${a.artist.name}`));
			len = albumArray.length;
			album.forEach(a => albumArray.push(`${a.name}`));
			if (len == albumArray.length){
				break;
			}
			
			await sleep(10000);
			
		}
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
var gIDs = ``;
var gUsers = ``;
var guild = await message.guild.members.fetch().then(function(data){
	
	for (const [id, member] of data) {
		gIDs += id.toString() + `,`;
		gUsers += member.user.username + `~,~`;
	}
	
});
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
  name: `m`,
  description: `5x10 monthly chart`,
  usage: `m <page #>`
};
