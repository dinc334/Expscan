module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('contracts', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    contractAddress: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    creator: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('contracts'),
}
