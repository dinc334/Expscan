'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('blocks', ['miner']);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('blocks', ['miner']);
  }
};