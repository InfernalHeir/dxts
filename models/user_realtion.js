"use strict";
module.exports = (sequelize, DataTypes) => {
  const user_Realtion = sequelize.define(
    "user_Realtion",
    {
      level: DataTypes.INTEGER,
      parent_id: DataTypes.INTEGER,
      child_id: DataTypes.INTEGER,
    },
    {}
  );
  user_Realtion.associate = function (models) {
    // associations can be defined here
  };
  return user_Realtion;
};
