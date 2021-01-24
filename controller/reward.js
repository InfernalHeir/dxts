"use strict";
const { Op, QueryTypes } = require("sequelize");
const db = require("../models");
const constant = require("../auth/constants");
var moment = require("moment");
const APPLEVEL = constant.appLevel;
const { getsucessorParentList } = require("./user");
var web3 = require("web3");

const {
  checkAddress,
  getTokenBalance,
  getEthBalance,
  tokenEqAmount,
  tranferTokens,
  tokenBignumberConversion,
  transferEthers,
} = require("./wallet");

var models = require("../models");
const {
  getTrxBalance,
  getDxtsBalance,
  toDxtsSun,
  tokenTransfer,
} = require("./tronWallet");
const IncomeschemeModel = models.Income_scheme;
const userModel = models.User;
const rewardModel = models.Reward;
const monthlyreturnModel = models.Monthly_return;
const investmentAmountModel = models.Invenstment_amount;
const usertokentransfermoddel = models.User_tokenTransfer;
const userInvestmentmoddel = models.user_Investment;
const REFERRAL = "REFERRAL";
const ACTIVE = "ACTIVE";
const REASON = "NEW USER JOINING PAYEMNT UID:";
const PENDING_TX = "PENDING TX";
const INITIAL = "INITIAL";
const WITHDRAWAL = "WITHDRAWAL";
const PROHIBITIONPERIOD = 30;
const ADMIN_ETH_DEPOSIT_ADDR = "0x983cabbc46F2519fe8c8629f40B0886d59B14745";
const ADMIN_TOKEN_TRANSFER_ADDR = "0x0bcfA0f4A192701eFD0F8DA67Efb338E5740104B";
const ADMIN_TOKEN_TRANSFER_ADDR_PY_KEY =
  "0x925bff8c289bbf8716b4f79667ae02797226ccea23a1bd471e8fe93b6f4bd2b2";
const MINIMUM_ETH_FOR_TX_FEE = 0.000441;

