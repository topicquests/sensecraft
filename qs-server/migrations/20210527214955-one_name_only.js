'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'name', Sequelize.DataTypes.STRING);
    await queryInterface.bulkUpdate('users', {name: Sequelize.fn(
      'concat', Sequelize.col('firstname'), ' ', Sequelize.col('lastname'))
    });
    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.DataTypes.STRING, allowNull: false});
    await queryInterface.changeColumn('users', 'handle', {
      type: Sequelize.DataTypes.STRING, allowNull: false, unique: true});
    await queryInterface.removeColumn('users', 'firstname');
    await queryInterface.removeColumn('users', 'lastname');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'firstname', Sequelize.DataTypes.STRING);
    await queryInterface.addColumn('users', 'lastname', Sequelize.DataTypes.STRING);
    await queryInterface.bulkUpdate('users', {firstname: Sequelize.fn(
      'split_part', Sequelize.col('name'), ' ', 1)
    }, {});
    await queryInterface.bulkUpdate('users', {lastname: Sequelize.fn(
      'split_part', Sequelize.col('name'), ' ', 2)
    });
    await queryInterface.changeColumn('users', 'firstname', {
      type: Sequelize.DataTypes.STRING, allowNull: false});
    await queryInterface.changeColumn('users', 'lastname', {
      type: Sequelize.DataTypes.STRING, allowNull: false});
    await queryInterface.changeColumn('users', 'handle', {
      type: Sequelize.DataTypes.STRING, allowNull: false, unique: false});
    await queryInterface.removeColumn('users', 'name');
  }
};
