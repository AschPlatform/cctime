const aschJS = require('asch-js')
const axios = require('axios')

let currency = 'CCTime.XCT'
let amount = '100000000000'
let password = 'sentence weasel match weather apple onion release keen lens deal fruit matrix'
let secondPassword = null

let transaction = aschJS.uia.createIssue(currency, amount, password, secondPassword)

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
