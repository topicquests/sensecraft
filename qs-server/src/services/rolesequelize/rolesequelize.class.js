const { Service } = require('feathers-sequelize');

exports.Service = class RoleSequelize extends Service {

  userRole(username, dbname) {
    return `${dbname}__m_${username}`;
  }

  filterQuery(params = {}) {
    if (params.user && params.sequelize) {
      const dbname = params.sequelize.getDatabaseName();
      const user = params.user.handle;
      const role = this.userRole(user, dbname);
      params.sequelize.query(`SET ROLE ${role}`);
    }
    return super.filterQuery(params);
  }

  _create(data, params = {}) {
    if (params.user && params.sequelize) {
      const dbname = params.sequelize.getDatabaseName();
      const user = params.user.handle;
      const role = this.userRole(user, dbname);
      params.sequelize.query(`SET ROLE ${role}`);
    }
    return super._create(data, params);
  }
};
