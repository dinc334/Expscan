module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('addresses', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    balance_EXP: {
      type: Sequelize.DOUBLE,
      allowNull: true,
    },
    last_active: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('addresses'),
}
