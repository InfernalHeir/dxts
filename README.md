# REST API DOCS

## Api url prefix http://13.126.63.235:3000

# Endpoints

## Registration

```
POST /registration
H Content-Type: application/json *

Request Body
D- uuid: string (Required)
D- password: string (Required)
D- parent_referal_id: D- initial@123654 (Required)
D- withdrawalpassword: string (Required)

RESPONSE BODY -
{
  "status": true,
  "message": "Authentication successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMTQ0NDc3ODgiLCJpYXQiOjE2MTEyOTc1MD.h7h86JUCNrPgKqYOIV6IWxuAUV4ldSXXwylOd-1XN88",
  "data": {
    "id": 2,
    "password": string,
    "uuid": "14447788",
    "trx_user_walletaddress": null,
    "trx_user_keys": null,
    "parent_id": "1",
    "dollar_amount_invested": null,
    "token_market_price": null,
    "token_deposited": null,
    "account_status": "INITIAL",
    "user_application_wallet": 1,
    "trx_blockchain_txid": null,
    "user_referal_id": "14447788",
    "isprivatekey": null,
    "user_withdrawal_password": string,
    "airDropDOllarAmount": 1,
    "isActive": true,
    "wallet_mnemanic": null,
    "createdAt": "2021-01-22T06:38:26.000Z",
    "updatedAt": "2021-01-22T06:38:26.000Z"
  }
}

Field Changes on response

i have change this fields from response.
eth_user_walletaddress-> trx_user_walletaddress
eth_user_keys-> trx_user_keys
eth_blockchain_txid-> trx_blockchain_txid


```

## Create Wallet

```
POST /walletcreate
H Content-Type: application/json (Required)

H x-access-token: string (Required)
or you can put also. use anyone your choice
H authorization: string (Required)

Request Body
// you dont need to put any data into REQUEST BODY

RESPONSE
{
  "status": true,
  "message": "Info updated.",
  "data": {
    "trx_address": "TTWAoJ8wXorAuyz39VLdQTghrKar8dH2ZH",
    "trx_phrases": "jungle tube kingdom off harvest planet gaze attitude human wash blah blah"
  }
}

Field Changes on response

i have change this fields from response.
eth_address-> trx_address
eth_phrases-> trx_phrases
```

## import Private Key or Mnemonics

```
PUT /walletimport
H Content-Type: application/json (Required)

H x-access-token: string (Required)
or you can put also. use anyone your choice
H authorization: string (Required)

Request Body
D- key: string (Required)
D- isprivateKey: string (Required)

if user sents private key, "key": user_entered_private_key. then you have to use
isprivateKey: "true".

if user sents mnemonics use "key": user_entered_mnemonics and  then you have to use
isprivateKey: "false".

IN both cases you will get same RESPONSE
{
  "status": true,
  "message": "Info updated."
}

No changes with fields
```

## get walletkeys

```
GET /walletkeys
H Content-Type: application/json (Required)

H x-access-token: string (Required)
or you can put also. use anyone your choice
H authorization: string (Required)

dont send any query string.

RESPONSE
{
  "status": true,
  "message": "Mnemanic / private Keys",
  "data": user_entered_mnemonic or user_entered_privateKey
}

No changes with fields
```

## Login

```
POST /login
H Content-Type: application/json *

Request Body
D- uuid: string (Required)
D- password: string (Required)

RESPONSE
{
  "status": true,
  "message": "Authentication successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoxNDc4ODQ0LCJpYXQiOjE2MTE0MzQ3Nzh9.hNawlxOhfEjSVT396EUY6AZRxgOmdoDyC18XqUY9G",
  "data": {
    "id": 6,
    "password": "user",
    "uuid": "1478844",
    "trx_user_walletaddress": "TN74fm7hSN8voj2jouTMGn3exjHiZgny...",
    "trx_user_keys": "a09080a7e1e14ca5a9a86ce6956e0d5c250d78a2a0d681245bd7....",
    "parent_id": "1",
    "dollar_amount_invested": null,
    "token_market_price": null,
    "token_deposited": null,
    "account_status": "INITIAL",
    "user_application_wallet": 1,
    "trx_blockchain_txid": null,
    "user_referal_id": "1478844",
    "isprivatekey": true,
    "user_withdrawal_password": "Bhup@1999",
    "airDropDOllarAmount": 1,
    "isActive": true,
    "wallet_mnemanic": "move demand delay fetch private creek plug toast secret ...",
    "createdAt": "2021-01-23T20:21:08.000Z",
    "updatedAt": "2021-01-23T20:40:34.000Z"
  }
}

Field Changes on response

i have change this fields from response.
eth_user_walletaddress-> trx_user_walletaddress
eth_user_keys-> trx_user_keys
eth_blockchain_txid-> trx_blockchain_txid
```

## Login with mnemonics

```
POST /reset
H Content-Type: application/json *

Request Body
resetphrase: string (Required)

RESPONSE
{
  "status": true,
  "message": "Authentication successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoxNDc4ODQ0LCJpYXQiOjE2MTE0MzQ3Nzh9.hNawlxOhfEjSVT396EUY6AZRxgOmdoDyC18XqUY9G",
  "data": {
    "id": 6,
    "password": "user",
    "uuid": "1478844",
    "trx_user_walletaddress": "TN74fm7hSN8voj2jouTMGn3exjHiZgny...",
    "trx_user_keys": "a09080a7e1e14ca5a9a86ce6956e0d5c250d78a2a0d681245bd7....",
    "parent_id": "1",
    "dollar_amount_invested": null,
    "token_market_price": null,
    "token_deposited": null,
    "account_status": "INITIAL",
    "user_application_wallet": 1,
    "trx_blockchain_txid": null,
    "user_referal_id": "1478844",
    "isprivatekey": true,
    "user_withdrawal_password": "Bhup@1999",
    "airDropDOllarAmount": 1,
    "isActive": true,
    "wallet_mnemanic": "move demand delay fetch private creek plug toast secret ...",
    "createdAt": "2021-01-23T20:21:08.000Z",
    "updatedAt": "2021-01-23T20:40:34.000Z"
  }
}

Field Changes on response

i have change this fields from response.
eth_user_walletaddress-> trx_user_walletaddress
eth_user_keys-> trx_user_keys
eth_blockchain_txid-> trx_blockchain_txid
```
