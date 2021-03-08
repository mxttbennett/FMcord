const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
  var numb = (args[0]);



  if (discordUser !== undefined) {
	 const Users = client.sequelize.import(`../models/Users.js`);
	 var user = await fuser.rymById(discordUser.id);
	 
    

    if (user) {
       await Users.update({
        Tagmax: numb
      }, {
        where: {
          discordUserID: message.author.id
        }
	});
	
	await message.reply(`the total number of items with the relevant tag has been updated to \`${numb}\``);
		
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `tmax`,
  description: `Set the maximum number of items that have a particular tag.`,
  usage: `tmax [# of items tagged with tag in question]`,
  notes: `The tag can be saved with &tset <tag>`
};
