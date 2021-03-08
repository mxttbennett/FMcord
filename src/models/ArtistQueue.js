module.exports = (sequelize, DataTypes) => {
  const ArtistQueue = sequelize.define(`artistqueue`, {
    guildID: DataTypes.STRING,
	guildName: DataTypes.STRING,
	guildUserIDs: DataTypes.STRING,
	guildUsers: DataTypes.STRING,
    userID: DataTypes.STRING,
	userName: DataTypes.STRING,
	artistName: DataTypes.STRING,
	chartType: DataTypes.STRING,
	crownHolder: DataTypes.STRING,
	crownPlays: DataTypes.STRING
  }, {
    indexes: [{
      unique: false,
      fields: [`guildID`, `userID`, `artistName`]
    }]
  });
  return ArtistQueue;
};
