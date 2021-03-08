module.exports = (sequelize, DataTypes) => {
  const AlbumRecord = sequelize.define(`albumrecord`, {
	artistName: DataTypes.STRING,
	albumName: DataTypes.STRING,
	prevOwner: DataTypes.STRING,
	newOwner: DataTypes.STRING,
	guildName: DataTypes.STRING,
	prevPlays: DataTypes.STRING,
	newPlays: DataTypes.STRING
  }, {
    indexes: [{
      unique: false,
      fields: [`guildID`, `userID`, `albumName`, `artistName`]
    }]
  });
  return AlbumRecord;
};
