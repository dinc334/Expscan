module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addIndex('blocks', ['miner']),

  down: (queryInterface, Sequelize) => queryInterface.removeIndex('blocks', ['miner']),
}
