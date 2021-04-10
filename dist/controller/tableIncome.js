const { Op, QueryTypes } = require("sequelize");
const db = require("../models");
var models = require("../models");
const { tokenEqAmount } = require("./wallet");
const rewardModel = models.Reward;
const userModel = models.User;

//percentage will be equivalent to users count refered
const insertuserTablescheme = async uuid => {
  var levelinfo = await db.sequelize.query('select  level,member,tokenAmount from Income_schemes  where type = "TABLE";  ', {
    type: QueryTypes.SELECT
  });

  var userInfo = await userModel.findOne({
    raw: true,
    attributes: ["id"],
    where: {
      uuid: uuid
    }
  });

  var user_id = userInfo.id;
  for (let index = 0; index < levelinfo.length; index++) {
    const element = levelinfo[index];

    const reward = await rewardModel.create({
      type: "TABLE",
      reason: "TABLE INCOME",
      isWithdrawal: false,
      to: user_id,
      from: null,
      percentage: element["member"],
      rewardAmount: element["tokenAmount"]
    });
  }
};

const distributeTableReward = async () => {
  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id"]
  });

  for (let i = 0; i < alluserInfo.length; i++) {
    console.log("#########################start#######################################################################");

    let userInfo = alluserInfo[i];

    var user_id = userInfo.id;
    console.log("user_id ---,i----", user_id, i);
    var availabletablerewards = await rewardModel.findAll({
      raw: true,
      order: [["createdAt", "ASC"]],
      where: {
        to: user_id,
        isWithdrawal: false,
        type: "TABLE"
      }
    });
    console.log("availabletablerewards", availabletablerewards);
    if (availabletablerewards.length > 0) {
      var rewardId = availabletablerewards[0].id;
      var requireduserCount = availabletablerewards[0].percentage;
      var rewardtokenAmount = availabletablerewards[0].rewardAmount;
      var availableuserCount = await db.sequelize.query("select count(*) as availableusercount from user_Realtions where parent_id = (:id);", {
        replacements: { id: user_id },
        type: QueryTypes.SELECT
      });
      console.log("availableuserCount", availableuserCount);
      console.log("requireduserCount", requireduserCount);
      console.log("rewardtokenAmount", rewardtokenAmount);
      if (availableuserCount[0].availableusercount >= requireduserCount) {
        //add tokenEq  usdamount to user_application_wallet
        var USDpertoken = await tokenEqAmount(rewardtokenAmount);
        var rewardedUSD = rewardtokenAmount * USDpertoken.usdPrice;
        console.log("rewardedUSD", rewardedUSD);
        userModel.increment({ user_application_wallet: rewardedUSD }, { where: { id: user_id } });

        var updateStatus = await rewardModel.update({
          isWithdrawal: true,
          TableIncome_Singletokenrpice: USDpertoken.usdPrice
        }, { where: { id: rewardId } });
      } else {
        console.log("required amount of users not available.");
      }
    }
    console.log("################################END################################################################");
  }
};

module.exports = { insertuserTablescheme, distributeTableReward };