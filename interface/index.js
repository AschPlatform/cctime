let bignum = require('bignumber')

async function getArticlesByTime(options) {
  let count = await app.model.Article.count()
  let articles = await app.model.Article.findAll({
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
    limit: 300,
    sort: { timestamp: -1 }
  })
  let popularArticles = await app.mode.Article.findAll({
    limit: 300,
    sort: { votes: -1 }
  })
  let allArticles = latestArticles.concat(popularArticles)
  allArticles.forEach((a) => {
    a.score = calcScore(a)
  })
  allArticles.sort((l, r) => {
    return r.score - l.score
  })
  return { articles: articles.slice(0, options.limit) }
}

app.route.get('/articles',  async (req) => {
  let query = req.query
  let articles = []
  if (query.sortBy === 'timestamp') {
    return getArticlesByTime(query)
  } else if (query.sortBy === 'score') {
    return getArticlesByScore(query)
  } else {
    throw new Error('Sort field not supported')
  }
})

app.route.get('/articles/:id',  async (req) => {
  let id = req.params.id
  let article = await app.model.Article.findOne({
    condition: { id: id }
  })
  return { article: article }
})

app.route.get('/articles/:id/comments', async (req) => {
  let id = req.params.id
  let comments = await app.model.Comments.findAll({
    condition: { aid: id }
  })
  return { comments: comments }
})