'use strict';
module.exports = (sequelize, DataTypes) => {
  const Monthly_return = sequelize.define('Monthly_return', {
    Monthly_return_percentage: DataTypes.FLOAT,
    principal_returns_wallet: DataTypes.FLOAT,
    profit_bonus_wallet: DataTypes.FLOAT,
    cold_wallet: DataTypes.FLOAT,
    nextpaymentDate : DataTypes.DATE,
    userId : DataTypes.INTEGER,
    isprofitBonousWithdrawal : DataTypes.BOOLEAN,
    isprincipalWithdrawal : DataTypes.BOOLEAN ,
    iscoldWithdrawal : DataTypes.BOOLEAN 
  }, {});
  Monthly_return.associate = function(models) {
    // associations can be defined here
  };
  return Monthly_return;
};