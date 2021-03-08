const { fetchuser } = require(`../utils/fetchuser2.js`);

exports.run = async (client, message, args) => {
	if (message.guild.id == 447838857606463489){
	await message.channel.send(`Server chart: https://rateyourmusic.com/charts/top/album/all-time/u:mattbennett,grammatizator,scottief,feastgood,Jumbo_Derp,nvandenh,bennew,DimmyJean,StickFrickThick,TraditionalFly,pywt,figwig,Maceben678,Ankleton,Roosterbear/`);
}
	else{
		await message.channel.send(`Server chart: https://rateyourmusic.com/find/userchart?usernames=%3CAccelerando_,Adrianovaz2007,Aerione,Derkow,Eruditey,GarbageNight,scottief,Hotel_Trivago,Huffinonit,JMW2000,JackAnderson94,Jim_Jazz,Kinglet22,TinmanJones,Zonark000,adrianovaz2007,appellation1,borzoi,crunchmiser,deadfrawg,fugitivus,garythegengar,gay_,grammatizator,heavy_pop,himi,leom5555,mattbennett,ounce,ralsei,schumacher,sombo,theSoundfreq,tttc,whiteSurfStyle5,yer,TEthearbiter,mittbarns,_natkingcole_,Crawling_Chaos,Bogler,jonjj,feastgood`);
	}
};

exports.help = {
  name: `sc`,
  description: `Posts the server chart.`,
  usage: `sc`,
  notes: `Posts the server chart from rym.`
};
