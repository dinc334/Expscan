module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('tokensBalances', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    owner: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tokenId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    balance: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    lastActive: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('tokensBalances'),
}