//LEVEL INCOME
//id of user
//this should be called after the final amount of token has been reeived .
//Fixed user.user_application_wallet undefined issue iaffecting the reward.
const ReferalJoiningtx = async (user_id) => {
  //check the status of user transaction as completed @Not required as obtained from event listener.
  // FIxed  sttaus Active
  // + amount invested

  // create/call function to check eth tx status @NOT required

  // check if user does not have used the joining twice / already a enrty in reward table
  try {
    var isRewardalreadydistributed = await rewardModel.findAndCountAll({
      raw: true,
      where: {
        from: user_id,
        type: REFERRAL,
      },
    });

    console.log("isRewardalreadydistributed", isRewardalreadydistributed);
    if (isRewardalreadydistributed.count > 0) {
      return {
        status: false,
        message:
          "Reward/User referal reward is already added to referal user account wallet",
      };
    }

    var userExist = await userModel.findOne({
      attributes: {
        exclude: ["eth_user_keys"],
      },
      raw: true,
      where: {
        id: user_id,
        account_status: ACTIVE, //@TODO uncomment it
      },
    });

    console.log("userExist", userExist);
    if (!userExist) {
      return {
        status: false,
        message: "Something went wrong!",
      };
    }

    const userAmountInvested_dollar = userExist.dollar_amount_invested;

    var levelpercentage = await IncomeschemeModel.findAll({
      raw: true,
      attributes: ["level", "percentage"],
      where: {
        type: REFERRAL,
      },
    });

    // console.log("levelpercentage", levelpercentage)
    var leveluserinfo = await getsucessorParentList(user_id);
    console.log("leveluserinfo", leveluserinfo);
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

    console.log("user_level_percentage", user_level_percentage);

    console.log("####################################################");

    for (let index = 0; index < user_level_percentage.length; index++) {
      const user = user_level_percentage[index];
      console.log("user===>", user);
      console.log("user.user_application_wallet", user.user_application_wallet);
      console.log(
        "(userAmountInvested_dollar * user.percentage)",
        userAmountInvested_dollar * user.percentage
      );
      // user.user_application_wallet = 0 //@TODO comment it and obtain these variable
      const rewardAmount = userAmountInvested_dollar * user.percentage;
      user_level_percentage[index].finalAmount =
        user.user_application_wallet + rewardAmount;
      user_level_percentage[index]["type"] = REFERRAL;
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

//user can transer dxts to other wallet's
const usertokenTranster = async (req, res) => {
  let user_uuid = req.uuid;
  let { receiverAddress, tokentrasnsferAmount } = req.body;

  if (!receiverAddress || !tokentrasnsferAmount) {
    return res.send({
      status: false,
      message: "Incorrect params details!",
    });
  }
  var userExist = await userModel.findOne({
    attributes: [
      "eth_user_walletaddress",
      "id",
      "eth_user_keys",
      "isprivatekey",
      "account_status",
    ],
    raw: true,
    where: {
      uuid: user_uuid,
    },
  });

  tokentrasnsferAmount = tokentrasnsferAmount * 10 ** 18;
  //token balance
  let availableToken = await getTokenBalance(userExist.eth_user_walletaddress);

  console.log("--1--availableToken------", availableToken);

  //Eth balance
  let availableEthers = await getEthBalance(userExist.eth_user_walletaddress);

  console.log("---2-availableEthers------", availableEthers);

  if (availableEthers <= 0) {
    return res.send({
      status: false,
      message: "Insufficient funds available  : Ethers!",
    });
  }

  if (tokentrasnsferAmount > availableToken) {
    return res.send({
      status: false,
      message: "Insufficient token balance!",
    });
  }

  const tokenAmount = tokentrasnsferAmount.toString();
  // const tokenAmount = 1792114
  // const receiverAddress = receiverAddress
  const senderAddress = userExist.eth_user_walletaddress;
  const PRIVATE_KEY_SENDER = userExist.eth_user_keys;
  const isprivatekey = userExist.isprivatekey;

  console.log(
    "---------------7----------------trabsfer token------",
    tokenAmount,
    PRIVATE_KEY_SENDER,
    senderAddress,
    receiverAddress
  );

  var txinfo = await tranferTokens(
    receiverAddress,
    tokenAmount,
    senderAddress,
    PRIVATE_KEY_SENDER,
    isprivatekey
  );
  console.log("---------------8----------------------", txinfo);
  if (txinfo && txinfo.status && txinfo.data) {
    //Add the info inside the user_Investment model with  PENDING_TX state.
    await usertokentransfermoddel.create({
      userId: userExist.id,
      senderAddress: senderAddress,
      receiverAddress: receiverAddress,
      token_transfered: tokenAmount,
      ethereum_blockchain_txid: txinfo.data,
    });
    return res.send({
      status: true,
      message: "Transaction initiated .TxId :" + txinfo.data,
      data: txinfo.data,
    });
  } else {
    return res.send({
      status: false,
      message: "Something went wrong!",
    });
  }
};

// this is initial investment of DXTS token.
const initialInvestement = async (req, res) => {
  // user id
  let user_uuid = req.uuid;

  // amount invested in Doller;
  let { amount_invested } = req.body;

  // Min-Max Investment to verify
  var minmaxInvestment = await investmentAmountModel.findOne({
    attributes: ["min_amount_dollar", "max_amount_dollar"],
    raw: true,
    order: [
      // Will escape title and validate DESC against a list of valid direction parameters
      ["createdAt", "DESC"],
    ],
  });

  // dont worry this will not exposed on production
  console.log("minmaxInvestment", minmaxInvestment);

  // verify invested usd
  if (
    !amount_invested ||
    !(minmaxInvestment.min_amount_dollar <= amount_invested)
  ) {
    return res.json({
      status: false,
      message: `Minimum investment Amount is ${minmaxInvestment.min_amount_dollar}`,
    });
  }

  // second Step.

  console.log("-----------------2-----------------------");

  // fetch user basic details.

  var userExist = await userModel.findOne({
    attributes: [
      "trx_user_walletaddress",
      "id",
      "trx_user_keys",
      "isprivatekey",
      "account_status",
    ],
    raw: true,
    where: {
      uuid: user_uuid,
    },
  });

  // check if user has any investment with Initial
  // console.log("----userExist------", userExist)
  // if (userExist.account_status != INITIAL) {
  //     return res.json({
  //         status: false,
  //         message: "Sorry already invested"
  //     })
  // }

  //check if it is first time investment.

  var isfirstInvestment = await userInvestmentmoddel.findAndCountAll({
    raw: true,
    where: {
      userId: userExist.id,
    },
  });

  if (isfirstInvestment && isfirstInvestment.count == 1) {
    var startDate = moment(
      isfirstInvestment.rows[isfirstInvestment.count - 1].createdAt,
      "YYYY-MM-DD"
    ).format("YYYY-MM-DD");
    var endDate = moment(new Date());
    var totaldays = endDate.diff(startDate, "days");

    if (totaldays <= PROHIBITIONPERIOD) {
      return res.json({
        status: false,
        message:
          "Your waiting period is not over yet.Left Days : " +
          (PROHIBITIONPERIOD - totaldays),
      });
    }
  }

  // Step 3 fetch token balance
  let availableToken = await getDxtsBalance(userExist.trx_user_walletaddress);

  console.log("--1--availableToken------", availableToken);

  // fetch trx balance
  let availableTrx = await getTrxBalance(userExist.trx_user_walletaddress);

  console.log("---2-availableEthers------", availableTrx);

  if (availableTrx <= 0) {
    return res.send({
      status: false,
      message: "Insufficient funds available  : TRX!",
    });
  }

  // Step 4 now check the token amount in usd.

  let tokensInfo = await tokenEqAmount(amount_invested);

  if (!tokensInfo.status) {
    return res.json({
      status: false,
      message: "Unable to fetch the market data ",
    });
  }

  // this will give you token QTY for specfic USD;
  let tokenQty = tokensInfo.tokenAmount;

  console.log("--3-line 244---tokenrequired-----", tokenQty);

  // connvert to this tron into DXTS Conversion.
  const decimals = await dxtsDecimals();

  // getting token in DXTS SUN 8 Decimals.
  tokenQty = await toDxtsSun(tokenQty, decimals);

  // print sun 8 Decimals value in Console.
  console.log(
    "---------------4----------------token qty in 8 Decimals------",
    tokenQty
  );

  // check Condition for availablity of tokens.
  if (tokenQty > availableToken || availableTrx < 0) {
    return res.json({
      status: false,
      message: "Insufficient funds available.",
    });
  }

  //Fixed updated the actual admin
  let ADMIN_TRX_WALLET_ADDRESS = process.env.ADMIN_PUBLIC_ADDRESS;

  // store receiver address; this is for receiving tokens from users.
  const receiverAddress = ADMIN_TRX_WALLET_ADDRESS;

  // sender Address
  const senderAddress = userExist.trx_user_walletaddress;
  // sender Private Key to Sign
  const PRIVATE_KEY_SENDER = userExist.trx_user_keys;
  // is Private Key to Detect is it Mnemonics or Private Key.
  const isPrivateKey = userExist.isprivatekey;

  // trigger transfer transaction with that private Key.
  var txObj = await tranferTokens(
    receiverAddress,
    tokenAmount,
    senderAddress,
    PRIVATE_KEY_SENDER,
    isPrivateKey
  );

  console.log("---------------8----------------------", txinfo);
  if (txinfo && txinfo.status && txinfo.data) {
    if (isfirstInvestment.count == 0) {
      var updateStatus = await userModel.update(
        {
          account_status: PENDING_TX,
          dollar_amount_invested: amount_invested,
        },
        { where: { uuid: user_uuid } }
      );
    }

    //Add the info inside the user_Investment model with  PENDING_TX state.
    await userInvestmentmoddel.create({
      userId: userExist.id,
      dollar_amount_invested: amount_invested,
      account_status: PENDING_TX,
      token_market_price: amount_invested / tokenAmount,
      token_deposited: tokenAmount,
      ethereum_blockchain_txid: txinfo.data,
    });

    //can be commented as per requirement.
    var req = {
      body: {
        event: {
          transactionHash: txinfo.data,
        },
        user_uuid: user_uuid,
      },
    };
    //To be called Only once ,not each time user topup
    if (isfirstInvestment.count == 0) {
      // await userModel.increment({ dollar_amount_invested: amount_invested }, { where: { uuid: user_uuid } })
      await LevelReferalIncome(req);
    }

    await userInvestmentmoddel.update(
      {
        account_status: ACTIVE,
      },
      { where: { trx_blockchain_txid: txinfo.data } }
    );

    if (isfirstInvestment.count > 0) {
      await userModel.increment(
        { dollar_amount_invested: amount_invested },
        { where: { uuid: user_uuid } }
      );
    }
  }

  if (txinfo.status == false) {
    return res.json({
      status: false,
      message: "Unable to transfer tokens/ please try agaain. ",
    });
  }

  return res.json({
    status: true,
    message: "Investment initiated.",
    data: {
      transactionId: txinfo.data,
    },
  });
};

const LevelReferalIncome = async (req, res) => {
  let { event, user_uuid } = req.body;
  console.log("Transaction hash is:--event---- ", event.transactionHash + "\n");
  // console.log('From addresss is:------ ', event.returnValues["_from"] + '\n');
  console.log("to user_uuid is:------ ", user_uuid + "\n");

  var txupdate = await userModel.update(
    {
      account_status: ACTIVE,
    },
    { where: { uuid: user_uuid } }
  );

  console.log("---calling update tx ----", txupdate);

  if (txupdate.length < 0) {
    return {
      status: false,
      message: "Given tx doesn't exist in system.",
    };
  }
  console.log("---LINe---374---- method ---- LevelReferalIncome");

  var userInfo = await userModel.findOne({
    raw: true,
    attributes: ["id"],
    where: {
      uuid: user_uuid,
    },
  });
  console.log("---LINe---382---- method ---- LevelReferalIncome");

  var monthly_payemnt = await db.sequelize.query(
    "INSERT INTO Monthly_returns (Monthly_return_percentage,principal_returns_wallet,profit_bonus_wallet,cold_wallet ,userId ,nextpaymentDate, createdAt,updatedAt) values (:Monthly_return_percentage , :principal_returns_wallet, :profit_bonus_wallet , :cold_wallet , :userId, STR_TO_DATE(:nextpaymentDate , '%Y-%m-%d'), STR_TO_DATE(:currDate , '%Y-%m-%d') , STR_TO_DATE(:currDate , '%Y-%m-%d'))",
    {
      replacements: {
        Monthly_return_percentage: 0,
        principal_returns_wallet: 0,
        profit_bonus_wallet: 0,
        cold_wallet: 0,
        currDate: moment(moment()).format("YYYY-MM-DD"),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userInfo.id,
        nextpaymentDate: moment(moment().add(30, "days")).format("YYYY-MM-DD"),
      },
      type: QueryTypes.INSERT,
    }
  );
  console.log("---calling referal method ----", userInfo);
  await ReferalJoiningtx(userInfo.id);
};

const allIncomeTxlist = async (req, res) => {
  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid"],
  });
  const allrewardList = await rewardModel.findAll({
    raw: true,
  });
  let rewardlisting = [];
  for (let i = 0; i < allrewardList.length; i++) {
    let rewardInfo = allrewardList[i];
    let fromObj = alluserInfo.find((x) => x.id === rewardInfo.from);
    let toObj = alluserInfo.find((x) => x.id == rewardInfo.to);
    allrewardList[i]["receiveruuid"] = toObj.uuid;
    allrewardList[i]["senderuuid"] = fromObj.uuid;
  }
  return res.json({
    status: true,
    message: "All user Rewards including the withdrawal & referal",
    data: {
      allrewardList,
    },
  });
};

const allIncomeschemes = async (req, res) => {
  var allIncomeScheme = await db.sequelize.query(
    " SELECT `level`,`type`,`percentage`*100  as `percentage` ,`member`,`tokenAmount` FROM `Income_schemes`",
    {
      type: QueryTypes.SELECT,
    }
  );

  console.log("allIncomeScheme", allIncomeScheme);

  for (let index = 0; index < allIncomeScheme.length; index++) {
    const element = allIncomeScheme[index];
    if (element["type"] == "PRINCIPALAMOUNT") {
      element["type"] = "MONTHLYREWARD - " + "PRINCIPALAMOUNT";
    }
    if (element["type"] == "PROFITBONOUS") {
      element["type"] = "MONTHLYREWARD - " + "PROFITBONOUS";
    }
    if (element["type"] == "COLDWALLET") {
      element["type"] = "MONTHLYREWARD - " + "COLDWALLET";
    }
  }

  return res.json({
    status: true,
    message: "All user Reward/Income Income_scheme",
    data: {
      allIncomeScheme,
    },
  });
};

//API will retun the list of monthly return income recived by user
//if no param is provided it will retun the list of all monthly income.
const allusermonthlyrewardList = async (req, res) => {
  console.log(" req.query", req.query);
  var isSingle_user = false;
  var user_info;
  if (req.query && Object.keys(req.query).length > 0) {
    req.uuid = req.query.uuid;
    isSingle_user = true;
    user_info = await userModel.findOne({
      attributes: ["id"],
      raw: true,
      where: {
        uuid: req.uuid,
      },
    });
    if (!user_info) {
      return res.json({
        status: false,
        message: "No such user exist with given uuid",
      });
    }
  }
  var monthlyreturntxs;

  if (isSingle_user) {
    monthlyreturntxs = await db.sequelize.query(
      ' SELECT Monthly_return_percentage * 100 ,  principal_returns_wallet, profit_bonus_wallet, cold_wallet , nextpaymentDate ,Monthly_returns.createdAt as "paidAt" , uuid     FROM Users  INNER JOIN Monthly_returns  ON Users.id = Monthly_returns.userId  where Monthly_returns.userId = (:id)  ',
      {
        replacements: { id: user_info.id },
        type: QueryTypes.SELECT,
      }
    );
  } else {
    monthlyreturntxs = await db.sequelize.query(
      ' SELECT Monthly_return_percentage * 100 ,  principal_returns_wallet, profit_bonus_wallet, cold_wallet , nextpaymentDate ,Monthly_returns.createdAt as "paidAt" , uuid     FROM Users  INNER JOIN Monthly_returns  ON Users.id = Monthly_returns.userId  ',
      {
        type: QueryTypes.SELECT,
      }
    );
  }

  return res.json({
    status: true,
    message: "All user's monthly Rewards",
    data: monthlyreturntxs,
  });
};

//API will retun the list of referal income recived by user
//if no param is provided it will retun the list of all referal income.
const alluserrefralrewardList = async (req, res) => {
  console.log(" req.query", req.query);
  var isSingle_user = false;
  if (req.query && Object.keys(req.query).length > 0) {
    req.uuid = req.query.uuid;
    isSingle_user = true;
  }

  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid"],
  });
  var allrewardList;
  console.log("typeof====", typeof isSingle_user, isSingle_user, req.uuid);
  if (isSingle_user) {
    console.log("----for--single--user");
    let rewardreceivedby = alluserInfo.find((user) => user.uuid == req.uuid);
    allrewardList = await rewardModel.findAll({
      raw: true,
      attributes: {
        exclude: ["isWithdrawal", "amount_left"],
      },
      where: {
        type: REFERRAL,
        to: rewardreceivedby.id,
      },
    });
  } else {
    allrewardList = await rewardModel.findAll({
      raw: true,
      attributes: {
        exclude: ["isWithdrawal", "amount_left"],
      },
      where: {
        type: REFERRAL,
      },
    });
  }

  let rewardlisting = [];
  for (let i = 0; i < allrewardList.length; i++) {
    let rewardInfo = allrewardList[i];
    let fromObj = alluserInfo.find((x) => x.id === rewardInfo.from);
    let toObj = alluserInfo.find((x) => x.id == rewardInfo.to);
    allrewardList[i]["receiveruuid"] = toObj.uuid;
    allrewardList[i]["senderuuid"] = fromObj.uuid;
  }
  return res.json({
    status: true,
    message: "All user  referal Rewards ",
    data: allrewardList,
  });
};

