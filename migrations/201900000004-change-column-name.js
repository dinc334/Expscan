'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
       return queryInterface.renameColumn('transactions', 'gasPrice', 'gas_price');
    },

    down: function(queryInterface, Sequelize) {
      return queryInterface.renameColumn('transactions', 'gas_price', 'gasPrice');
    }
};

