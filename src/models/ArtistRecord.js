module.exports = (sequelize, DataTypes) => {
  const ArtistRecord = sequelize.define(`artistrecord`, {
	artistName: DataTypes.STRING,
	prevOwner: DataTypes.STRING,
	newOwner: DataTypes.STRING,
	guildName: DataTypes.STRING,
	prevPlays: DataTypes.STRING,
	newPlays: DataTypes.STRING
  }, {
    indexes: [{
      unique: false,
      fields: [`guildID`, `userID`, `artistName`]
    }]
  });
  return ArtistRecord;
};
