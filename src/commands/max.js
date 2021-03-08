const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
  const Users = client.sequelize.import(`../models/Users.js`);
  var user = await fuser.rymById(discordUser.id);
  var numb = parseInt(args[0]);

   if (user) {
		if(numb > 0){
			   await Users.update({
				RYMmax: numb
			  }, {
				where: {
				  discordUserID: message.author.id
				}
			});
		
		await message.reply(`your total number of rym ratings has been updated to \`${numb}\`.`);
		}
		else{
			await message.reply(`the maximum needs to be an integer.`);
		}
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
};

exports.help = {
  name: `max`,
  description: `Sets your total number of rym ratings.`,
  usage: `max \`#_of_rym_ratings\``,
  notes: `check your current max by looking at the last page number here: https://rateyourmusic.com/collection/YOUR_USERNAME/r0.5-5.0,ss.d,n1/1`
};
