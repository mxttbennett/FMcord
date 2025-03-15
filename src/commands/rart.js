const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fuser = new fetchuser(client, message);
  const discordUser = message.author;
  var size = args.length;
  var artist = ``;
  var artist2 = ``;

  for (var z = 0; z < size; z++) {
    if (z == size - 1) {
      artist += args[z];
      artist2 += args[z];
    }
    else {
      artist += args[z];
      artist += `+`;
      artist2 += args[z];
      artist2 += ` `;
    }
  }

  if (discordUser !== undefined) {
    var user = await fuser.rymById(discordUser.id);
    var num = await fuser.rppById(discordUser.id);

    if (num === 0) {
      num = 25;
    }
    //await message.channel.send(user);

    if (user) {
      await message.channel.send(`\`${discordUser.username}'s\` ratings by \`${artist2}\`: https://rateyourmusic.com/collection/${user}/strm_a,ss.rd.r0.5-5.0,n${num}/${artist}`);
    } else {
      await message.reply(`\`${discordUser.username}\` is not logged into rym.`);
    }
  } else {
    await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
  }
};

exports.help = {
  name: `rart`,
  description: `Fetches the user's ratings for a particular artist.`,
  usage: `rart [Artist Name]`,
  notes: `Artists with plus signs in the name might not work.`
};
