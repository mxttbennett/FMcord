module.exports = (sequelize, DataTypes) => {
  const ArtistRecord = sequelize.define('artistrecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    artistName: DataTypes.STRING,
    prevOwner: DataTypes.STRING,
    newOwner: DataTypes.STRING,
    guildName: DataTypes.STRING,
    prevPlays: DataTypes.STRING,
    newPlays: DataTypes.STRING
  }, {
    indexes: [{
      unique: false,
      fields: ['artistName']
    }]
  });
  return ArtistRecord;
};
