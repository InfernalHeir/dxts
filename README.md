# REST API DOCS

## Api url prefix http://13.126.63.235:3000

# Endpoints

## Registration

```
POST /registration
H Content-Type: application/json *

Request Body
uuid: string *
password: string *
parent_referal_id: initial@123654 *
withdrawalpassword: string *

response -
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
```

## Login

```
POST /login
H Content-Type: application/json *

Request Body
uuid: string *
password: string *

return Object

login with pharse
H Content-Type: application/json *

Request Body
resetphrase: string

returns Object
```

## Create Wallet

```
POST /walletcreate
H Content-Type: application/json *
H x-access-token: string *

Request Body
null

```
