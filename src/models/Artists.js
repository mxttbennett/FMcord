module.exports = (sequelize, DataTypes) => {
  const Artists = sequelize.define(`artists`, {
    artistName: DataTypes.STRING,
	artistURL: DataTypes.STRING,
	artistImgURL: DataTypes.STRING,
	fileExtension: DataTypes.STRING,
	contribID: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: [`artistName`, `artistURL`, `artistImgURL`, `contribID`]
    }]
  });
  return Artists;
};
