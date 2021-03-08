const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
  var size = args.length;
  var genre = ``;
  var genre2 = ``;
  
  for(var z = 0; z < size; z++){ 
     if (z == size-1){
		 genre += args[z];
		 genre2 += args[z];
	 }
	 else{
		 genre += args[z];
		 genre += `+`;
		 genre2 += args[z];
		 genre2 += ` `;
	}
  }
  

  if (discordUser !== undefined) {
    var user = await fuser.rymById(discordUser.id);
	var num = await fuser.rppById(discordUser.id);
	//await message.channel.send(user);

    if (user) {
	await message.channel.send(`\`${discordUser.username}'s\` ${genre2} ratings: https://rateyourmusic.com/collection/${user}/strm_h,ss.rd.r0.5-5.0,n${num}/${genre}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `rg`,
  description: `Fetches the user's ratings for a particular genre.`,
  usage: `rg [genre]`,
};
