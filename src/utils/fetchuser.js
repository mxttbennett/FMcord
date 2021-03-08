/**
 * Gets the user from the database.
 */
class Fetchuser {
  constructor(client, message) {
    this.client = client;
    this.message = message;
  }

  /**
   * Gets the user object from the database.
   */
  async get() {
    return await this.getById(this.message.author.id);
  }

  /**
   * Gets the user object from the database with a given ID.
   *
   * @param {*} id
   */
  async getById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user;
  }
  
  async rymById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user.get(`RYMUsername`);
  }
  
  async rppById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user.get(`RYMPerpage`);
  }


  async maxById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user.get(`RYMmax`);
  }
  
  
  async wmaxById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user.get(`Wishmax`);
  }

  async tmaxById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user.get(`Tagmax`);
  }
  
    async tagById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user.get(`Tag`);
  }

  async maxpById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user.get(`RYMmaxplus`);
  }
  
async chartById(id) {
    const Users = this.client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: id
      }
    });

    if (!user) {
      return false;
    }

    return user.get(`Chart`);
  }
  /**
   * Gets the lastFMUsername from the user object.
   */
  async username() {
    const user = await this.get();

    return (user) ? user.get(`lastFMUsername`) : null;
  }

  /**
   * Gets the lastFMUsername from the user object with a given ID.
   *
   * @param {*} id
   */
  async usernameFromId(id) {
    const user = await this.getById(id);

    return (user) ? user.get(`lastFMUsername`) : null;
  }
}

module.exports.fetchuser = Fetchuser;
