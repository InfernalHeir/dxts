const TronWeb = require("tronweb");
const bip39 = require("bip39");
const HDKey = require("hdkey");
const fs = require("fs");
const axios = require("axios");
const CoinGecko = require("coingecko-api");

const CoinGeckoClient = new CoinGecko();

const fullNode = new TronWeb.providers.HttpProvider("https://api.trongrid.io/");

const solidityNode = new TronWeb.providers.HttpProvider(
  "https://api.trongrid.io/"
);

const eventNode = new TronWeb.providers.HttpProvider(
  "https://api.trongrid.io/"
);

const privateKeyOfMaintainer = process.env.ADMIN_PRIVATE_KEY;

const tronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventNode,
  privateKeyOfMaintainer
);

const triggerSmartContract = async () => {
  // intreact with ABI files
  // contract interaction in tronweb

  const abiRaw = fs.readFileSync("/home/bhupendra/dxts/constants/ABI.json");
  const abi = JSON.parse(abiRaw);
  const contractAddress = "THcQ2jUys38gp46M8p3HwwZ2dxivA8fvgK";
  const contract = await tronWeb.contract(abi, contractAddress);
  return contract;
};

const coinCode = 195;

// please be care full to use this use at your own risk.
const getPrivateKeyFromMnemonics = async (mnemonics) => {
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
    tronAddress,
  };
};

const validateAddress = (address) => {
  return tronWeb.isAddress(address);
};

// import privateKey into this wallet.

const importPrivateKey = async (privateKey) => {
  const tronAccount = await tronWeb.address.fromPrivateKey(privateKey);
  return {
    privateKey,
    tronAccount,
  };
};

// import mnemonics into this wallet
const importWalletMnemonics = async (mnemonic) => {
  if (!bip39.validateMnemonic(mnemonic)) {
    return new Error("bip39: wrong mnemonics code?");
  }
  try {
    const privateKey = await getPrivateKeyFromMnemonics(mnemonic);
    const tronAccount = await TronWeb.address.fromPrivateKey(privateKey);
    return {
      mnemonic,
      privateKey,
      tronAccount,
    };
  } catch (err) {
    return err;
  }
};

// get TRX balance
const getTrxBalance = async (address) => {
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
const toDxtsSun = (uint, decimals) => {
  return unit * 10 ** decimals;
};

// get DXTS token Balance

const getDxtsBalance = async (dxtsHodlAddress) => {
  const instance = await triggerSmartContract();
  const toDxtsSunBal = await instance.methods.balanceOf(dxtsHodlAddress).call();
  return parseFloat(toDxtsSunBal);
};

// token Transfer

const tokenTransfer = async (
  receiverAddress,
  tokenAmount,
  senderAddress,
  PRIVATE_KEY_SENDER,
  isPrivateKey
) => {
  // check both address
  const sender = validateAddress(senderAddress);
  const receiver = validateAddress(receiverAddress);
  if (!(sender && receiver)) {
    return {
      status: false,
      message: "Invalid Address.",
    };
  }
  // verify token Amount.

  if (!tokenAmount || tokenAmount <= 0) {
    return {
      status: false,
      message: "Incorrect token amount or Insufficeint Balance",
    };
  }
  // now you can send the tokens from with to.
  const instance = await triggerSmartContract();
  let usedPrivateKey;
  if (!isPrivateKey) {
    usedPrivateKey = await getPrivateKeyFromMnemonics();
  }
  // send tokens but first set the privateKey of Sender to sign transaction.
  tronWeb.setPrivateKey(PRIVATE_KEY_SENDER);

  // now you can invoke contract methods
  try {
    const txObj = await instance.methods
      .transfer(receiverAddress, tokenAmount)
      .send({
        from: senderAddress,
      });

    return {
      status: "success",
      message: txObj,
    };
  } catch (err) {
    return {
      status: "failed",
      message: err.message,
    };
  }
};

const getDxtsPriceInTrx = (trxAmountInUSD, destinySuccessAmountInUSD) => {
  const dxtsPriceInTron =
    parseFloat(trxAmountInUSD) / parseFloat(destinySuccessAmountInUSD);
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
      message: err.message,
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
};
