module.exports = (sequelize, DataTypes) => {
  const TotalsAndAvgs = sequelize.define('totalsAndAvgs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    totalArtists: DataTypes.STRING,
    totalAlbums: DataTypes.STRING,
    artistAvg: DataTypes.STRING,
    albumAvg: DataTypes.STRING,
    guildID: DataTypes.STRING,
    userID: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: ['guildID', 'userID']
    }]
  });
  return TotalsAndAvgs;
};
