const TronWeb = require("tronweb");
const bip39 = require("bip39");
const HDKey = require("hdkey");
const fs = require("fs");
const axios = require("axios");
const CoinGecko = require("coingecko-api");
const models = require("../models");

const CoinGeckoClient = new CoinGecko();
const userModel = models.User;
const userEthmanagmentmodel = models.Eth_Managment;

const RPC = process.env.RPC;
const fullNode = new TronWeb.providers.HttpProvider(RPC);

const solidityNode = new TronWeb.providers.HttpProvider(RPC);

const eventNode = new TronWeb.providers.HttpProvider(RPC);

const privateKeyOfMaintainer = process.env.ADMIN_PRIVATE_KEY;

const tronWeb = new TronWeb(fullNode, solidityNode, eventNode, privateKeyOfMaintainer);

const abi = [{
  constant: true,
  inputs: [],
  name: "name",
  outputs: [{ name: "", type: "string" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: false,
  inputs: [{ name: "_spender", type: "address" }, { name: "_value", type: "uint256" }],
  name: "approve",
  outputs: [{ name: "success", type: "bool" }],
  payable: false,
  stateMutability: "nonpayable",
  type: "function"
}, {
  constant: true,
  inputs: [],
  name: "totalSupply",
  outputs: [{ name: "", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: true,
  inputs: [],
  name: "minimumFee",
  outputs: [{ name: "", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: false,
  inputs: [{ name: "_from", type: "address" }, { name: "_to", type: "address" }, { name: "_value", type: "uint256" }],
  name: "transferFrom",
  outputs: [{ name: "success", type: "bool" }],
  payable: false,
  stateMutability: "nonpayable",
  type: "function"
}, {
  constant: true,
  inputs: [],
  name: "decimals",
  outputs: [{ name: "", type: "uint8" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: true,
  inputs: [],
  name: "maximumFee",
  outputs: [{ name: "", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: false,
  inputs: [{ name: "newBasisPoints", type: "uint256" }, { name: "newMaxFee", type: "uint256" }, { name: "newMinFee", type: "uint256" }],
  name: "setParams",
  outputs: [],
  payable: false,
  stateMutability: "nonpayable",
  type: "function"
}, {
  constant: true,
  inputs: [{ name: "owner", type: "address" }],
  name: "balanceOf",
  outputs: [{ name: "", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: true,
  inputs: [],
  name: "owner",
  outputs: [{ name: "", type: "address" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: true,
  inputs: [],
  name: "symbol",
  outputs: [{ name: "", type: "string" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: false,
  inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }],
  name: "transfer",
  outputs: [],
  payable: false,
  stateMutability: "nonpayable",
  type: "function"
}, {
  constant: true,
  inputs: [{ name: "_from", type: "address" }, { name: "_spender", type: "address" }],
  name: "allowance",
  outputs: [{ name: "remaining", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  constant: true,
  inputs: [],
  name: "basisPointsRate",
  outputs: [{ name: "", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  payable: false,
  stateMutability: "nonpayable",
  type: "constructor"
}, {
  anonymous: false,
  inputs: [{ indexed: true, name: "from", type: "address" }, { indexed: true, name: "to", type: "address" }, { indexed: false, name: "value", type: "uint256" }],
  name: "Transfer",
  type: "event"
}, {
  anonymous: false,
  inputs: [{ indexed: true, name: "_owner", type: "address" }, { indexed: true, name: "_spender", type: "address" }, { indexed: false, name: "_value", type: "uint256" }],
  name: "Approval",
  type: "event"
}, {
  anonymous: false,
  inputs: [{ indexed: false, name: "feeBasisPoints", type: "uint256" }, { indexed: false, name: "maximumFee", type: "uint256" }, { indexed: false, name: "minimumFee", type: "uint256" }],
  name: "Params",
  type: "event"
}, {
  anonymous: false,
  inputs: [{ indexed: false, name: "amount", type: "uint256" }],
  name: "Issue",
  type: "event"
}, {
  anonymous: false,
  inputs: [{ indexed: false, name: "amount", type: "uint256" }],
  name: "Redeem",
  type: "event"
}];

const triggerSmartContract = async () => {
  // intreact with ABI files
  // contract interaction in tronweb
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contract = await tronWeb.contract(abi, contractAddress);
  return contract;
};

const coinCode = 195;

// please be care full to use this use at your own risk.
const getPrivateKeyFromMnemonics = async mnemonics => {
  // dereive seed from mnemonics
  const seed = await bip39.mnemonicToSeed(mnemonics);
  const seedHex = seed.toString("hex");
  const masterHdkey = HDKey.fromMasterSeed(seedHex);
  const path = `m/44'/${coinCode}'/0'/0/0`;
  const hdKey = masterHdkey.derive(path);
  const privateKey = hdKey.privateKey.toString("hex");
  return privateKey;
};

const createWallet = async () => {
  // generate mnemonics with specific lang
  const mnemonics = bip39.generateMnemonic();

  // dereive seed from mnemonics
  const privateKey = await getPrivateKeyFromMnemonics(mnemonics);

  const tronAccount = await TronWeb.address.fromPrivateKey(privateKey);
  const tronAddress = tronWeb.address.toHex(tronAccount);

  return {
    mnemonics,
    privateKey,
    tronAccount,
    tronAddress
  };
};

const validateAddress = address => {
  return tronWeb.isAddress(address);
};

// import privateKey into this wallet.

const importPrivateKey = async privateKey => {
  const tronAccount = await tronWeb.address.fromPrivateKey(privateKey);
  return {
    privateKey,
    tronAccount
  };
};

// import mnemonics into this wallet
const importWalletMnemonics = async mnemonic => {
  if (!bip39.validateMnemonic(mnemonic)) {
    return new Error("bip39: wrong mnemonics code?");
  }
  try {
    const privateKey = await getPrivateKeyFromMnemonics(mnemonic);
    const tronAccount = await TronWeb.address.fromPrivateKey(privateKey);
    return {
      mnemonic,
      privateKey,
      tronAccount
    };
  } catch (err) {
    return err;
  }
};

// get TRX balance
const getTrxBalance = async address => {
  const toSun = await tronWeb.trx.getBalance(address);
  const fromSun = tronWeb.fromSun(toSun);
  return fromSun;
};

// get decimals of dxts token
const dxtsDecimals = async () => {
  const instance = await triggerSmartContract();
  const decimals = await instance.methods.decimals().call();
  return decimals;
};

// fromDxtsSun converter
const fromDxtsSun = (unit, decimals) => {
  return unit / 10 ** decimals;
};

//toDxtsSun converter
const toDxtsSun = (unit, decimals) => {
  return unit * 10 ** decimals;
};

// get DXTS token Balance

const getDxtsBalance = async dxtsHodlAddress => {
  const instance = await triggerSmartContract();
  const toDxtsSunBal = await instance.methods.balanceOf(dxtsHodlAddress).call();
  return parseFloat(toDxtsSunBal);
};

// token Transfer

const tokenTransfer = async (receiverAddress, tokenAmount, senderAddress, PRIVATE_KEY_SENDER) => {
  // check both address
  try {
    const sender = validateAddress(senderAddress);
    const receiver = validateAddress(receiverAddress);

    if (!sender || !receiver) {
      return {
        status: false,
        message: "Invalid Address."
      };
    }
    // verify token Amount.

    if (!tokenAmount || tokenAmount <= 0) {
      return {
        status: false,
        message: "Incorrect token amount or Insufficeint Balance"
      };
    }
    // now you can send the tokens from with to.
    const instance = await triggerSmartContract();

    // send tokens but first set the privateKey of Sender to sign transaction.
    tronWeb.setPrivateKey(PRIVATE_KEY_SENDER);

    // now you can invoke contract methods
    var senderHex = tronWeb.address.toHex(senderAddress);
    var receiverHex = tronWeb.address.toHex(receiverAddress);

    const txId = await instance.methods.transfer(receiverHex, tokenAmount).send({
      from: senderHex,
      feeLimit: 50000000
    });

    return {
      status: true,
      txId: txId
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      message: err.message
    };
  }
};

const getDxtsPriceInTrx = (trxAmountInUSD, destinySuccessAmountInUSD) => {
  const dxtsPriceInTron = parseFloat(trxAmountInUSD) / parseFloat(destinySuccessAmountInUSD);
  return parseFloat(dxtsPriceInTron).toPrecision(6);
};

const getTronPriceInUSD = async () => {
  try {
    const tron = await axios.get("https://api.coingecko.com/api/v3/coins/tron");
    const tronPriceInUSd = tron.data.market_data.current_price.usd;
    //console.log(tronPriceInUSd);
    return tronPriceInUSd;
  } catch (err) {
    return {
      status: false,
      message: err.message
    };
  }
};

/* const getDestinyPriceInUSD = async () => {
  try {
    const destiny = await axios.get(
      "https://api.coingecko.com/api/v3/coins/destiny-success"
    );
    const destinyPriceInUSD = destiny.data.market_data.current_price.usd;
    const destinyPriceInBTC = destiny.data.market_data.current_price.btc;
    return {
      destinyPriceInUSD,
      destinyPriceInBTC,
    };
  } catch (err) {
    return {
      status: false,
      message: err.message,
    };
  }
}; */

/* var getTrxCoversionInDestiny = async () => {
  //const { tronAmount } = req.query;
  try {
    let pinginfo = await CoinGeckoClient.ping();
    if (!pinginfo.code === 200) {
      return res.json({
        status: false,
        message: "Unable to fetch the amount from API",
      });
    }

    //const tronPriceInUSd = await getTronPriceInUSD();
    const destiny = await getDestinyPriceInUSD();

    var destinyPriceInTRX = getDxtsPriceInTrx(
      tronPriceInUSd,
      destiny.destinyPriceInUSD
    );

    return {
      status: true,
      message: {
        destinyPriceInTRX,
      },
    };
  } catch (err) {
    return res.json({
      status: false,
      message: err.message,
    });
  }
}; */

const buyTokensWithTrx = async (senderAddress, receiverAddress, trxAmount, PRIVATE_KEY_USER_SENDER, ADMIN_TOKEN_TRANSFER_ADDR, ADMIN_TOKEN_TRANSFER_ADDR_PY_KEY, tokenAmount, UUID) => {
  try {
    console.log('tokenAmount', tokenAmount);
    // validate here addresses
    const sender = validateAddress(senderAddress);
    const receiver = validateAddress(receiverAddress);

    if (!(sender && receiver)) {
      return {
        status: false,
        message: "Invalid Address."
      };
    } // if close

    // validate trx amount.
    if (!trxAmount || trxAmount <= 0) {
      return {
        status: false,
        message: "Incorrect trx amount"
      };
    }
    console.log('Sender--->    ', sender, '   receiver ----->', receiver, '  amount ------?', trxAmount);
    // set the Private key here

    // now send trx amount to the admin
    var txObj;

    var trxObj = await tronWeb.trx.sendTransaction(receiverAddress, trxAmount, PRIVATE_KEY_USER_SENDER);
    console.log('trxObj ===========------->', trxObj);

    if (trxObj.result && trxObj.transaction.txID) {
      // store this on user management.
      await userEthmanagmentmodel.create({
        userId: UUID,
        trx_transfer_txid: trxObj.transaction.txID,
        trx_tx_status: "SUCCESS"
      });

      // now send the equliment tokens to user.
      txObj = await tokenTransfer(senderAddress, tokenAmount, ADMIN_TOKEN_TRANSFER_ADDR, ADMIN_TOKEN_TRANSFER_ADDR_PY_KEY);

      // this will not done yet,
      // update the
      if (txObj && txObj.status && txObj.txId) {
        // update the userEthmanagmentmodel
        await userEthmanagmentmodel.update({
          token_transfer_txid: txObj.txId
        }, { where: { trx_transfer_txid: trxObj.transaction.txID } });

        return {
          status: true,
          message: "Transaction Submitted!"
        };
      } else {
        await userEthmanagmentmodel.update({
          token_transfer_status: "ERROR"
        }, { where: { trx_transfer_txid: trxObj.transaction.txID } });
        return {
          status: true,
          message: "Transaction Failed !"
        };
      }
    } // if end
    else {
        return {
          status: false,
          message: "Something Wrong Went!"
        };
      }
  } catch (err) {
    return {
      status: false,
      message: err.message
    };
  }
};

module.exports = {
  createWallet,
  validateAddress,
  importPrivateKey,
  importWalletMnemonics,
  getTrxBalance,
  getDxtsBalance,
  tokenTransfer,
  fromDxtsSun,
  toDxtsSun,
  getTronPriceInUSD,
  dxtsDecimals,
  getDxtsPriceInTrx,
  buyTokensWithTrx
};