// receiveruuid parent user whose referal id is used
//senderuuid child user who joined
const alluserrefrallist = async (req, res) => {
  console.log(" req.query", req.query);
  var isSingle_user = false;
  var isDirectreferal = false;
  if (req.query && Object.keys(req.query).length > 0) {
    isDirectreferal = req.query.isDirectreferal;
    req.uuid = req.query.uuid;
    isSingle_user = true;
  }
  var response = [];
  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid"],
  });
  var LevelwiseAllUserList = await db.sequelize.query(
    "SELECT `level`,`child_id`,`user_Realtions`.`parent_id`,`uuid` As `child_uuid` ,`Users`.`parent_id` As  `sponserId` ,`user_Realtions`.`createdAt`, `user_Realtions`.`updatedAt` FROM `user_Realtions` inner join Users WHERE `user_Realtions`.`child_id` = `Users`.`id` ",
    {
      type: QueryTypes.SELECT,
    }
  );

  //   console.log("LevelwiseAllUserList",LevelwiseAllUserList)

  var allrewardList;
  var LevelwiseAllUserList;
  //  console.log("typeof====",typeof isSingle_user , isSingle_user , req.uuid )
  if (isSingle_user) {
    // console.log("----for--single--user")
    var userInfo = await userModel.findOne({
      raw: true,
      attributes: ["id"],
      where: {
        uuid: req.uuid,
      },
    });

    LevelwiseAllUserList = await db.sequelize.query(
      "SELECT `level`,`child_id`,`user_Realtions`.`parent_id`,`uuid` As `child_uuid` ,`isActive` , `account_status` ,`Users`.`parent_id` As  `sponserId` , `user_Realtions`.`createdAt`, `user_Realtions`.`updatedAt` FROM `user_Realtions` inner join Users WHERE   `user_Realtions`.`parent_id` = (:id) AND `user_Realtions`.`child_id` = `Users`.`id` ",
      {
        replacements: { id: userInfo.id },
        type: QueryTypes.SELECT,
      }
    );

    console.log("LevelwiseAllUserList", LevelwiseAllUserList);
    let rewardreceivedby = alluserInfo.find((user) => user.uuid == req.uuid);
    allrewardList = await rewardModel.findAll({
      raw: true,
      attributes: {
        exclude: ["isWithdrawal", "amount_left"],
      },
      where: {
        type: REFERRAL,
        to: rewardreceivedby.id,
      },
    });
  } else {
    LevelwiseAllUserList = await db.sequelize.query(
      "SELECT `level`,`child_id`,`user_Realtions`.`parent_id`,`uuid` As `child_uuid` ,`user_Realtions`.`createdAt`, `user_Realtions`.`updatedAt` FROM `user_Realtions` inner join Users WHERE `user_Realtions`.`child_id` = `Users`.`id` ",
      {
        type: QueryTypes.SELECT,
      }
    );

    allrewardList = await rewardModel.findAll({
      raw: true,
      attributes: {
        exclude: ["isWithdrawal", "amount_left"],
      },
      where: {
        type: REFERRAL,
      },
    });
  }

  let rewardlisting = [];
  for (let i = 0; i < allrewardList.length; i++) {
    let rewardInfo = allrewardList[i];
    let fromObj = alluserInfo.find((x) => x.id === rewardInfo.from);
    let toObj = alluserInfo.find((x) => x.id == rewardInfo.to);
    // console.log("fromObj",fromObj)
    // console.log("toObj",toObj)
    // let level =     LevelwiseAllUserList.filter(x => x.child_id == fromObj.id  && x.parent_id ==  toObj.id) //
    // console.log('level-----623--',level)
    // allrewardList[i]["level"] = level[0].level
    allrewardList[i]["receiveruuid"] = toObj.uuid;
    allrewardList[i]["senderuuid"] = fromObj.uuid;
  }

  for (var i = 0; i < LevelwiseAllUserList.length; i++) {
    var userRealtion = LevelwiseAllUserList[i];
    console.log("userRealtion", userRealtion);
    let sponserinfo = alluserInfo.find((x) => x.id == userRealtion.sponserId);
    var sponser = { sponseruuid: sponserinfo.uuid };
    console.log("--sponser--", sponser);
    //    console.log("--userRealtion--",userRealtion)

    var reward = allrewardList.filter(
      (x) =>
        x.senderuuid == userRealtion.child_uuid &&
        x.to == userRealtion.parent_id
    ); //
    console.log("reward---", reward);

    var reeciverinfo = alluserInfo.find((x) => x.id == userRealtion.parent_id);
    var deafultrewrad = {
      id: 0,
      type: "REFERRAL",
      from: userRealtion.child_id,
      reason: "USER NOT INVESTED ",
      percentage: 0,
      to: userRealtion.parent_id,
      rewardAmount: 0,
      receiveruuid: reeciverinfo.uuid,
      senderuuid: userRealtion.child_uuid,
      createdAt: userRealtion.createdAt,
      updatedAt: userRealtion.updatedAt,
      sponseruuid: sponserinfo.uuid,
    };

    if (reward.length <= 0) {
      reward = deafultrewrad;
    } else {
      (reward = reward[0]), (reward = { ...reward, ...sponser });
    }
    var data = { ...LevelwiseAllUserList[i], ...reward };
    response.push(data);
  }

  if (isSingle_user) {
    if (isDirectreferal == "true") {
      response = response.filter((x) => x.level == 1);
    } else {
      response = response.filter((x) => x.level !== 1);
    }
  }
  return res.json({
    status: true,
    message: "All user  referal list ",
    data: response,
    count: response.length,
  });
};
const alluserwithdrawrewardList = async (req, res) => {
  console.log(" req.query", req.query);
  var isSingle_user = false;
  if (req.query && Object.keys(req.query).length > 0) {
    req.uuid = req.query.uuid;
    isSingle_user = true;
  }

  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid"],
  });
  var allrewardList;
  console.log("typeof====", typeof isSingle_user, isSingle_user, req.uuid);
  if (isSingle_user) {
    console.log("----for--single--user");
    let rewardreceivedby = alluserInfo.find((user) => user.uuid == req.uuid);
    allrewardList = await rewardModel.findAll({
      raw: true,
      attributes: {
        exclude: ["isWithdrawal", "amount_left"],
      },
      where: {
        type: WITHDRAWAL,
        to: rewardreceivedby.id,
      },
    });
  } else {
    allrewardList = await rewardModel.findAll({
      raw: true,
      attributes: {
        exclude: ["isWithdrawal", "amount_left"],
      },
      where: {
        type: WITHDRAWAL,
      },
    });
  }

  let rewardlisting = [];
  for (let i = 0; i < allrewardList.length; i++) {
    let rewardInfo = allrewardList[i];
    let fromObj = alluserInfo.find((x) => x.id === rewardInfo.from);
    let toObj = alluserInfo.find((x) => x.id == rewardInfo.to);
    allrewardList[i]["receiveruuid"] = toObj.uuid;
    allrewardList[i]["senderuuid"] = fromObj.uuid;
  }
  return res.json({
    status: true,
    message: "All user withdraw Rewards",
    data: allrewardList,
  });
};

