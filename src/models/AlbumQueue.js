module.exports = (sequelize, DataTypes) => {
  return sequelize.define('albumqueue', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    guildID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    guildName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    guildUserIDs: {
      type: DataTypes.STRING
    },
    guildUsers: {
      type: DataTypes.STRING
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artistName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    albumName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    chartType: {
      type: DataTypes.STRING
    },
    crownHolder: {
      type: DataTypes.STRING
    },
    crownPlays: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: true
  });
};
