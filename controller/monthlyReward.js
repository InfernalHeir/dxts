"use strict";
const { Op, QueryTypes } = require("sequelize");
const db = require("../models");
let jwt = require("jsonwebtoken");
const constant = require("../auth/constants");
const APPLEVEL = constant.appLevel;
var moment = require("moment"); // require
var models = require("../models");
const userRealtionModel = models.user_Realtion;
const userModel = models.User;
const rewardModel = models.Reward;
const IncomeschemeModel = models.Income_scheme;
const monthlyreturnModel = models.Monthly_return;

const PRINCIPALAMOUNT = "PRINCIPALAMOUNT";
const PROFITBONOUS = "PROFITBONOUS";
const COLDWALLET = "COLDWALLET";
const RETUEN_MAX_MONTHLY = "RETUEN_MAX_MONTHLY";

const montlyInvestment = async (userId) => {
  console.log("---------------", userId);
  console.log(
    "---------------",
    moment(moment().add(30, "days")).format("YYYY-DD-MM")
  );

  // var req = {
  //   uuid : 456789
  // }
  var montlyincome_wallets = await IncomeschemeModel.findAll({
    raw: true,
    attributes: ["percentage", "type"],
    where: {
      [Op.or]: [
        {
          type: COLDWALLET,
        },
        {
          type: PRINCIPALAMOUNT,
        },
        {
          type: PROFITBONOUS,
        },
      ],
    },
  });

  console.log("montlyincome_wallets", montlyincome_wallets);

  var maxInvestment = await IncomeschemeModel.findOne({
    raw: true,
    where: {
      type: RETUEN_MAX_MONTHLY,
    },
  });

  console.log("maxInvestment", maxInvestment);

  var user_info = await userModel.findOne({
    raw: true,
    where: {
      [Op.or]: [
        {
          // uuid: req.uuid
          id: userId,
        },
      ],
    },
  });
  console.log("user_info", user_info);

  var amountInvested = parseFloat(user_info.dollar_amount_invested);
  console.log("amountInvested", amountInvested);
  var principale_percentage = 0;
  var profitbonous_percentage = 0;
  var coldwallet_percentage = 0;

  for (var i = 0; i < montlyincome_wallets.length; i++) {
    if (montlyincome_wallets[i].type == COLDWALLET)
      coldwallet_percentage = montlyincome_wallets[i].percentage;

    if (montlyincome_wallets[i].type == PRINCIPALAMOUNT)
      principale_percentage = montlyincome_wallets[i].percentage;

    if (montlyincome_wallets[i].type == PROFITBONOUS)
      profitbonous_percentage = montlyincome_wallets[i].percentage;
  }

  var new_pricipal_amout = amountInvested * principale_percentage;

  console.log("new_pricipal_amout", new_pricipal_amout);

  var new_profitbonous_amount = amountInvested * profitbonous_percentage;

  console.log("new_profitbonous_amount", new_profitbonous_amount);

  var new_coldwallet_amount = amountInvested * coldwallet_percentage;

  console.log("new_coldwallet_amount", new_coldwallet_amount);

  var pricipalamoutTotal = await db.sequelize.query(
    "select IFNULL(sum( principal_returns_wallet ) , 0)  as pricipalamoutTotal from Monthly_returns where userId = (:id)  ",
    {
      replacements: { id: user_info.id },
      type: QueryTypes.SELECT,
    }
  );

  console.log("pricipalamoutTotal", pricipalamoutTotal);

  var coldwalletamountTotal = await db.sequelize.query(
    "select IFNULL(sum( cold_wallet ), 0) as coldwalletamountTotal from Monthly_returns where userId = (:id)  ",
    {
      replacements: { id: user_info.id },
      type: QueryTypes.SELECT,
    }
  );

  console.log("coldwalletamountTotal", coldwalletamountTotal);

  var profitbonousamountTotal = await db.sequelize.query(
    "select IFNULL(sum( profit_bonus_wallet ), 0) as profitbonousamountTotal from Monthly_returns where userId = (:id)  ",
    {
      replacements: { id: user_info.id },
      type: QueryTypes.SELECT,
    }
  );

  console.log("profitbonousamountTotal", profitbonousamountTotal);

  console.log("maxInvestment.percentage", maxInvestment.percentage);

  var maxAmountrewarded = parseFloat(maxInvestment.percentage * amountInvested);
  console.log("maxAmountrewarded", maxAmountrewarded);

  var amount_already_received = parseFloat(
    pricipalamoutTotal[0].pricipalamoutTotal +
      profitbonousamountTotal[0].profitbonousamountTotal +
      coldwalletamountTotal[0].coldwalletamountTotal
  );
  console.log("amount_already_received", amount_already_received);

  var amount_left = parseFloat(maxAmountrewarded - amount_already_received);
  console.log("amount_left", amount_left);

  if (amount_left <= 0) {
    return "sorry no amount left";
  }
  //@TODO to be called by user manually.
  //  var finalwalletAmount = parseFloat( user_info.user_application_wallet + new_pricipal_amout + new_profitbonous_amount  )
  // console.log("finalwalletAmount",finalwalletAmount)
  // var updateStatus = await userModel.update(
  //     {
  //  user_application_wallet  : finalwalletAmount
  //     },
  //     { where: {
  //        // uuid: req.uuid
  //          id : userId
  //      } }
  // );

  /// :createdAt , :updatedAt
  var monthly_payemnt = await db.sequelize.query(
    "INSERT INTO Monthly_returns (Monthly_return_percentage,principal_returns_wallet,profit_bonus_wallet,cold_wallet ,userId ,nextpaymentDate,createdAt,updatedAt) values (:Monthly_return_percentage , :principal_returns_wallet, :profit_bonus_wallet , :cold_wallet , :userId, STR_TO_DATE(:nextpaymentDate , '%Y-%m-%d'),STR_TO_DATE(:createdAt , '%Y-%m-%d'),STR_TO_DATE(:updatedAt , '%Y-%m-%d')  )",
    {
      replacements: {
        Monthly_return_percentage: parseFloat(
          principale_percentage +
            profitbonous_percentage +
            coldwallet_percentage
        ),
        principal_returns_wallet: new_pricipal_amout,
        profit_bonus_wallet: new_profitbonous_amount,
        cold_wallet: new_coldwallet_amount,
        createdAt: moment(moment()).format("YYYY-MM-DD"),
        updatedAt: moment(moment()).format("YYYY-MM-DD"),
        userId: user_info.id,
        isprofitBonousWithdrawal: false,
        isprincipalWithdrawal: false,
        iscoldWithdrawal: false,
        nextpaymentDate: moment(moment().add(30, "days")).format("YYYY-MM-DD"),
      },
      type: QueryTypes.INSERT,
    }
  );

  //INSERT INTO custorder
  //  VALUES ('Kevin', 'yes', '2012-01-01') ;
  // await monthlyreturnModel.create(
  //       )
};
//   montlyInvestment();

const receiveTodaysInvestment = async () => {
  var todaysReceiversList = await db.sequelize.query(
    "select distinct userId as userId  from Monthly_returns where  DATE(NOW())= DATE(nextpaymentDate) ",
    {
      type: QueryTypes.SELECT,
    }
  );
  console.log("todaysReceiversList", todaysReceiversList);
  for (let index = 0; index < todaysReceiversList.length; index++) {
    const element = todaysReceiversList[index];
    montlyInvestment(element.userId);
  }
};

// var toadysInvestment = schedule.scheduleJob('0 23 * * *', function(){
//     receiveTodaysInvestment();
// });

module.exports = { receiveTodaysInvestment };
