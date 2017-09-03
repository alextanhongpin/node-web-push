const webpush = require('web-push')

const genvapidKeys = webpush.generateVAPIDKeys()
console.log(genvapidKeys)

// webpush.setGCMAPIKey()

const vapidKeys = {
  publicKey: 'YOUR_PUBLIC_KEYS',
  privateKey: 'YOUR_PRIVATE_KEY'
}

webpush.setVapidDetails('mailto:yourmail@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey)

const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/e-VZbbMT4yQ:APA91bGlaFfISUkl3PbkXSShSwnBAQn7w9mmIzcpZxz_JGqCQDEkoXuUGEK7CBH5BtutgyDUBVK_7PDq_dY5jQ6owVIhAoHm6mQCIQTMaKC6VysajgYBDlmNa9c-9wRLVz4ZwA0Chjpd',
  expirationTime: null,
  keys: {
    p256dh: 'BAYlZPdn7_zUp66yW5DlFhBZ8q7WN2K3EpoHsfc0M164NNKD1SVmB12cgrMhDSxLWjptyVSDgGqsMekHIuEZO88=',
    auth: 'Qm_AVp3yXwXdbBiUJ7UtJQ=='
  }
}
const payload = {
  title: 'title',
  body: 'body',
  icon: 'icon',
  badge: 'badge'
}
webpush.sendNotification(subscription, JSON.stringify(payload)).then((ok) => {
  console.log(ok)
}).catch((err) => {
  console.log('error sending notification', err)
})
