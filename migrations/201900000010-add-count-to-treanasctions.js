'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'addresses',
      'count',
     	Sequelize.BIGINT
    );

  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'addresses',
      'count'
    );
  }
}