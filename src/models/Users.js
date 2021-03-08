module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(`users`, {
    discordUserID: DataTypes.STRING,
    lastFMUsername: DataTypes.STRING,
    lastDailyTimestamp: DataTypes.DATE,
    dailyPlayCount: DataTypes.INTEGER,
	RYMUsername: DataTypes.STRING,
	RYMPerpage: DataTypes.INTEGER,
	RYMmax: DataTypes.INTEGER,
	RYMmaxplus: DataTypes.INTEGER,
	Wishmax: DataTypes.INTEGER,
	Tagmax: DataTypes.INTEGER,
	Tag: DataTypes.STRING,
	Chart: DataTypes.STRING
  });
  return Users;
};