const allusertablerewardList = async (req, res) => {
  var isSingle_user = false;
  if (req.query && Object.keys(req.query).length > 0) {
    req.uuid = req.query.uuid;
    isSingle_user = true;
  }
  var availabletablerewards;
  if (isSingle_user) {
    console.log("----for--single--user");
    var userExist = await userModel.findOne({
      where: {
        uuid: req.uuid,
      },
    });
    availabletablerewards = await rewardModel.findAll({
      attributes: [
        "id",
        "type",
        "reason",
        "isWithdrawal",
        ["percentage", "total_user_reffered"],
        ["to", "reeciverId"],
        ["rewardAmount", "tokenAmount"],
        ["updatedAt", "paidAt"],
      ],
      raw: true,
      where: {
        to: userExist.id,
        isWithdrawal: true,
        type: "TABLE",
      },
    });
  } else {
    availabletablerewards = await rewardModel.findAll({
      attributes: [
        "id",
        "type",
        "reason",
        "isWithdrawal",
        ["percentage", "total_user_reffered"],
        ["to", "reeciverId"],
        ["rewardAmount", "tokenAmount"],
        ["updatedAt", "paidAt"],
      ],
      // exclude :['from','amount_left']
      raw: true,
      where: {
        isWithdrawal: true,
        type: "TABLE",
      },
    });
  }

  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid"],
  });

  for (let i = 0; i < availabletablerewards.length; i++) {
    let rewardInfo = availabletablerewards[i];
    let toObj = alluserInfo.find((x) => x.id == rewardInfo.reeciverId);
    availabletablerewards[i]["receiveruuid"] = toObj.uuid;
  }

  return res.json({
    status: true,
    message: "All user table income Rewards",
    data: availabletablerewards,
  });
};

