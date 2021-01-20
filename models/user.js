'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    password: DataTypes.STRING,
    uuid: DataTypes.STRING,
    eth_user_walletaddress: DataTypes.STRING,
    eth_user_keys: DataTypes.STRING,
    parent_id: DataTypes.STRING,
    dollar_amount_invested: DataTypes.FLOAT,
    token_market_price: DataTypes.FLOAT,
    token_deposited: DataTypes.FLOAT,
    account_status: DataTypes.STRING,
    user_application_wallet: DataTypes.FLOAT,
    ethereum_blockchain_txid: DataTypes.STRING,
    user_referal_id: DataTypes.STRING,
    isprivatekey: DataTypes.BOOLEAN,
    user_withdrawal_password :DataTypes.STRING,
    airDropDOllarAmount:DataTypes.FLOAT ,
    isActive : DataTypes.BOOLEAN,
    wallet_mnemanic: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};

//Add a key as user referalID
// firstName: DataTypes.STRING,
// lastName: DataTypes.STRING,
// mobile_no: DataTypes.INTEGER,

// replace email : uuid