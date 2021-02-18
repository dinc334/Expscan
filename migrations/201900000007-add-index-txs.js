module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addIndex('transactions', ['blockNumber']),

  down: (queryInterface, Sequelize) => queryInterface.removeIndex('transactions', ['blockNumber']),
}