const alluserinvestmentrewardList = async (req, res) => {
  console.log(" req.query", req.query);
  var isSingle_user = false;
  if (req.query && Object.keys(req.query).length > 0) {
    req.uuid = req.query.uuid;
    isSingle_user = true;
  }

  var alluserInfo = await userModel.findAll({
    raw: true,
    attributes: ["id", "uuid"],
  });
  var allrewardList;
  console.log("typeof====", typeof isSingle_user, isSingle_user, req.uuid);
  if (isSingle_user) {
    console.log("----for--single--user");
    let rewardreceivedby = alluserInfo.find((user) => user.uuid == req.uuid);
    console.log("rewardreceivedby", rewardreceivedby);
    allrewardList = await userInvestmentmoddel.findAll({
      raw: true,
      where: {
        userId: rewardreceivedby.id,
      },
    });
  } else {
    allrewardList = await userInvestmentmoddel.findAll({
      raw: true,
    });
  }
  for (let i = 0; i < allrewardList.length; i++) {
    let rewardInfo = allrewardList[i];
    let toObj = alluserInfo.find((x) => x.id == rewardInfo.userId);
    allrewardList[i]["receiveruuid"] = toObj.uuid;
    allrewardList[i]["token_deposited"] =
      allrewardList[i]["token_deposited"] / 10 ** 18;
  }
  return res.json({
    status: true,
    message: "All user investments",
    data: allrewardList,
  });
};

