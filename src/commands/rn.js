const { fetchuser } = require(`../utils/fetchuser`);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
  
  if(!args[0]){
	  message.reply(`you must specify a number.`);
  }
  else{
	  var rand = args[0];
  }
  
  

  if (discordUser !== undefined) {
    var user = await fuser.rymById(discordUser.id);

    if (user) {
	await message.reply(`your #${rand} rating: https://rateyourmusic.com/collection/${user}/visual,r0.5-5.0,ss.d,n1/${rand}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `rand`,
  description: `Picks a random album from the user's rym ratings. The total number of ratings is set with the &max command.`,
  usage: `rand`,
  notes: `max command needs to be set before usage.`
};
