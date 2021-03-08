const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

exports.run = async (client, message, args) => {
  
  if (!(parseInt(args[0]) > 0) || !args[0]){
	  await message.channel.send(`3...`);
	  await sleep(1000);
	  await message.channel.send(`2...`);
	  await sleep(1000);
	  await message.channel.send(`1...`);
	  await sleep(1000);
	  await message.channel.send(`go!`);
  }
  else{
    var cd = parseInt(args[0]);
    if(cd > 15){
		cd = 15;
		await message.reply(`trying to go over 15, huh? i don't think so.`);
	}
	for(var i = cd; i > 0; i--){
		await message.channel.send(i + `...`);
		await sleep(1000);
	}
	return message.channel.send(`go!`);
	  
	  
  }
  
  
};

exports.help = {
  name: `cd`,
  description: `**C**OUNT**D**OWN`,
  usage: `cd <#>`,
  notes: `3...2...1...go! by default. A custom number to count down from can be passed as a parameter.`
};
