const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
  var url = (args[0]);



  if (discordUser !== undefined) {
	 const Users = client.sequelize.import(`../models/Users.js`);
	 var user = await fuser.rymById(discordUser.id);
	 
    

    if (user) {
       await Users.update({
        Chart: url
      }, {
        where: {
          discordUserID: message.author.id
        }
	});
	
	await message.reply(`your chart url has been saved.`);
		
    }
  } else {
  }
};

exports.help = {
  name: `chset`,
  description: `**SET** **CH**ART: Sets your chart image.`,
  usage: `chset <url to chart image>`,
  notes: `check your current chart by doing \`-ch\``
};
