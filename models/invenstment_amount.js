"use strict";
module.exports = (sequelize, DataTypes) => {
  const Invenstment_amount = sequelize.define(
    "Invenstment_amount",
    {
      min_amount_dollar: DataTypes.INTEGER,
      max_amount_dollar: DataTypes.INTEGER,
    },
    {}
  );
  Invenstment_amount.associate = function (models) {
    // associations can be defined here
  };
  return Invenstment_amount;
};
