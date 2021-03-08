const { MessageEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);
var turl = require('turl');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function removeDuplicates(originalArray, objKey1) {
  var trimmedArray = [];
  var values = [];
  var artist;

  for(var i = 0; i < originalArray.length; i++) {
    artist = originalArray[i][objKey1];

    if(values.indexOf(artist) === -1){
      trimmedArray.push(originalArray[i]);
      values.push(artist);
    }
  }

  return trimmedArray;

};

exports.run = async (client, message, args) => {
  try {
      const Notifs = client.sequelize.import(`../models/Notifs.js`);
      const notif = await Notifs.findOne({
        where: {
          userID: message.author.id
        }
      });
      if (!notif) {
        await Notifs.create({ userID: message.author.id });
        await message.reply(`I will message you in your DMs any time ` +
        `you lose a crown from a server. Make sure to enable your ` +
        `DMs (you can do so by going to Settings → Privacy and Security ` +
        `→ Allow direct messages from server members.) so that I can ` +
        `notify you.\nYou can always disable this feature by doing ` +
        `\`${client.config.prefix}notifyloss\` again.`);
      } else {
        await Notifs.destroy({
          where: {
            userID: message.author.id
          }
        });
        await message.reply(`you will no longer be notified when you ` +
        `lose a crown.\nTo re-enable this feature, do ` +
        `\`${client.config.prefix}notifyloss\` again.`);
      }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `notifyloss`,
  description: `NOTIFY LOSSES: Toggles the bot's ability to send you a DM after you lose a crown.`,
  usage: `notifyloss`,
  notes: `Use \`-notifywin\` to toggle alerts for crowns you have won.`
};
