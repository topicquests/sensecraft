const { Service } = require('feathers-sequelize');

exports.Service = class RoleSequelize extends Service {

  async setRole(params = {}) {
    // TODO: Instead of passing in params all the time, could I store in AsyncLocalStore?
    // Even better: Tie an implicit DB transaction to the HTTP transaction.
    // Looking at https://github.com/feathersjs-ecosystem/feathers-sequelize/issues/188#issuecomment-576774771
    // but not sure it's good enough.
    if (params.transaction) {
      params.sequelize = Object.assign({ transaction: params.transaction }, params.sequelize);
    }
    if (params.sequelize.sequelize) {
      const dbname = params.sequelize.sequelize.getDatabaseName();
      var role;
      if (params.user) {
        if (params.user === 'owner') {
          role = `${dbname}__owner`;
        } else {
          const username = params.user.handle;
          role = `${dbname}__m_${username}`;
        }
      } else {
        role = `${dbname}__client`;
      }
      await params.sequelize.sequelize.query(`SET ROLE ${role};`, params);
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
};
