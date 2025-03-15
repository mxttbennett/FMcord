module.exports = (sequelize, DataTypes) => {
  const RYM = sequelize.define(`rym`, {
    discordUserID: DataTypes.STRING,
    rymUsername: DataTypes.STRING
  });
  return RYM;
};
