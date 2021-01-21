"use strict";
module.exports = (sequelize, DataTypes) => {
  const WithdrawalRequest = sequelize.define(
    "WithdrawalRequest",
    {
      dollaramountWithdraw: DataTypes.FLOAT,
      tokenPrice: DataTypes.FLOAT,
      status: DataTypes.STRING,
      requesteduserId: DataTypes.STRING,
      description: DataTypes.STRING,
      transaction_id: DataTypes.STRING,
      tokenAmount: DataTypes.FLOAT,
    },
    {}
  );
  WithdrawalRequest.associate = function (models) {
    // associations can be defined here
  };
  return WithdrawalRequest;
};
