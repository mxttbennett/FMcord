const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);

module.exports = async (client, ctx) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client);
  try {
	if (ctx.prevOwner != ctx.newOwner){
		const prevUser = {
		discord: client.users.cache.get(ctx.prevOwner),
		local: await fetchUser.usernameFromId(ctx.prevOwner)
	  };
	  const newUser = {
		discord: client.users.cache.get(ctx.newOwner),
		local: await fetchUser.usernameFromId(ctx.newOwner)
	  };
	  try{
		  const prevAlbFetch = await lib.album.getInfo(ctx.artist, ctx.album, prevUser.local);
		  const newAlbFetch = await lib.album.getInfo(ctx.artist, ctx.album, newUser.local);
		  const prevAlbPlays = prevAlbFetch.album.userplaycount;
		  const newAlbPlays = newAlbFetch.album.userplaycount;
		  const dmChannel = await newUser.discord.createDM();
		  await dmChannel.send(`You have won the **${ctx.artist}** — **${ctx.album}** album crown ` +
		  `in **${ctx.guild}**. The previous owner was **${prevUser.discord.tag}**.\nYour play count: ` +
		  `\`${newAlbPlays}\`\nTheir play count: \`${prevAlbPlays}` +
		  `\``);
	  }
	  catch (e){
		  console.error(e);
		  const prevFetch = await lib.artist.getInfo(ctx.artist, prevUser.local);
		  const newFetch = await lib.artist.getInfo(ctx.artist, newUser.local);
		  const prevPlays = prevFetch.artist.stats.userplaycount;
		  const newPlays = newFetch.artist.stats.userplaycount;
		  const dmChannel = await newUser.discord.createDM();
		  await dmChannel.send(`You have won the **${ctx.artist}** artist crown ` +
		  `in **${ctx.guild}**. The previous owner was **${prevUser.discord.tag}**.\nYour play count: ` +
		  `\`${newPlays}\`\nTheir play count: \`${prevPlays}` +
		  `\``);
	  }
	}
  } catch (e) {
    console.error(e);
    const owner = client.users.cache.get(client.config.botOwnerID);
    const dmChannel = await owner.createDM();
    //await dmChannel.send(`Error at the event.`);
  }
};
