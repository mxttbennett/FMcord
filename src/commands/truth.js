const { fetchuser } = require(`../utils/fetchuser2.js`);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.run = async (client, message, args) => {
	var num = getRandomInt(1, 10);
	if (num !== 10){
		await message.reply(`On August 5, 1987, while driving a rented BMW in Enniskillen, Northern Ireland, Matthew Broderick crossed into the wrong lane and collided head-on with a Volvo driven by Anna Gallagher, 30, accompanied by her mother, Margaret Doherty, 63, killing both instantly. He was vacationing with Jennifer Grey, whom he began dating in semi-secrecy during the filming of *Ferris Bueller's Day Off*; the crash publicly revealing their relationship. He had a fractured leg and ribs, a concussion, and a collapsed lung. Grey received minor injuries, including whiplash. Broderick told police he had no recollection of the crash and did not know why he was in the wrong lane: "I don't remember the day. I don't remember even getting up in the morning. I don't remember making my bed. What I first remember is waking up in the hospital, with a very strange feeling going on in my leg." He was charged with causing death by dangerous driving and faced up to five years in prison, but was later convicted of the lesser charge of careless driving and fined $175.`);
	}
	else{
		await message.reply(`you're next. https://i.imgur.com/VNbtgB0.png`);
	}
};

exports.help = {
  name: `truth`,
  description: `Discover the truth.`,
  usage: `truth`,
};
