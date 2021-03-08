module.exports = (sequelize, DataTypes) => {
  const Time = sequelize.define(`time`, {
    ms: DataTypes.STRING,
	isArtist: DataTypes.STRING,
	isAlbum: DataTypes.STRING,
	guildID: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: [`guildID`, `userID`, `artistName`]
    }]
  });
  return Time;
};
