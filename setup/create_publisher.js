const aschJS = require('asch-js')
const axios = require('axios')

let ownAddress = 'A5vTRUofsjRgzHwynw7fqrL3U6pGFUP5S7'

let publisherName = 'CCTime'
let publisherDescription = 'CCTime is a decentralized application based on the Asch application sdk, which can communicate with the Asch main chain. The CCTime application will not issue tokens internally. The tokens will be transferred from the main chain. We will register a publisher called CCTime on the Asch main chain, and then use this publisher to register an asset named XCT. The full name of this asset is CCTime.XCT. currency). XCT (time coin) issue limit of 10 billion. The team has set aside 5% tokens, 10% to partners, and the remaining 85% will all be airdropped to people in all circles of the currency circle, without financing, to restore the nature of ICO (Initial Crypto-Token Offering). The principle of distribution is to cover as many user groups as possible, but in the main circle of the currency circle and outside the currency circle.'

var password = 'sentence weasel match weather apple onion release keen lens deal fruit matrix'
var secondPassword  = ''


let transaction = aschJS.uia.createIssuer(publisherName, publisherDescription, password, secondPassword)


let url = 'http://localhost:4096/peer/transactions'
let data = {
  transaction: transaction
}
let headers = {
  headers: {
    magic: '594fe0f3',
    version: ''
  }
}

axios.post(url, data, headers)
  .then((response) => {
    console.log(JSON.stringify(response.data))
  })
  .catch((error) => {
    console.log(error.message)
  })