const updateAirdrop = async (req, res) => {
  let { airDropAmount } = req.body;
  if (
    airDropAmount.length <= 0 ||
    !Number.isInteger(parseFloat(airDropAmount))
  ) {
    return res.json({
      status: false,
      message: " Inavlid Airdrop amount",
    });
  }

  var levelinfo = await db.sequelize.query(
    " update airDrops set airdropDollarAmoount = :amount;  ",
    {
      replacements: {
        amount: airDropAmount,
      },
      type: QueryTypes.INSERT,
    }
  );

  return res.json({
    status: true,
    message: "Airdrop amount updated",
  });
};

const getAirDrop = async (req, res) => {
  var airdropinfo = await db.sequelize.query(
    " select airdropDollarAmoount  from airDrops  LIMIT 1;  ",
    {
      type: QueryTypes.SELECT,
    }
  );

  return res.json({
    status: true,
    message: "Airdrop info",
    data: airdropinfo,
  });
};

const minmaxdollarInvestment = async (req, res) => {
  var maxmininvst = await db.sequelize.query(
    " select min_amount_dollar , max_amount_dollar  from Invenstment_amounts;",
    {
      type: QueryTypes.SELECT,
    }
  );

  return res.json({
    status: true,
    message: "Min - max dollar monthly investment",
    data: maxmininvst,
  });
};

