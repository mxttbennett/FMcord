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
				Wishmax: numb
			  }, {
				where: {
				  discordUserID: message.author.id
				}
			});
		
		await message.reply(`the total number of items on your wishlist has been updated to \`${numb}\`.`);
		}
		else{
			await message.reply(`the maximum needs to be an integer.`);
		}
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
};

exports.help = {
  name: `wmax`,
  description: `Set the maximum number of items on your wishlist with this command`,
  usage: `wmax [# of items on wishlist]`,
  notes: `The user must be logged in to rym with the bot.`
};
