const aschJS = require('asch-js')
const axios = require('axios')

let name = 'CCTime.XCT'
let desc = 'CCTime is a decentralized application based on the Asch application SDK...'
let maximum = '1000000000000000000'
let precision = 8
let strategy = ''
let allowWriteoff = 0
let allowWhitelist = 0
let allowBlacklist = 0
var password = 'sentence weasel match weather apple onion release keen lens deal fruit matrix'

let transaction = aschJS.uia.createAsset(name, desc, maximum, precision, strategy,allowWriteoff, allowWhitelist, allowBlacklist, password)

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
