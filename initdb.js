const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');

// Delete existing database
const dbPath = path.join(__dirname, '.data', 'database.sqlite');
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Deleted existing database');
}

// Create new database
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: dbPath
});

// Import all models
const Users = sequelize.import('./src/models/Users.js');
const Artists = sequelize.import('./src/models/Artists.js');
const Albums = sequelize.import('./src/models/Albums.js');
const Crowns = sequelize.import('./src/models/Crowns.js');
const ACrowns = sequelize.import('./src/models/ACrowns.js');
const Notifs = sequelize.import('./src/models/Notifs.js');
const WNotifs = sequelize.import('./src/models/WNotifs.js');
const Time = sequelize.import('./src/models/Time.js');
const ArtistQueue = sequelize.import('./src/models/ArtistQueue.js');
const AlbumQueue = sequelize.import('./src/models/AlbumQueue.js');

// Force sync all models
sequelize.sync({ force: true }).then(() => {
    console.log('Database & tables created!');
    process.exit(0);
}).catch(err => {
    console.error('Error syncing database:', err);
    process.exit(1);
});