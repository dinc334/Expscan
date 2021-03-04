module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('dexTrades', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    tokenAmountIn: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tokenAmountOut: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    swappedRate: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    txnValue: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    dex: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('dexTrades'),
}
