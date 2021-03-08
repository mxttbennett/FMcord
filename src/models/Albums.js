module.exports = (sequelize, DataTypes) => {
  const Albums = sequelize.define(`albums`, {
    artistName: DataTypes.STRING,
	albumName: DataTypes.STRING,
	albumURL: DataTypes.STRING
  }, {
    indexes: [{
      unique: true,
      fields: [`artistName`, `albumName`, `albumURL`]
    }]
  });
  return Albums;
};
