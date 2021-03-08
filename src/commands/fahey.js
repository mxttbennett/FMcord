const { fetchuser } = require(`../utils/fetchuser2.js`);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.run = async (client, message, args) => {
	var num = getRandomInt(1, 99);
	if (num == 99){
		await message.reply(`the voice of the turtle says, "you are the chosen one" https://i.imgur.com/OiqGjs8.png`);
	}
	else if (num > 49){
		await message.reply(`Lion meows gracefully in your direction https://i.imgur.com/j6HbAtM.png`);
	}
	else{
		await message.reply(`smiles all around! https://i.imgur.com/IkphK8i.png`);
	}
};

exports.help = {
  name: `fahey`,
  description: `Collect all 3!`,
  usage: `fahey`,
};
