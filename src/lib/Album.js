const Client = require(`./Client.js`);

class Album extends Client {
  constructor(apikey) {
    super(apikey);
  }
  async getInfo(artist, album, username, autocorrect) {
    const query = this.stringify({
      method: `album.getinfo`,
      artist: artist,
	  album: album,
      username: username,
	  autocorrect: autocorrect,
      api_key: this.apikey,
      format: `json`
    });
    try {
      const data = await this.request(this.rootURL + query);
      return data;
    } catch (e) {
      throw e;
    }
  }
}

module.exports = Album;
