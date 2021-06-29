const { Service } = require('feathers-sequelize');

async function setRole(sequelize, params) {
  const dbname = sequelize.getDatabaseName();
  const user = params.user;
  var role;
  if (user) {
    if (user === 'owner') {
      role = `${dbname}__owner`;
    } else {
      const username = user.handle;
      role = `${dbname}__m_${username}`;
    }
  } else {
    role = `${dbname}__client`;
  }
  await sequelize.query(`SET ROLE ${role};`, params);
}

class RoleSequelize extends Service {
  async setRole(params = {}) {
    // TODO: Instead of passing in params all the time, could I store in AsyncLocalStore?
    // Even better: Tie an implicit DB transaction to the HTTP transaction.
    // Looking at https://github.com/feathersjs-ecosystem/feathers-sequelize/issues/188#issuecomment-576774771
    // but not sure it's good enough.
    params.sequelize = Object.assign({ transaction: params.transaction, user: params.user }, params.sequelize);
    params.transaction = params.sequelize.transaction;

    if (params.sequelize.sequelize) {
      await setRole(params.sequelize.sequelize, params.sequelize);
    } else {
      console.error('Missing sequelize parameter!');
    }
  }

  async _getOrFind (id, params = {}) {
    await this.setRole(params);
    return super._getOrFind (id, params);
  }

  async _find (params = {}) {
    await this.setRole(params);
    return super._find (params);
  }

  async _get (id, params = {}) {
    await this.setRole(params);
    // TODO: the feather-sequelize get does a findAll.
    // This is incompatible with large data or a serious security model.
    // replace with a single-item get, just maybe ?
    return super._get (id, params);
  }

  async _create (data, params = {}) {
    await this.setRole(params);
    return super._create (data, params);
  }

  async _patch (id, data, params = {}) {
    await this.setRole(params);
    return super._patch (id, data, params);
  }

  async _update (id, data, params = {}) {
    await this.setRole(params);
    return super._update (id, data, params);    
  }

  async _remove (id, params = {}) {
    await this.setRole(params);
    return super._remove (id, params);
  }
}

exports.setRole = setRole;
exports.Service = RoleSequelize;
