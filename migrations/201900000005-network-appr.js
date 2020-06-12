'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('networkAppr', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      difficulty: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      hashrate: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      txs: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      txs_fee: {
        type: Sequelize.DOUBLE,
        allowNull: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('networkAppr');
  }
};
