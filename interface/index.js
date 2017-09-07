let bignum = require('bignumber')

async function getArticlesByTime(options) {
  let count = await app.model.Article.count({ reports: { $lt: 3 } })
  let articles = await app.model.Article.findAll({
    condition: {
      reports: { $lt: 3 }
    },
    limit: options.limit || 50,
    offset: options.offset || 0,
    sort: { timestamp: -1 }
  })
  return { count: count, articles: articles }
}

function calcScore(article) {
  let elapsedHours = (Date.now() - app.getRealTime(article.timestamp)) / 3600000
  return Math.sqrt(article.votes + 1) / Math.pow(elapsedHours + 2, 1.8)
}

async function getArticlesByScore(options) {
  let latestArticles = await app.model.Article.findAll({
    condition: {
      reports: { $lt: 3 }
    },
    limit: 300,
    sort: { timestamp: -1 }
  })
  let popularArticles = await app.model.Article.findAll({
    limit: 300,
    sort: { votes: -1 }
  })
  let allArticles = []
  let uniqueIds = new Set
  latestArticles.forEach((a) => {
    if (!uniqueIds.has(a.id)) {
      uniqueIds.add(a.id)
      allArticles.push(a)
    }
  })
  popularArticles.forEach((a) => {
    if (!uniqueIds.has(a.id)) {
      uniqueIds.add(a.id)
      popularArticles.push(a)
    }
  })
  allArticles.forEach((a) => {
    a.score = calcScore(a)
  })
  allArticles.sort((l, r) => {
    return r.score - l.score
  })
  return { articles: allArticles.slice(0, options.limit || 50) }
}

app.route.get('/articles', async (req) => {
  let query = req.query
  if (!query.sortBy) {
    query.sortBy = 'score'
  }
  let key = ['articles', query.sortBy, query.limit, query.offset].join('_')
  if (app.custom.cache.has(key)) {
    return app.custom.cache.get(key)
  }
  let res = null
  if (query.sortBy === 'timestamp') {
    res = await getArticlesByTime(query)
  } else if (query.sortBy === 'score') {
    res = await getArticlesByScore(query)
  } else {
    throw new Error('Sort field not supported')
  }
  let addresses = res.articles.map((a) => a.authorId)
  let accounts = await app.model.Account.findAll({
    condition: {
      address: { $in: addresses }
    },
    fields: ['str1', 'address']
  })
  let accountMap = new Map
  for (let account of accounts) {
    accountMap.set(account.address, account)
  }
  for (let article of res.articles) {
    let account = accountMap.get(article.authorId)
    if (account) {
      article.nickname = account.str1
    }
  }
  app.custom.cache.set(key, res)
  return res
})

app.route.get('/articles/:id', async (req) => {
  let id = req.params.id
  let key = 'article_' + id
  if (app.custom.cache.has(key)) {
    return app.custom.cache.get(key)
  }
  let article = await app.model.Article.findOne({
    condition: { id: id }
  })
  if (!article) throw new Error('Article not found')
  if (article.reports >= 3) throw new Error('Article not allowed')
  let account = await app.model.Account.findOne({
    condition: { address: article.authorId }
  })
  if (account) {
    article.nickname = account.str1
  }
  let result = { article: article }
  app.custom.cache.set(key, result)
  return result
})

app.route.get('/articles/:id/comments', async (req) => {
  let id = req.params.id
  let sort = {
    timestamp: 1
  }
  if (req.query && req.query.sortBy) {
    let sortInfo = req.query.sortBy.split(':')
    if (sortInfo.length !== 2 ||
      ['timestamp'].indexOf(sortInfo[0]) === -1 ||
      ['asc', 'desc'].indexOf(sortInfo[1]) === -1) {
      throw new Error('Invalid sort params')
    }
    sort = {}
    sort[sortInfo[0]] = sortInfo[1] === 'asc' ? 1 : -1
  }
  let key = ['comments', id, req.query.sortBy, req.query.limit, req.query.offset].join('_')
  if (app.custom.cache.has(key)) {
    return app.custom.cache.get(key)
  }
  let count = await app.model.Comment.count({ aid: id, reports: { $lt: 3 } })
  let comments = await app.model.Comment.findAll({
    condition: [
      { aid: id },
      { reports: { $lt: 3 } },
    ],
    limit: req.query.limit || 50,
    offset: req.query.offset || 0,
    sort: sort
  })
  let replyIds = []
  for (let c of comments) {
    if (c.pid) replyIds.push(c.pid)
  }
  let replyComments = await app.model.Comment.findAll({
    condition: {
      id: { $in: replyIds }
    },
    fields: ['authorId', 'id']
  })
  let replyAuthorMap = new Map
  for (let rc of replyComments) {
    replyAuthorMap.set(rc.id, rc.authorId)
  }
  let addresses = comments.map((c) => c.authorId).concat(replyComments.map((rc) => rc.authorId))
  let accounts = await app.model.Account.findAll({
    condition: {
      address: { $in: addresses }
    },
    fields: ['str1', 'address']
  })
  let accountMap = new Map
  for (let account of accounts) {
    accountMap.set(account.address, account)
  }
  for (let c of comments) {
    let account = accountMap.get(c.authorId)
    if (account) {
      c.nickname = account.str1
    }
    let replyAuthorId = replyAuthorMap.get(c.pid)
    if (replyAuthorId) {
      c.replyAuthorId = replyAuthorId
      let replyAccount = accountMap.get(replyAuthorId)
      if (replyAccount) c.replyAuthorName = replyAccount.str1
    }
  }
  let result = { comments: comments, count: count }
  app.custom.cache.set(key, result)
  return result
})