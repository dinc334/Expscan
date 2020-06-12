'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      blockHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      blockNumber: {
        type: Sequelize.INTEGER,
        allowNull:  false
      },
      from: {
        type: Sequelize.STRING,
        allowNull: false
      },
      to: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gas: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gasPrice: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      hash: {
        unique: true,
        type: Sequelize.STRING,
        allowNull: false
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      nonce: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.BIGINT,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('transactions');
  }
};
