module.exports = (sequelize, DataTypes) => {
  const Crowns = sequelize.define(`crowns`, {
    guildID: DataTypes.STRING,
    userID: DataTypes.STRING,
    artistName: DataTypes.STRING,
    artistPlays: DataTypes.STRING,
	serverPlays: DataTypes.STRING,
	serverListeners: DataTypes.STRING,
	artistURL: DataTypes.STRING,
	artistImgURL: DataTypes.STRING,
	contribID: DataTypes.STRING,
	tinyURL: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: [`guildID`, `userID`, `artistName`]
    }]
  });
  return Crowns;
};
