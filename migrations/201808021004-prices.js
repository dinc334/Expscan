'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('prices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ticker: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price_usd: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price_btc: {
        type: Sequelize.STRING,
        allowNull: false
      },
      volume: {
        type: Sequelize.STRING,
        allowNull: true
      },
      marketcap: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('prices');
  }
};

