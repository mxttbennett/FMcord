module.exports = (sequelize, DataTypes) => {
  const RYM = sequelize.define(`users`, {
    discordUserID: DataTypes.STRING,
    rymUsername: DataTypes.STRING
  });
  return RYM;
};
