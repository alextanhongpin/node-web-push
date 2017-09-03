/* eslint-disable */

const targetUrl = 'http://localhost:5000'
self.addEventListener('push', (event) => {
  const data = event.data.json()
  console.log('[push] data', data)

  const { title, body, icon, badge } = data
  const options = {
    body,
    icon,
    badge
  }
  const notificationPromise = self.registration.showNotification(title, options)
  event.waitUntil(notificationPromise)
})

self.addEventListener('notificationclick', (event) => {
  console.log('[notificationclick] tag', event.notification.tag)
  event.notification.close()

  const promiseChain = clients.matchAll({ type: 'window' })
    .then((clientList) => {
      console.log('clientList', clientList)
      for (let i = 0; i < clientList.length; i += 1) {
        const client = clientList[i]
        if (client.url == '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  event.waitUntil(promiseChain)
})
