module.exports = (sequelize, DataTypes) => {
  const ACrowns = sequelize.define('acrowns', {
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
    albumName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artistName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    albumPlays: {
      type: DataTypes.STRING
    },
    serverPlays: {
      type: DataTypes.STRING
    },
    serverListeners: {
      type: DataTypes.STRING
    },
    albumURL: {
      type: DataTypes.STRING
    },
    tinyURL: {
      type: DataTypes.STRING
    }
  }, {
    indexes: [{
      unique: true,
      fields: ['guildID', 'artistName', 'albumName']
    }],
    timestamps: true
  });
  return ACrowns;
};
