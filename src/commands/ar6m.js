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
	var mult = getRandomInt(1, 500);
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
    var data = await lib.user.getTopArtists(user, `6month`, 1, mult);
	if (rand == 1){
		while (data.topartists.artist[0] == null){
			mult = getRandomInt(1, 500);
			data = await lib.user.getTopArtists(user, `6month`, 1, mult);
		}
	}
			


    await message.reply(`your #` + mult + ` artist of the past 6 months: ` + `***` + data.topartists.artist[0].name + `*** with **` + data.topartists.artist[0].playcount + `** plays`);
	
	
    
	
	
	
  } catch (e) {
    console.error(e);
    //await message.channel.send(client.snippets.error);
  }

  

};

exports.help = {
  name: `ar6m`,
  description: `**AR**TIST IN **6** **M**ONTHS: Shows the artist you have for the specified ranking in the past 6 months. If no number is provided, it chooses randomly from your top 500 artists of the 6-month period.`,
  usage: `ar6m <#>`
};