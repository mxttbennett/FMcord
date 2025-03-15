module.exports = (sequelize, DataTypes) => {
  const AlbumRecord = sequelize.define('albumrecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
      fields: ['albumName', 'artistName']
    }]
  });
  return AlbumRecord;
};
