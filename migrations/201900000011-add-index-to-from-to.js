
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('transactions',['from','to']);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('transactions',['from','to']);
  }
};

