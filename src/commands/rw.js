const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
  var genre = args.join(` `);


  if (discordUser !== undefined) {
    var user = await fuser.rymById(discordUser.id);
    var num = await fuser.rppById(discordUser.id);

    if (num === 0) {
      num = 25;
    }
    //await message.channel.send(user);

    if (user) {
      await message.channel.send(`\`${discordUser.username}'s\` wishlist: https://rateyourmusic.com/collection/${user}/wishlist,n${num}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `rw`,
  description: `Fetches a link to the user's wishlist.`,
  usage: `rw`,
  notes: `The user must be logged in to rym with the bot.`
};
