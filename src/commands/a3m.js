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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.run = async (client, message, args) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, message);
  const usageWarning = `Incorrect usage of a command! Correct usage ` +
  `would be: \`-nt <time period> <grid size>\``;

  if (!args[0]) {
	var mult = getRandomInt(1, 300);
	var rand = 1;
  }
  else{
	  var mult = parseInt(args[0]);
  }

  try {
    const user = await fetchUser.username();
    if (!user) return message.reply(client.snippets.noLogin);
	var x = 1;
	var y = 1;
    var data = await lib.user.getTopAlbums(user, `3month`, 1, mult);
	if (rand == 1){
		while (data.topalbums.album[0] == null){
			mult = getRandomInt(1, 300);
			data = await lib.user.getTopAlbums(user, `3month`, 1, mult);
		}
	}
			
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
    await message.reply(`your #` + mult + ` album of the past 3 months: **` + data.topalbums.album[0].artist.name + `** — ***` + data.topalbums.album[0].name + `*** with **` + data.topalbums.album[0].playcount + `** plays`, { file: buffer });
	
	
    
	
	
	
  } catch (e) {
    console.error(e);
    //await message.channel.send(client.snippets.error);
  }

  

};

exports.help = {
  name: `a3m`,
  description: `**A**LBUM IN **3** **M**ONTHS: Shows the album you have for the specified ranking in the past 3 months. If no number is provided, it chooses randomly from your top 300 albums of the 3-month period.`,
  usage: `a3m <#>`
};
