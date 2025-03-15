module.exports = (sequelize, DataTypes) => {
  const ACrowns = sequelize.define(`guess`, {
    guildID: DataTypes.STRING,
    userID: DataTypes.STRING,
    albumName: DataTypes.STRING,
    artistName: DataTypes.STRING,
    albumPlays: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: [`guildID`, `userID`, `albumName`, `artistName`]
    }]
  });
  return ACrowns;
};
