const IntervalCache = require('./lib/interval-cache')

module.exports = async function () {
  console.log('enter dapp init')

  app.registerContract(1000, 'cctime.postArticle')
  app.registerContract(1001, 'cctime.postComment')
  app.registerContract(1002, 'cctime.voteArticle')
  app.registerContract(1003, 'cctime.likeComment')
  app.registerContract(1004, 'cctime.report')
  
  app.setDefaultFee('10000000', 'CCTime.XCT')

  app.custom.cache = new IntervalCache(10 * 1000)

  app.events.on('newBlock', (block) => {
    console.log('new block received', block.height)
  })
}