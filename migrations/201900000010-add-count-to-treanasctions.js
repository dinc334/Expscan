module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'addresses',
      'count',
     	Sequelize.BIGINT,
    )
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'addresses',
      'count',
    )
  },
}
