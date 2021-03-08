const { fetchuser } = require(`../utils/fetchuser`);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
    var size = args.length;
  var tag = ``;
  var tag2 = ``;
  

  if (discordUser !== undefined) {
    var user = await fuser.rymById(discordUser.id);
	var max = await fuser.tmaxById(discordUser.id);
	if (!args[0]){
	  tag += await fuser.tagById(discordUser.id);
	  tag2 = tag.replace("+"," ");
	}
	else{
		for(var z = 0; z < size; z++){ 
		 if (z == size-1){
			 tag += args[z];
			 tag2 += args[z];
		 }
		 else{
			 tag += args[z];
			 tag += `+`;
			 tag2 += args[z];
			 tag2 += ` `;
		}
	}
	}
	var rand = getRandomInt(1, max);
	//await message.channel.send(user);

    if (user) {
	await message.reply(`you got \`${tag.replace(/\+/g,' ')}\` item #${rand}: https://rateyourmusic.com/collection/${user}/visual,stag_g,n1/${tag}/${rand}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `trand`,
  description: `Picks a random item from your set tag`,
  usage: `trand`,
  notes: `This command is dependent upon setting your tmax with the &tmax command.`
};
