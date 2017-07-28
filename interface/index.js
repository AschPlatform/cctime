let bignum = require('bignumber')

async function getArticlesByTime(options) {
  let count = await app.model.Article.count()
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
  return article.votes / Math.pow(elapsedHours + 2, 1.8)
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
  return res
})

app.route.get('/articles/:id', async (req) => {
  let id = req.params.id
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
  return { article: article }
})

app.route.get('/articles/:id/comments', async (req) => {
  let id = req.params.id
  let count = await app.model.Comment.count({ aid: id })
  let comments = await app.model.Comment.findAll({
    condition: [
      { aid: id },
      { reports: { $lt: 3 } }
    ],
    limit: req.query.limit || 50,
    offset: req.query.offset || 0
  })
  let addresses = comments.map((c) => c.authorId)
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
  }
  return { comments: comments, count: count }
})