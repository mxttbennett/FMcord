module.exports = (sequelize, DataTypes) => {
  const TotalsAndAvgs = sequelize.define(`totalsAndAvgs`, {
    totalArtists: DataTypes.STRING,
	totalAlbums: DataTypes.STRING,
	artistAvg: DataTypes.STRING,
	albumAvg: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: [`guildID`, `userID`, `artistName`]
    }]
  });
  return TotalsAndAvgs;
};
