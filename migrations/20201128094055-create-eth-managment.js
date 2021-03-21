"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Eth_Managments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      token_transfer_txid: {
        type: Sequelize.STRING,
      },
      trx_transfer_txid: {
        type: Sequelize.STRING,
      },
      token_transfer_status: {
        type: Sequelize.STRING,
      },
      trx_tx_status: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Eth_Managments");
  },
};
