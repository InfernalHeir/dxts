"use strict";
const { Op, QueryTypes } = require("sequelize");
const db = require("../models");
var models = require("../models");
const withdrawalRequestModel = models.WithdrawalRequest;
const IncomeschemeModel = models.Income_scheme;
const userModel = models.User;
const rewardModel = models.Reward;
const ACTIVE = "ACTIVE";
const { tokenEqAmount } = require("./wallet");
const { getsucessorParentList } = require("./user");
const WITHDRAWN = "WITHDRAWN";
const WITHDRAWAL = "WITHDRAWAL";
const REASON = "USER WITHDRAWAL PAYEMNT UID:";

//user_application_wallet subtract the given amount from the users wallet first
const withdrawalROI = async (user_info, amountWithdrawn) => {
  try {
    const amount_Withdrawn = amountWithdrawn;
    let user_id = user_info.id;
    console.log("---withdrawalROI--amount_Withdrawn--", amount_Withdrawn);
    console.log("---withdrawalROI--user_id--", amount_Withdrawn);

    var levelpercentage = await IncomeschemeModel.findAll({
      raw: true,
      attributes: ["level", "percentage"],
      where: {
        type: WITHDRAWAL,
      },
    });

    console.log("--withdrawalROI---levelpercentage", levelpercentage);
    var leveluserinfo = await getsucessorParentList(user_id);
    console.log("--withdrawalROI----leveluserinfo", leveluserinfo);
    console.log("####################################################");

    let user_level_percentage = [];

    for (let i = 0; i < leveluserinfo.length; i++) {
      user_level_percentage.push({
        ...leveluserinfo[i],
        ...levelpercentage.find(
          (itmInner) => itmInner.level === leveluserinfo[i].level
        ),
      });
    }

    console.log(
      "--withdrawalROI----user_level_percentage",
      user_level_percentage
    );

    console.log("####################################################");

    for (let index = 0; index < user_level_percentage.length; index++) {
      const user = user_level_percentage[index];
      console.log("--withdrawalROI----user===>", user);
      console.log(
        "-----withdrawalROI-----user.user_application_wallet",
        user.user_application_wallet
      );
      console.log(
        "--withdrawalROI----(amount_Withdrawn * user.percentage)",
        amount_Withdrawn * user.percentage
      );
      // user.user_application_wallet = 0 //@FIXED comment it and obtain these variable
      const rewardAmount = amount_Withdrawn * user.percentage;
      user_level_percentage[index].finalAmount =
        user.user_application_wallet + rewardAmount;
      user_level_percentage[index]["type"] = WITHDRAWAL;
      user_level_percentage[index]["reason"] = REASON + user_id;
      user_level_percentage[index]["isWithdrawal"] = false;
      user_level_percentage[index]["to"] = user.parent_id;
      user_level_percentage[index]["from"] = user_id;
      user_level_percentage[index]["percentage"] = user.percentage;
      user_level_percentage[index]["reward"] = rewardAmount;
    }

    console.log("user_level_percentage", JSON.stringify(user_level_percentage));

    // const result = await sequelize.transaction(async (t) => {

    for (let index = 0; index < user_level_percentage.length; index++) {
      console.log(
        "user_level_percentage----idex---",
        user_level_percentage[index]
      );
      var applicattionwalletupdate = await userModel.update(
        {
          user_application_wallet: user_level_percentage[index].finalAmount,
        },
        {
          where: { id: user_level_percentage[index].parent_id },
        }

        // , { transaction: t }
      );

      const reward = await rewardModel.create(
        {
          type: user_level_percentage[index]["type"],
          reason: user_level_percentage[index]["reason"],
          isWithdrawal: user_level_percentage[index]["isWithdrawal"],
          to: user_level_percentage[index]["to"],
          from: user_level_percentage[index]["from"],
          percentage: user_level_percentage[index]["percentage"],
          rewardAmount: user_level_percentage[index]["reward"],
        } //, { transaction: t }
      );
    }

    // });

    // If the execution reaches this line, the transaction has been committed successfully
    // `result` is whatever was returned from the transaction callback (the `user`, in this case)
  } catch (error) {
    console.log("error", error);
    // If the execution reaches this line, an error occurred.
    // The transaction has already been rolled back automatically by Sequelize!
  }
};

const addwithdrawalRequest = async (req, res) => {
  const { withdrawAmount, withdrawalpassword } = req.body;
  let tokenAmount = 0;

  if (!withdrawAmount || withdrawAmount <= 0) {
    return res.json({
      status: false,
      message: "Please provide valid amount in USD",
    });
  }

  if (!withdrawalpassword || withdrawalpassword <= 0) {
    return res.json({
      status: false,
      message: "Please provide valid password ",
    });
  }

  // var uuid = req.uuid
  var userInfo = await userModel.findOne({
    attributes: ["user_application_wallet", "id", "user_withdrawal_password"],
    raw: true,
    where: {
      uuid: req.uuid,
      account_status: ACTIVE,
    },
  });
  console.log("userInfo", userInfo);
  if (!userInfo || userInfo.length <= 0) {
    return res.json({
      status: false,
      message: 'Sorry the amount can"t be withdrawan',
    });
  }
  if (userInfo.user_withdrawal_password != withdrawalpassword) {
    return res.json({
      status: false,
      message: "Sorry the incorrrect withdraw password",
    });
  }
  if (userInfo.user_application_wallet < withdrawAmount) {
    return res.json({
      status: false,
      message: "Insufficient amount to be withdrawan",
    });
  }
  if (!userInfo && Object.keys(userInfo).length < 0) {
    return res.json({
      status: false,
      message: "No such user exist",
    });
  }

  var tokenRatesInfo = await tokenEqAmount(withdrawAmount);
  console.log("tokenRatesInfo", tokenRatesInfo);
  if (tokenRatesInfo.status) {
    tokenAmount = tokenRatesInfo.tokenAmount;
  } else {
    return res.json({
      status: false,
      message: "Something went wrong!",
    });
  }
  var alreadypendingwithdrawal = await withdrawalRequestModel.findAll({
    raw: true,
    where: {
      status: "INITIAL",
      requesteduserId: userInfo.id,
    },
  });

  if (alreadypendingwithdrawal.length > 0) {
    return res.json({
      status: false,
      message: "You already had a pending withdrawal request !",
    });
  }

  await withdrawalRequestModel.create({
    dollaramountWithdraw: withdrawAmount,
    tokenPrice: withdrawAmount / tokenAmount,
    tokenAmount: tokenAmount,
    status: "INITIAL",
    requesteduserId: userInfo.id,
    description: "",
    transaction_id: null,
    tokenAmount: tokenAmount,
  });

  return res.json({
    status: true,
    message: "Request for withdrawal submmited sucessfully",
  });
};

