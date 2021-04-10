"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_Investments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      dollar_amount_invested: {
        type: Sequelize.FLOAT
      },
      token_market_price: {
        type: Sequelize.FLOAT
      },
      token_deposited: {
        type: Sequelize.FLOAT
      },
      account_status: {
        type: Sequelize.STRING
      },
      trx_blockchain_txid: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_Investments");
  }
};