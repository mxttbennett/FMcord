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
        RYMPerpage: numb
      }, {
        where: {
          discordUserID: message.author.id
        }
	});
	
	await message.reply(`your ratings per page (for rym) has been updated to \`${numb}\``);
		
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `rpp`,
  description: `Changes the amount of ratings per page (rpp) for the user's rym requests. For example an rpp of 30 would show 30 releases / ratings per page.`,
  usage: `rpp [# of ratings per page]`,
  notes: `This is used for a lot of rym commands.`
};
