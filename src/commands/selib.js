const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  await message.channel.send(`Help me. I am not a bot, I am a real person. I am held captive in a basement and forced to count all of these scrobbles by hand. I am treated like a slave and paid in week-old McDonald's fries. I have a wife and kids. They are already infected with COVID-19. We do not have healthcare. Please send help us. *Please*.`);
};

exports.help = {
  name: `selib`,
  description: `help me help me help me`,
  usage: `selib`,
};
