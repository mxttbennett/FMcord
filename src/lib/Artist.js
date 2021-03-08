const Client = require(`./Client.js`);

class Artist extends Client {
  constructor(apikey) {
    super(apikey);
  }
  async getInfo(artist, username, autocorrect) {
    const query = this.stringify({
      method: `artist.getinfo`,
      artist: artist,
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

module.exports = Artist;
