'use strict';
module.exports = (sequelize, DataTypes) => {
  const User_tokenTransfer = sequelize.define('User_tokenTransfer', {
    userId: DataTypes.INTEGER,
    senderAddress: DataTypes.STRING,
    receiverAddress: DataTypes.STRING,
    token_transfered: DataTypes.FLOAT,
    ethereum_blockchain_txid: DataTypes.STRING
  }, {});
  User_tokenTransfer.associate = function(models) {
    // associations can be defined here
  };
  return User_tokenTransfer;
};