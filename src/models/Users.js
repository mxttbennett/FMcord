module.exports = (sequelize, DataTypes) => {
	const Users = sequelize.define('users', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		discordUserID: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		lastFMUsername: {
			type: DataTypes.STRING,
			allowNull: true
		},
		lastDailyTimestamp: {
			type: DataTypes.DATE,
			allowNull: true
		},
		dailyPlayCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		RYMUsername: {
			type: DataTypes.STRING,
			allowNull: true
		},
		RYMPerpage: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		RYMmax: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		RYMmaxplus: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		Wishmax: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		Tagmax: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		Tag: {
			type: DataTypes.STRING,
			allowNull: true
		},
		Chart: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		timestamps: true // This enables createdAt and updatedAt
	});
	return Users;
};
