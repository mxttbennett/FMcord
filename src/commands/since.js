const Library = require(`../lib/index.js`);
const moment = require(`moment`);
const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  try {
    const fetchUser = new fetchuser(client, message);
    const lib = new Library(client.config.lastFM.apikey);
    const Users = client.sequelize.import(`../models/Users.js`);
    const user = await fetchUser.get();

    if (!user) {
      return message.reply(client.snippets.noLogin);
    }
	
	var split = args[0].split(`-`);

	if (!args[0]){
		return message.reply(`you need to specify a date in MM.DD.YYYY format.`);
	}
	var date = args[0];
	var unixTimestamp = moment(split[0], 'MM.DD.YYYY').unix();
	var unixTimestamp2 = moment(split[1], 'MM.DD.YYYY').unix();
		

      const lUsername = user.get(`lastFMUsername`);
      const data = await lib.user.getRecentTracks(lUsername, unixTimestamp, unixTimestamp2);

      // Add new timestamp and play count to database
      await Users.update({
        lastDailyTimestamp: moment().add(1, `days`).utc().toString(),
        dailyPlayCount: data.recenttracks[`@attr`].total,
      }, {
        where: {
          discordUserID: message.author.id
        }
      });

      // build and send embed
      const embed = new MessageEmbed()
        .setColor(message.member.displayColor)
        .setTitle(split[0] + ` → ` + split[1])
        .setDescription(`You have scrobbled **${data.recenttracks[`@attr`].total}** tracks from ` + split[0] + ` to ` + split[1] + `.`)

      return message.channel.send(embed);

      // Time difference is still too high, don't bother
      // calculating daily, just let the user know
  

  } 
  catch (ex) {
    console.error(ex);
    return message.reply(`you need to specify a date in MM.DD.YYYY format.`);
  }
};

exports.help = {
  name: `since`,
  description: `Gets the total number of scrobbles since the specified date. The date needs to be in MM.DD.YYYY format.`,
  usage: `since <MM.DD.YYYY>`
};
