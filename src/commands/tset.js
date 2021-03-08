const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
   var size = args.length;
  var tag = ``;
  var tag2 = ``;
  
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


  if (discordUser !== undefined) {
	 const Users = client.sequelize.import(`../models/Users.js`);
	 var user = await fuser.rymById(discordUser.id);
	 
    

    if (user) {
       await Users.update({
        Tag: tag
      }, {
        where: {
          discordUserID: message.author.id
        }
	});
	
	await message.reply(`your tag has been set to \`${tag2}\``);
		
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `tset`,
  description: `Set your concerned tag here by using &tset <tag>`,
  usage: `tset [tag]`,
  notes: `Related commands: &tmax, &trand`
};
