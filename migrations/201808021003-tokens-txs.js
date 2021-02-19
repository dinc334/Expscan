module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('tokensTxs', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blockHash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    blockNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    from: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    to: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    timestamp: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('tokensTxs'),
}
