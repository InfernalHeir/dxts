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

## Wallet Exist

```
GET /walletexist
H Content-Type: application/json *
H x-access-token: string (Required)
or you can put also. use anyone your choice
H authorization: string (Required)

Query String
// dont need to send any query string

RESPONSE
{
    "status": true,
    "walletAddress": "TTN6FswMcryeVGvtGmrGFCTYKVAZZuo..",
    "tokenBalance": 0..
}
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

## tokenpriceinfo

```
GET /tokenpriceinfo
H x-access-token: string (Required)
or you can put also. use anyone your choice
H authorization: string (Required)

Query Stirng
usdAmount: number

RESPONSE
{
    "status": true,
    "message": "Token price Info",
    "data": {
        "tokenAmount": "505.7446267794",
        "usdAmount": "12",
        "tokenPrice": 0.02372739
    }
}
```

## userwalletbalance

```
GET /userwalletbalance
H x-access-token: string (Required)
or you can put also. use anyone your choice
H authorization: string (Required)

Query Stirng
// you dont need to send any query string

RESPONSE
{
    "status": true,
    "message": "Wallet Token Balance",
    "tokenBalance": 0
}
```

## dashboard

```
GET /dashboard
H x-access-token: string (Required)
or you can put also. use anyone your choice
H authorization: string (Required)

Query Stirng
// you dont need to send any query string

RESPONSE
{
    "status": true,
    "message": "Dashboard Info",
    "data": {
        "status": "INITIAL",
        "walletBalance": 0,
        "amountInvested": null,
        "incomeReferal": null,
        "tableIncome": 0,
        "monthlyROI": 0,
        "withdrawalIncome": 0,
        "principal_wallet": 0,
        "profitbonous_wallet": 0,
        "coold_wallet": 0,
        "referalId": "123456789",
        "directReferalCount": 0,
        "totalIncome": 1,
        "airDropDOllarAmount": 1,
        "userUiid": "123456789",
        "dxtusdrates": "0.02329592",
        "dxtbtcrates": "7.252e-7",
        "walletTrx": "0",
        "qraddress": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATlSURBVO3BQY4jRxAEwfAC//9l1x7zVECjk6NZKczwj1QtOaladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhZ98hKQn6RmAjKpmYDcqPkmIDdqboD8JDVvnFQtOqladFK16JNlajYBuVEzAZnUfBOQGzUTkDfUbAKy6aRq0UnVopOqRZ98GZAn1PybgExqJiBPALkBMql5AsgTar7ppGrRSdWik6pFn/zlgNwAmdTcqJmAPKHmBsh/2UnVopOqRSdViz75nwEyqZmA3KiZgExAJjU3av5LTqoWnVQtOqla9MmXqflJam6AvAFkUnMDZFIzAZnUPKHmNzmpWnRSteikatEny4D8JkAmNROQSc0EZFIzAZnUfBOQ3+ykatFJ1aKTqkWfvKTmbwJkk5oJyKRmAjKpuVHzNzmpWnRSteikatEnLwGZ1DwBZFIzAdmkZgIyAbkBMqm5AfIEkE1qboBMat44qVp0UrXopGrRJy+pmYBMam7U3KjZBGRS801qJiBPqJmA3KiZgPykk6pFJ1WLTqoWffJlQCY1TwCZ1ExAbtQ8AeQNNTdqbtRMQCY1v9lJ1aKTqkUnVYs+eQnIpGYCMgF5Qs0mIJOaGzU/Ccik5gkgk5oJyKRm00nVopOqRSdViz55Sc0TaiYgk5oJyI2aCcg3AZnUTEB+EyA3QCY1b5xULTqpWnRSteiTZUAmNROQSc0EZFLzhJpNQCY1E5AbNTdAJjU3QG7UTEAmNd90UrXopGrRSdUi/CNfBGRSMwF5Q80EZFKzCcik5gbIpOYJIJOaJ4BMaiYgk5o3TqoWnVQtOqla9MkyIDdAJjUTkEnNBORGzQTkRs0NkDfUTEAmNTdqJiBPqJmAfNNJ1aKTqkUnVYs+eQnIE2qeADKpeULNBOQGyI2aCciNmieATGpu1LyhZtNJ1aKTqkUnVYs++TI1E5BJzY2aCciNmhs1N2pugExqboBMap4AcgPkNzmpWnRSteikatEnL6m5AXIDZFIzAblRMwGZ1NwA2QTkCSCTmgnIJjUTkEnNGydVi06qFp1ULcI/8oOA3Ki5AfKGmgnIjZoJyI2aJ4DcqJmATGomIJOaCciNmjdOqhadVC06qVr0yUtAnlDzBJBJzQRkUnMD5A01N0Bu1DwB5AbIpOYJNZtOqhadVC06qVr0yUtqvknNG0AmNTdAJiCTmgnIpGYCMgG5UfMEkBsgP+mkatFJ1aKTqkWfvATkJ6l5A8iNmhsgk5oJyCYgk5obIDdqJiCTmjdOqhadVC06qVr0yTI1m4DcqJmATGomIE8AmdQ8oWYC8oSaN9TcqNl0UrXopGrRSdWiT74MyBNqngAyqZmA3KiZgNwAmdRMaiYgTwDZBGRS800nVYtOqhadVC365C+nZgIyqZmATEBu1ExAJiCTmhs1N0AmNROQSc0TQCY1m06qFp1ULTqpWvTJ/4yaCcgbaiYgN0AmNZOaGzU3QCY1N0AmNW+cVC06qVp0UrXoky9T85sAuVEzAdmk5gkgk5oJyG9yUrXopGrRSdWiT5YB+UlAJjXfpGYCcqPmBsikZlLzTWo2nVQtOqladFK1CP9I1ZKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0T842TldXppCTAAAAABJRU5ErkJggg==",
        "isActive": 1
    }
}
```
