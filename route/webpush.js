const webpush = require('web-push')
const Router = require('koa-router')
const router = new Router()
const Joi = require('joi')
// Store it in-memory
let subscriptions = []

const vapidKeys = webpush.generateVAPIDKeys()
webpush.setVapidDetails(process.env.MAILTO, vapidKeys.publicKey, vapidKeys.privateKey)

const webpushSchema = Joi.object().keys({
  endpoint: Joi.string().uri().required(),
  expirationTime: Joi.string().allow(null),
  keys: Joi.object().keys({
    p256dh: Joi.string().required(),
    auth: Joi.string().required()
  })
})

router.get('/v1/webpush', async(ctx, next) => {
  ctx.body = {
    total: subscriptions.length
  }
})

router.get('/v1/webpush/.keys', async(ctx, next) => {
  ctx.body = vapidKeys.publicKey
})

function validate (payload) {
  return new Promise((resolve, reject) => {
    Joi.validate(payload, webpushSchema, (err, value) => {
      err ? reject(err) : resolve(value)
    })
  })
}

router.post('/v1/webpush', async (ctx, next) => {
  try {
    const result = await validate(ctx.request.body)
    subscriptions = subscriptions.concat([result])
    ctx.body = {
      message: 'successfully subscribed',
      applicationServerKey: vapidKeys.publicKey
    }
  } catch (err) {
    ctx.body = {
      error: 400,
      message: err.message
    }
  }
})

router.delete('/v1/webpush', async (ctx, next) => {
  subscriptions = subscriptions.filter((subscription) => {
    return subscription.endpoint !== ctx.request.body.endpoint
  })
  ctx.body = {
    message: 'successfully unsubscribed from notification server'
  }
})

router.post('/v1/webpush/validate', async (ctx, next) => {
  const { endpoint } = ctx.request.body
  const result = subscriptions.find((subscription) => subscription.endpoint === endpoint)
  ctx.body = {
    is_subscribed: !(result === undefined)
  }
})

router.post('/v1/webpush/send', async (ctx, next) => {
  const { body, title } = ctx.request.body
  const payload = {
    title,
    body,
    icon: 'icon',
    badge: 'badge'
  }
  const subscriptionsPromise = subscriptions.map((subscription) => {
    return webpush.sendNotification(subscription, JSON.stringify(payload))
  })
  try {
    await Promise.all(subscriptionsPromise)
    ctx.body = {
      message: `Sent push notification to ${subscriptions.length} subscriber(s)`
    }
  } catch (err) {
    ctx.body = {
      error: 400,
      message: err.message
    }
  }
})

module.exports = router