//user can transer dxts to other wallet's
const trxtoTokenconversion = async (req, res) => {
  let user_uuid = req.uuid;
  let { tokentransferAmount, trxAmount } = req.body;

  if (!tokentransferAmount) {
    return res.send({
      status: false,
      message: "Incorrect params details!",
    });
  }
  //the amount of ethers to be deducted from user's wallet for conversion to token.
  if (!trxAmount) {
    return res.send({
      status: false,
      message: "Incorrect params details!",
    });
  }

  let tokensInfo = await tokenEqAmount(trxAmount);
  console.log("tokensInfo", tokensInfo);

  console.log("tokentransferAmount", tokentransferAmount);
  if (tokensInfo.status) {
    var expecttokenrequired = parseInt(
      parseFloat(ethAmount) / tokensInfo.ethPrice
    );
    console.log("expecttokenrequired", expecttokenrequired);
    if (
      !(
        tokentransferAmount >= 0.9 * expecttokenrequired &&
        tokentransferAmount <= 1.1 * expecttokenrequired
      )
    ) {
      return res.send({
        status: false,
        message: "Invalid conversion found, please try again !",
      });
    }
  }

  var userExist = await userModel.findOne({
    attributes: [
      "trx_user_walletaddress",
      "id",
      "eth_user_keys",
      "isprivatekey",
      "account_status",
    ],
    raw: true,
    where: {
      uuid: user_uuid,
    },
  });

  let decimals = await web3.utils.toBN(18);
  tokentransferAmount = await web3.utils.toBN(tokentransferAmount);
  tokentransferAmount = tokentransferAmount.mul(
    web3.utils.toBN(10).pow(decimals)
  );
  tokentransferAmount = tokentransferAmount.toString();

  console.log("--2-tokentransferAmount------", tokentransferAmount);

  //token balance
  let availableToken = await getTokenBalance(ADMIN_TOKEN_TRANSFER_ADDR);

  console.log("--1--availableToken------", availableToken);

  //Eth balance
  let admin_availableEthers = await getEthBalance(ADMIN_TOKEN_TRANSFER_ADDR);

  console.log("---2-admin_availableEthers------", admin_availableEthers);

  let user_availableEthers = await getEthBalance(
    userExist.eth_user_walletaddress
  );
  console.log("user_availableEthers", user_availableEthers);
  ethAmount = ethAmount * 10 ** 18;
  console.log("ethAmount", ethAmount);

  if (user_availableEthers <= 0 || ethAmount > user_availableEthers) {
    return res.send({
      status: false,
      message: "Sorry you have Insufficient ethers availablity.",
    });
  }

  if (admin_availableEthers <= 0) {
    return res.send({
      status: false,
      message:
        "Sorry request cant not be full-filled .Please contact the support for deposit issue due to Insufficient ethers availablity.",
    });
  }

  if (parseInt(tokentransferAmount) > parseInt(availableToken)) {
    return res.send({
      status: false,
      message:
        "Sorry request cant not be full-filled .Please contact the support for deposit issue due to  Insufficient token balance!",
    });
  }

  await transferEthers(
    ADMIN_ETH_DEPOSIT_ADDR,
    userExist.eth_user_walletaddress,
    ethAmount,
    userExist.eth_user_keys,
    userExist.isprivatekey,
    ADMIN_TOKEN_TRANSFER_ADDR,
    ADMIN_TOKEN_TRANSFER_ADDR_PY_KEY,
    tokentransferAmount,
    userExist.id
  );
};

