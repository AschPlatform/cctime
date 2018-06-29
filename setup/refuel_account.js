
const aschJS = require('asch-js')
const axios = require('axios')

var targetAddress = "AHMCKebuL2nRYDgszf9J2KjVZzAw95WUyB"  
var amount = 5000 * 1e8

let secret = 'someone manual strong movie roof episode eight spatial brown soldier soup motor'

let transaction = aschJS.transaction.createTransaction(targetAddress, amount, undefined, secret, undefined)

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
