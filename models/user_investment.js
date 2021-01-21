"use strict";
module.exports = (sequelize, DataTypes) => {
  const user_Investment = sequelize.define(
    "user_Investment",
    {
      userId: DataTypes.INTEGER,
      dollar_amount_invested: DataTypes.FLOAT,
      token_market_price: DataTypes.FLOAT,
      token_deposited: DataTypes.FLOAT,
      account_status: DataTypes.STRING,
      trx_blockchain_txid: DataTypes.STRING,
    },
    {}
  );
  user_Investment.associate = function (models) {
    // associations can be defined here
  };
  return user_Investment;
};
