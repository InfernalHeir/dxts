"use strict";
module.exports = (sequelize, DataTypes) => {
  const Eth_Managment = sequelize.define(
    "Eth_Managment",
    {
      userId: DataTypes.INTEGER,
      token_transfer_txid: DataTypes.STRING,
      trx_transfer_txid: DataTypes.STRING,
      token_transfer_status: DataTypes.STRING,
      ether_tx_status: DataTypes.STRING,
    },
    {}
  );
  Eth_Managment.associate = function (models) {
    // associations can be defined here
  };
  return Eth_Managment;
};