const getpendingwithdrawalList = async (req, res) => {
  var withdrawalusers;
  if (req.query && Object.keys(req.query).length > 0) {
    req.uuid = req.query.uuid;
    // return  withdrawalUserList(req,res)
    var user_info = await userModel.findOne({
      raw: true,
      where: {
        [Op.or]: [
          {
            uuid: req.uuid,
          },
        ],
      },
    });

    withdrawalusers = await withdrawalRequestModel.findAll({
      raw: true,
      where: {
        requesteduserId: user_info.id,
        status: "INITIAL",
      },
    });
  } else {
    withdrawalusers = await withdrawalRequestModel.findAll({
      raw: true,
      where: {
        status: "INITIAL",
      },
    });
  }
  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid", "trx_user_walletaddress"],
  });

  for (var i = 0; i < withdrawalusers.length; i++) {
    var user = withdrawalusers[i];
    console.log("userRealtion", user);
    let userinfo = alluserInfo.find((x) => x.id == user.requesteduserId);
    (withdrawalusers[i]["requesteduseruuid"] = userinfo.uuid),
      (withdrawalusers[i]["trxaddress"] = userinfo.trx_user_walletaddress);
  }
  return res.json({
    status: true,
    message: "List of users for withdrawal request",
    data: withdrawalusers,
  });
};

//@TODO only called via admin
const updatependingwithdrawalstatus = async (req, res) => {
  let { description, txid, withdrawreqId } = req.body;

  if (!description || description.length <= 0)
    return res.status(500).json({
      status: false,
      message: "Please provide a description",
    });

  if (!txid || txid.length <= 0)
    return res.status(500).json({
      status: false,
      message: "Please provide a txid ",
    });

  if (!withdrawreqId || withdrawreqId.length <= 0)
    return res.status(500).json({
      status: false,
      message: "Please provide a valid withdrawreqId",
    });

  var withdrawExist = await withdrawalRequestModel.findOne({
    where: {
      status: "INITIAL",
      id: withdrawreqId,
    },
  });

  if (withdrawExist.length <= 0)
    return res.status(500).json({
      status: false,
      message: "Given withdrawal req does not have any pending request.",
    });

  console.log("withdrawExist", withdrawExist);
  var updateStatus = await withdrawalRequestModel.update(
    {
      description: description,
      transaction_id: txid,
      status: WITHDRAWN,
    },
    { where: { id: withdrawreqId } }
  );

  console.log("updateStatus", updateStatus);

  var withdrawaluserlist = await withdrawalRequestModel.findOne({
    where: {
      id: withdrawreqId,
    },
  });

  console.log("withdrawaluserlist", withdrawaluserlist);

  var user_info = await userModel.findOne({
    where: {
      [Op.or]: [
        {
          id: withdrawaluserlist.requesteduserId,
        },
      ],
    },
  });
  console.log("user_info", user_info);

  //user_application_walletlet subtract the given amount from the users wallet first

  var userWalletBalace = parseFloat(user_info.user_application_wallet);
  var amountWithdrawn = parseFloat(withdrawaluserlist.dollaramountWithdraw);
  var remainingWalletBalance = userWalletBalace - amountWithdrawn;

  console.log("userWalletBalace", userWalletBalace);
  console.log("amountWithdrawn", amountWithdrawn);
  console.log("remainingWalletBalance", remainingWalletBalance);

  var subtractwithdrawmAmount = await userModel.update(
    {
      //Decrease the user_application_wallet by the withdrawn amount
      user_application_wallet: remainingWalletBalance,
    },
    { where: { id: user_info.id } }
  );

  console.log("subtractwithdrawmAmount", subtractwithdrawmAmount);
  console.log("amountWithdrawn", amountWithdrawn);

  await withdrawalROI(user_info, amountWithdrawn);
  return res.status(200).json({
    status: true,
    message: "Given withdrawal req has been updated.",
  });
};

const withdrawalUserList = async (req, res) => {
	console.log('===?>  req', req.uuid)
  var user_info = await userModel.findOne({
    raw: true,
    where: {
      [Op.or]: [
        {
          uuid: req.uuid,
        },
      ],
    },
  });
console.log('userInfo',user_info)
  var withdrawalList = await withdrawalRequestModel.findAll({
    where: {
      requesteduserId: user_info.id,
    },
  });

  console.log("withdrawalList=====>", withdrawalList);

  return res.status(200).json({
    status: true,
    message: "Withdrawal info list for given user .",
    data: withdrawalList,
  });
};

module.exports = {
  addwithdrawalRequest,
  getpendingwithdrawalList,
  updatependingwithdrawalstatus,
  withdrawalUserList,
};
