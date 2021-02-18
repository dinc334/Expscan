module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.renameColumn('transactions', 'gasPrice', 'gas_price')
  },

  down(queryInterface, Sequelize) {
    return queryInterface.renameColumn('transactions', 'gas_price', 'gasPrice')
  },
}
