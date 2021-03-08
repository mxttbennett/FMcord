const Library = require(`../lib/index.js`);
const moment = require(`moment`);
const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { Op } = require(`sequelize`);
const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);

const canvas = require(`canvas`);
canvas.registerFont(`${process.env.PWD}/NotoSansCJKjp-Regular.otf`, {
  family: `noto-sans`
});

function compressArray(original) {
 
	var compressed = [];
	// make a copy of the input array
	var copy = original.slice(0);
 
	// first loop goes over every element
	for (var i = 0; i < original.length; i++) {
 
		var myCount = 0;	
		// loop over every element in the copy and see if it's the same
		for (var w = 0; w < copy.length; w++) {
			if (original[i] == copy[w]) {
				// increase amount of times duplicate is found
				myCount++;
				// sets item to undefined
				delete copy[w];
			}
		}
 
		if (myCount > 0) {
			var a = new Object();
			a.value = original[i];
			a.count = myCount;
			compressed.push(a);
		}
	}
 
	return compressed;
};

exports.run = async (client, message, args) => {
  /*
  try {
    const fetchUser = new fetchuser(client, message);
    const lib = new Library(client.config.lastFM.apikey);
    const Users = client.sequelize.import(`../models/Users.js`);
    const user = await fetchUser.get();

    if (!user) {
      return message.reply(client.snippets.noLogin);
    }
	
	try{
		var split = args[0].split(`-`);
	}
	catch{
	}

	if (!args[0]){
		return message.reply(`you need to specify a date in MM.DD.YYYY format.`);
	}
	var date = args[0];
	var unixTimestamp = moment(split[0], 'MM.DD.YYYY').unix();
	var unixTimestamp2 = moment(split[1], 'MM.DD.YYYY').unix();
		

      const lUsername = user.get(`lastFMUsername`);
      const data = await lib.user.getRecentTracks(lUsername, 1, 1, unixTimestamp, unixTimestamp2);
	
			
		let albums=[]
		//for (let i=0;i<50;i++){
		  //albums.push(data.recenttracks.track[i].album[`#text`])
		//}
		
		var tx = "";
		
		for (let x=0; x < albums.length; x++){
			//tx += albums[x] + `\n`;
		}
		
		//await message.channel.send(tx);
		//await message.channel.send(data.recenttracks.track[0].image[3][`#text`]);
			
			
		
			var x = 5;
			var y = 10;
			
			const canv = canvas.createCanvas(x*100, y*100);
			const ctx = canv.getContext(`2d`);
			
			const tracks = data.recenttracks;
			const proms = [];
			
			var tcount = 50;
			
			if (tracks[`@attr`].total > 50){
				tcount = 50;
			}
			else{
				tcount = parseInt(tracks[`@attr`].total);
			}
			
			for (var t = 0; t < tcount; t++){
			  if (tracks.track[t].image[3][`#text`].length > 0) {
				proms.push(canvas.loadImage(tracks.track[t].image[3][`#text`]));
			  } else {
				proms.push(canvas.loadImage(`${process.env.PWD}/images/no_album.png`));
			  }
			}
			
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
			
			let names = [];
			
			for(var z = 0; z < tcount; z++){ 
				if (tracks.track[z].album[`#text`]){
					names.push(tracks.track[z].album[`#text`]);
				}
				else{
					names.push(`NO ALBUM`);
				}
			}
			
			var compress = compressArray(names);
			
			for (var p = 0; p < compress.length; p++){
				tx += compress[p];
			}
			
			message.channel.send(tx);
				
				
			
			
			let longestNum = -Infinity;
			let longestName;
			names.forEach(name => {
			  if (longestNum < name.length) {
				longestNum = name.length;
				longestName = name;
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
				if (names[i])
				  fctx.fillText(names[i], x * 100 + 15, yAxis);
				i++;
			  }
			}

			const buffer = finalCanvas.toBuffer();
			await message.reply(`here is your grid.`, { file: buffer });
			
			
				
	
	
    
	
	
	
  

      // build and send embed
	  
      const embed = new MessageEmbed()
        .setColor(message.member.displayColor)
        .setTitle(split[0] + ` → ` + split[1])
        .setDescription(`You have scrobbled **${data.recenttracks[`@attr`].total}** tracks from ` + split[0] + ` to ` + split[1] + `.`)
		

      return message.channel.send(embed);

      // Time difference is still too high, don't bother
      // calculating daily, just let the user know
  

  } 
  catch (ex) {
    console.error(ex);
    return message.reply(`you need to specify a date in MM.DD.YYYY format.`);
  }
  */

};

exports.help = {
  name: `cc`,
  description: `**C**USTOM **C**HART: **EXPERIMENTAL: unusable at the moment**. Will be the custom chart command.`,
  usage: `not able to be used in its current state`
};
