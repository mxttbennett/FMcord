module.exports = (sequelize, DataTypes) => {
  const ACrowns = sequelize.define(`acrowns`, {
    guildID: DataTypes.STRING,
    userID: DataTypes.STRING,
    albumName: DataTypes.STRING,
	artistName: DataTypes.STRING,
    albumPlays: DataTypes.STRING,
	serverPlays: DataTypes.STRING,
	serverListeners: DataTypes.STRING,
	albumURL: DataTypes.STRING,
	tinyURL: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: [`guildID`, `userID`, `albumName`, `artistName`]
    }]
  });
  return ACrowns;
};