const ethConversionRateInfo = async (req, res) => {
  try {
    let { eth_available_for_token } = req.query;
    let user_availableEthers;

    var userExist = await userModel.findOne({
      attributes: ["eth_user_walletaddress", "id"],
      raw: true,
      where: {
        uuid: req.uuid,
      },
    });

    user_availableEthers = await getEthBalance(
      userExist.eth_user_walletaddress
    );
    if (!eth_available_for_token) {
      eth_available_for_token = user_availableEthers - MINIMUM_ETH_FOR_TX_FEE;
    }
    let tokensInfo = await tokenEqAmount(eth_available_for_token);
    if (!tokensInfo.status) {
      return res.status(500).json({
        status: false,
        message: "Something went wrong",
      });
    }

    var expecttokenreceived = parseInt(
      parseFloat(eth_available_for_token) / tokensInfo.ethPrice
    );

    tokensInfo["totalAvailableEth"] = user_availableEthers / 10 ** 18;
    tokensInfo["eth_available_for_token"] = eth_available_for_token;
    tokensInfo["expectedTokenAmount"] = expecttokenreceived;

    return res.status(200).json({
      status: true,
      message: "token Info",
      data: tokensInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const trxConversionRateInfo = async (req, res) => {
  try {
    let { trx_available_for_token } = req.query;

    let user_availableTrx;

    var userExist = await userModel.findOne({
      attributes: ["trx_user_walletaddress", "id"],
      raw: true,
      where: {
        uuid: req.uuid,
      },
    });

    console.log(req.uuid);

    user_availableTrx = await getTrxBalance(userExist.trx_user_walletaddress);

    if (!trx_available_for_token) {
      trx_available_for_token = user_availableTrx - MINIMUM_ETH_FOR_TX_FEE;
    }
    let tokensInfo = await tokenEqAmount(trx_available_for_token);

    // status for token info
    if (!tokensInfo.status) {
      return res.status(500).json({
        status: false,
        message: "Something went wrong",
      });
    }

    // excepted token received
    var expecttokenreceived = parseInt(
      parseFloat(trx_available_for_token) / tokensInfo.trxPrice
    );

    tokensInfo["totalAvailableTrx"] = user_availableTrx;
    tokensInfo["trx_available_for_token"] = trx_available_for_token;
    tokensInfo["expectedTokenAmount"] = expecttokenreceived;

    return res.status(200).json({
      status: true,
      message: "token Info",
      data: tokensInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  initialInvestement,
  LevelReferalIncome,
  allIncomeschemes,
  allIncomeTxlist,
  allusermonthlyrewardList,
  alluserrefralrewardList,
  alluserwithdrawrewardList,
  allusertablerewardList,
  minmaxdollarInvestment,
  alluserinvestmentrewardList,
  updateAirdrop,
  alluserrefrallist,
  getAirDrop,
  usertokenTranster,
  trxtoTokenconversion,
  trxConversionRateInfo,
  ethConversionRateInfo,
};
