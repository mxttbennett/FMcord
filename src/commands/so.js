const Library = require(`../lib/index.js`);
const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);
const canvas = require(`canvas`);
canvas.registerFont(`${process.env.PWD}/NotoSansCJKjp-Regular.otf`, {
  family: `noto-sans`
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function removeDuplicates(originalArray, objKey1, objKey2) {
  var trimmedArray = [];
  var values = [];
  var artist;
  var album;

  for(var i = 0; i < originalArray.length; i++) {
    artist = originalArray[i][objKey1];
	album = originalArray[i][objKey2];

    if(values.indexOf(artist + ` ||| ` + album) === -1){
      trimmedArray.push(originalArray[i]);
      values.push(artist + ` ||| ` + album);
    }
  }

  return trimmedArray;

}


exports.run = async (client, message, args) => {
  try {
	  message.react(`✅`);
      let member;
      member = message.member;
	  const lib = new Library(client.config.lastFM.apikey);
      const fetchUser = new fetchuser(client, message);
      const Crowns = client.sequelize.import(`../models/ACrowns.js`);
      const user = await fetchUser.getById(member.id);
      if (!user) return message.reply(client.snippets.noLogin);
      const serverAlbums = await Crowns.findAll({
        where: {
          guildID: message.guild.id
        }
      });
      let num = 0;
      var validCrowns = serverAlbums
        .map(x => {
          return {
			albname: x.get(`albumName`),
            name: x.get(`artistName`),
            plays: parseInt(x.get(`serverPlays`)),
            guildID: x.get(`guildID`),
			listeners: parseInt(x.get(`serverListeners`)),
			url: x.get(`albumURL`)
          };
        })
        .filter(x => message.guild.id === x.guildID && x.plays > 0 && x.listeners > 0 && x.url != null);
	  validCrowns = removeDuplicates(validCrowns, `name`, `albname`);
      if (validCrowns.length === 0)
        return message.reply(`no albums found.`);
      var albums = validCrowns
        .sort((a,b) => (args[0] == `--avg`) ? parseFloat((parseFloat(b.plays)/parseFloat(b.listeners)).toFixed(2)) - parseFloat((parseFloat(a.plays)/parseFloat(a.listeners)).toFixed(2)) : (args[0] == `--list`) ? b.listeners - a.listeners : (args[0] == `--rand`) ? b.plays - getRandomInt(1, b.plays * 2) : (args[0] == `--alph`) ? a.albname.localeCompare(b.albname) : (args[0] == `--len`) ? b.albname.length - a.albname.length : b.plays - a.plays)
        .slice(0, 50);
	  let x = 5;
	  let y = 10;
	  const canv = canvas.createCanvas(x*100, y*100);
	  const ctx = canv.getContext(`2d`);
	  const proms = [];
	  var counter = 0;
	  var sum = 0;
	  for(var i = 0; i < albums.length; i++){
		if(i > 3 && i % Math.floor(albums.length/3) == 0 && albums.length > 3){
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
		sum += albums[i].plays;
		var data = await lib.album.getInfo(albums[i].name, albums[i].albname);
		if (data.album.image[3][`#text`].length > 0) {
        proms.push(canvas.loadImage(data.album.image[3][`#text`]));
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
	let longestNum = -Infinity;
	let longestName;
	albums.forEach(a => {
	  if (longestNum < (a.name.length + a.albname.length)) {
		longestNum = a.name.length + a.albname.length;
		longestName = `X`.repeat(15 + parseInt(longestNum));
		longestName = longestName + ` [88888 scrobbles - 100.00%] [999 listeners - 9999.99 avg]`;
	  }
	});
	
	if(albums.length > 3){
		await message.react(`❗`)
	}
	
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
		if (albums[i]){
			if(albums[i].plays != 1){
				
				fctx.fillStyle = `#ff00c0`;
				var first = albums[i].name + ` - ` + albums[i].albname + ` [` + albums[i].plays + ` scrobbles - ` + parseFloat((parseFloat(albums[i].plays)/parseFloat(sum))*100).toFixed(2) + `%]`;
				var input = albums[i].name + ` - ` + albums[i].albname + ` [` + albums[i].plays + ` scrobbles - ` + parseFloat((parseFloat(albums[i].plays)/parseFloat(sum))*100).toFixed(2) + `%] [`;
				if(albums[i].listeners != 1){
					input += albums[i].listeners + ` listeners - ` + parseFloat(parseFloat(albums[i].plays)/parseFloat(albums[i].listeners)).toFixed(2) + ` avg]`;
				}
				else{
					input += `1 listener - ${albums[i].plays} avg]`;
				}
				fctx.fillText(input, x * 100 + 15, yAxis);
				fctx.fillStyle = `#16E6FF`;
				fctx.fillText(first, x * 100 + 15, yAxis);
				fctx.fillText(first, x * 100 + 15, yAxis);
				fctx.fillText(first, x * 100 + 15, yAxis);
				fctx.fillText(first, x * 100 + 15, yAxis);
				fctx.fillStyle = `white`;
				var input = albums[i].name + ` - ` + albums[i].albname;
				fctx.fillText(input, x * 100 + 15, yAxis);
				fctx.fillText(input, x * 100 + 15, yAxis);
				fctx.fillText(input, x * 100 + 15, yAxis);
				fctx.fillText(input, x * 100 + 15, yAxis);
			}
			else{
				
				fctx.fillStyle = `#ff00c0`;
				var input = albums[i].name + ` - ` + albums[i].albname + ` [` + albums[i].plays + ` scrobble - ` + parseFloat((1/parseFloat(sum))*100).toFixed(2) + `%] [1 listener - 1 avg]`;
				fctx.fillText(input, x * 100 + 15, yAxis);
				var first = albums[i].name + ` - ` + albums[i].albname + ` [1 scrobble - ` + parseFloat((1/parseFloat(sum))*100).toFixed(2) + `%]`;
				fctx.fillStyle = `#16E6FF`;
				fctx.fillText(first, x * 100 + 15, yAxis);
				fctx.fillText(first, x * 100 + 15, yAxis);
				fctx.fillText(first, x * 100 + 15, yAxis);
				fctx.fillText(first, x * 100 + 15, yAxis);
				fctx.fillStyle = `white`;
				var input = albums[i].name + ` - ` + albums[i].albname;
				fctx.fillText(input, x * 100 + 15, yAxis);
				fctx.fillText(input, x * 100 + 15, yAxis);
				fctx.fillText(input, x * 100 + 15, yAxis);
				fctx.fillText(input, x * 100 + 15, yAxis);
			}
			i++;
		}
	  }
	}	
  
  const buffer = finalCanvas.toBuffer();
		const embed1 = new MessageEmbed()
		.setColor(message.member.displayColor)
		.attachFiles([buffer])

  await message.channel.send({ file: buffer });
  }
  catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `so`,
  description: `Fetches the server's overall chart (using \`-salb\`).`,
  usage: `so`,
  notes: `The chart is updated (not fully) every time someone uses \`-a\`, \`-f\`, \`-fm\`, or a chart command. Note that album playcounts may take a while to update if done by chart. The list sorts by scrobble count by default, but you can use any of the following arguments for alternative sorting methods: \`--alph\`, \`--avg\`, \`--len\`, \`--list\`, \`--rand\`.`
};
