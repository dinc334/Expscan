'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('transactions',[ 'blockNumber']);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('transactions',[ 'blockNumber']);
  }
};
