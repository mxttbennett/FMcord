module.exports = (sequelize, DataTypes) => {
  const WNotifs = sequelize.define(`wnotifs`, {
    userID: DataTypes.STRING
  });
  return WNotifs;
};
