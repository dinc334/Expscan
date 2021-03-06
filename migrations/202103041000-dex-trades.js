module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('dextrades', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hash_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    },
    token_in: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    token_out: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amount_in: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    amount_out: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    swapped_rate: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    dex: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('dextrades'),
}
