
// const publicKey = 'BG5ViyTtOO3mdDehzQSKLtPKm0BqZqE7JACqbd6ZbiHXculBfpVbrDIAMr8VCFhfi_rbg5HjnkcmQdHY-9HWP1M'

const pathToServiceWorker = 'scripts/sw.js'
let registrator

const ButtonView = {
  button: document.getElementById('push'),
  enable () {
    this.button.setAttribute('disabled', false)
  },
  disable () {
    this.button.setAttribute('disabled', true)
  },
  setText (text) {
    this.button.innerHTML = text
  },
  bindEvents () {
    this.button.addEventListener('click', () => {
      registrator.pushManager.getSubscription().then((subscription) => {
        return WebpushService.unsubscribe({
          endpoint: subscription.endpoint
        }).then(subscription.unsubscribe())
      }).then(() => {
        console.log('successfully unsubscribe')
      }).catch(console.error)
    }, false)
  }
}

const FormView = {
  button: document.getElementById('submit'),
  title: document.getElementById('title'),
  body: document.getElementById('body'),
  local: document.getElementById('local'),
  bindEvents () {
    this.button.addEventListener('click', (evt) => {
      WebpushService.send({
        title: this.title.value,
        body: this.body.value
      }).then((data) => {
        console.log(data)
      })
    }, false)

    this.local.addEventListener('click', (evt) => {
      if (registrator) {
        showNotification(registrator)
        console.log('triggering locally', registrator)
      }
    }, false)
  }
}

const WebpushService = {
  async publicKey () {
    const response = await window.fetch('/v1/webpush/.keys')
    return response.text()
  },
  async register (body) {
    const response = await window.fetch('/v1/webpush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    return response.json()
  },
  async send (body) {
    const response = await window.fetch('/v1/webpush/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    return response.json()
  },
  async validate (body) {
    const response = await window.fetch('/v1/webpush/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    return response.json()
  },
  async unsubscribe (body) {
    const response = await window.fetch('/v1/webpush', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    return response.json()
  }
}

window.addEventListener('load', async function () {
  if (!isServiceWorkerEnabled()) {
    console.log('Push messaging is not supported')
    return
  }
  console.log('Push messaging supported')
  FormView.bindEvents()
  ButtonView.bindEvents()

  registrator = await navigator.serviceWorker.register(pathToServiceWorker)
  let subscription = await registrator.pushManager.getSubscription()

  if (!subscription) {
    subscription = await subscribeUser(registrator)
  }

  const response = await WebpushService.validate({ endpoint: subscription.endpoint })
  if (response.is_subscribed) {
    console.log('Already subscribed to the push notification server')
    ButtonView.setText('Disable push notification')
    return
  }
  // Automatic registration
  const subscribeResponse = await WebpushService.register(subscription)
  console.log('subscribeResponse', subscribeResponse)

    // Validate against the server
  console.log(subscription)
})

function showNotification (registrator) {
  const options = {
    'body': 'Did you make a $1,000,000 purchase at Dr. Evil...',
    'icon': 'images/ccard.png',
    'vibrate': [200, 100, 200, 100, 200, 100, 400],
    'tag': 'request',
    'actions': [
    { 'action': 'yes', 'title': 'Yes', 'icon': 'static/icons/favicon-16x16.png' },
    { 'action': 'no', 'title': 'No', 'icon': 'static/icons/favicon-16x16.png' }
    ]
  }
  registrator.showNotification('purchase', options)
}
function isServiceWorkerEnabled () {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

function urlB64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function subscribeUser (registrator) {
  const publicKey = await WebpushService.publicKey()
  const subscription = await registrator.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(publicKey)
  })
  return subscription
}

async function unsubscribeUser (registrator) {
  const subscription = await registrator.pushManager.getSubscription()

  if (subscription) {
    return subscription.unsubscribe()
  }
}
