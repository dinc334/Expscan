module.exports = {
  up: (queryInterface) => queryInterface.addIndex('transactions', ['from', 'to']),

  down: (queryInterface) => queryInterface.removeIndex('transactions', ['from', 'to']),
}
