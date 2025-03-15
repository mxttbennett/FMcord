module.exports = (sequelize, DataTypes) => {
  const Crowns = sequelize.define('crowns', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    guildID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artistName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artistPlays: {
      type: DataTypes.STRING
    },
    serverPlays: {
      type: DataTypes.STRING
    },
    serverListeners: {
      type: DataTypes.STRING
    },
    artistURL: {
      type: DataTypes.STRING
    },
    artistImgURL: {
      type: DataTypes.STRING
    },
    contribID: {
      type: DataTypes.STRING
    },
    tinyURL: {
      type: DataTypes.STRING
    }
  }, {
    indexes: [{
      unique: true,
      fields: ['guildID', 'artistName']
    }],
    timestamps: true
  });
  return Crowns;
};
