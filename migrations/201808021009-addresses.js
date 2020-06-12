'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      balance_EXP: {
        type: Sequelize.DOUBLE,
        allowNull:  true 
      },
      balance_LAB: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      balance_PEX: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      last_active: {
        type: Sequelize.BIGINT,
        allowNull: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('addresses');
  }
};
