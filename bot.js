if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const http = require(`http`);
const express = require(`express`);
const fs = require(`fs`);
const { Client, Collection } = require(`discord.js`);
const config = require(`./config.json`);
const DBL = require(`dblapi.js`);

const app = express();

app.get(`/`, (request, response) => {
  console.log(Date.now() + ` Ping Received`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const Sequelize = require(`sequelize`);

const sequelize = new Sequelize(`database`, `user`, `password`, {
  host: `localhost`,
  dialect: `sqlite`,
  logging: false,
  storage: `.data/database.sqlite`
});

// Add these model imports
const Users = require('./src/models/Users.js')(sequelize, Sequelize.DataTypes);
const Artists = require('./src/models/Artists.js')(sequelize, Sequelize.DataTypes);
const Albums = require('./src/models/Albums.js')(sequelize, Sequelize.DataTypes);
const Crowns = require('./src/models/Crowns.js')(sequelize, Sequelize.DataTypes);
const ACrowns = require('./src/models/ACrowns.js')(sequelize, Sequelize.DataTypes);
const Notifs = require('./src/models/Notifs.js')(sequelize, Sequelize.DataTypes);
const WNotifs = require('./src/models/WNotifs.js')(sequelize, Sequelize.DataTypes);
const Time = require('./src/models/Time.js')(sequelize, Sequelize.DataTypes);
const ArtistQueue = require('./src/models/ArtistQueue.js')(sequelize, Sequelize.DataTypes);
const AlbumQueue = require('./src/models/AlbumQueue.js')(sequelize, Sequelize.DataTypes);

// Remove or comment out this block since we're syncing later
/* sequelize.sync({ force: true }).then(() => {
  console.log('Database & tables created!');
}).catch(err => {
  console.error('Error syncing database:', err);
}); */

const client = new Client();
client.config = config;
client.commands = new Collection();
client.sequelize = sequelize;
client.snippets = require(`./snippets.js`);

if (process.argv[2] !== `--no-dbl`) {
  /*
  const dbl = new DBL(config.dbl.apikey, client);

  dbl.on(`posted`, () => {
    console.log(`Server count posted to discordbots.org!`);
  });

  dbl.on(`error`, e => {
    console.error(`DBL error: ${e}`);
  });
  */
}

fs.readdir(`./src/commands/`, (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    const fileName = file.split(`.`)[0];
    const props = require(`./src/commands/${file}`);
    client.commands.set(fileName, props);
  });
});

fs.readdir(`./src/events/`, (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    const eventName = file.split(`.`)[0];
    const func = require(`./src/events/${file}`);
    client.on(eventName, func.bind(null, client));
  });
});

fs.readdir(`./src/models/`, (err, files) => {
  if (err) {
    console.error('Error reading models directory:', err);
    throw err;
  }

  console.log('Starting database sync process...');

  // Wrap database operations in async function
  (async () => {
    try {
      // Drop backup tables
      await sequelize.query('DROP TABLE IF EXISTS albumqueues_backup');
      await sequelize.query('DROP TABLE IF EXISTS acrowns_backup');
      await sequelize.query('DROP TABLE IF EXISTS artists_backup');
      await sequelize.query('DROP TABLE IF EXISTS albums_backup');
      await sequelize.query('DROP TABLE IF EXISTS crowns_backup');
      await sequelize.query('DROP TABLE IF EXISTS notifs_backup');
      await sequelize.query('DROP TABLE IF EXISTS wnotifs_backup');
      await sequelize.query('DROP TABLE IF EXISTS time_backup');
      await sequelize.query('DROP TABLE IF EXISTS users_backup');

      // For SQLite, we need to recreate the table without the constraint
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS times_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ms TEXT NOT NULL,
          isArtist TEXT NOT NULL,
          isAlbum TEXT DEFAULT 'false',
          guildID TEXT NOT NULL,
          createdAt DATETIME,
          updatedAt DATETIME
        )
      `);

      // Copy data from old table if it exists
      await sequelize.query(`
        INSERT OR IGNORE INTO times_new 
        SELECT * FROM times
      `).catch(() => console.log('No existing times table to copy from'));

      // Drop old table and rename new one
      await sequelize.query('DROP TABLE IF EXISTS times');
      await sequelize.query('ALTER TABLE times_new RENAME TO times');

      console.log('Database schema updated successfully');

      // Continue with model sync
      const syncPromises = files.map(file => {
        if (!file.endsWith('.js')) return Promise.resolve();
        console.log(`Syncing model from file: ${file}`);
        const model = require(`./src/models/${file}`)(sequelize, Sequelize.DataTypes);
        return model.sync({
          alter: true,
          force: false
        }).catch(err => {
          console.warn(`Warning: Failed to sync ${file}, continuing anyway:`, err.message);
          return Promise.resolve();
        });
      });

      await Promise.all(syncPromises);
      console.log('All models synchronized successfully');
      console.log('Attempting Discord login...');
      await client.login(config.discordToken);
      console.log(`I'm in.`);
    } catch (err) {
      console.error('Detailed error during sync or login:', err);
      console.error('Error stack:', err.stack);
    }
  })();
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});
