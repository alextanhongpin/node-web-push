const Koa = require('koa')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = require('./route/webpush')
const port = process.env.PORT || 3000

app
  .use(serve('public'))
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(port)
console.log(`listening to port *:${port}. press ctrl + c to cancel`)
