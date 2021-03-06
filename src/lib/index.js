const User = require(`./User.js`);
const Artist = require(`./Artist.js`);
const Album = require(`./Album.js`);
const Track = require(`./Track.js`);

class Library {
  constructor(apikey) {
    this.user = new User(apikey);
    this.artist = new Artist(apikey);
	this.album = new Album(apikey);
	this.track = new Track(apikey);
  }
}

module.exports = Library;
