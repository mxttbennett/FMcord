const { writeFile, unlink } = require(`fs`).promises;

exports.run = async (client, message) => {
  try {
    let num = 0;
    const path = `${process.env.PWD}/res.txt`;
    const list = client.guilds.cache
      .sort((a, b) => b.memberCount - a.memberCount)
      .map(x => `${++num}. ${x.id} - ${x.name} with ${x.memberCount} members`)
      .join(`\r\n`);
    await writeFile(path, list);
    await message.channel.send({ files: [{
      attachment: path,
      name: `guildlist.txt`,
    }]});
    await unlink(path);
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};
