"use strict";
module.exports = (sequelize, DataTypes) => {
  const Reward = sequelize.define(
    "Reward",
    {
      type: DataTypes.STRING,
      from: DataTypes.INTEGER,
      reason: DataTypes.STRING,
      isWithdrawal: DataTypes.BOOLEAN,
      amount_left: DataTypes.FLOAT,
      percentage: DataTypes.FLOAT,
      to: DataTypes.STRING,
      rewardAmount: DataTypes.FLOAT,
      TableIncome_Singletokenrpice: DataTypes.FLOAT,
    },
    {}
  );
  Reward.associate = function (models) {
    // associations can be defined here
  };
  return Reward;
};
