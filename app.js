'use strict'

require('es6-promise').polyfill()
const fetch = require('node-fetch')
const tumblr = require('tumblr.js')
const client = tumblr.createClient({
  returnPromises: true
})
const cronJob = require('cron').CronJob

const SUZURI_TOKEN = 'TOKEN'
let lastPostId = 153021195890

function poll() {
  client.blogPosts('dlwr', {api_key: 'KEY'})
    .then(resp => {
      const promises = []
      const posts = resp.posts.sort((a, b) => {
        if (a.id < b.id) return -1
        if (a.id > b.id) return 1
        return 0
      })
      for (let post of posts) {
        if (lastPostId >= post.id) {
          continue
        }
        lastPostId = post.id
        let res
        if (post.type == 'photo') {
          res = fetch('https://suzuri.jp/api/v1/materials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + SUZURI_TOKEN
            },
            body: JSON.stringify({
              texture: post.photos[0].original_size.url,
              title: post.post_url,
              description: post.post_url,
              products: [{
                itemId: 8,
                resizeMode: 'cover',
                exemplaryItemVariantId: 602,
                published: true
              }]
            })
          })
        } else if (post.type == 'quote') {
          res = fetch('https://suzuri.jp/api/v1/materials/text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + SUZURI_TOKEN
            },
            body: JSON.stringify({
              text: post.text,
              title: post.summary,
              description: post.post_url,
            })
          })
        }
        promises.push(res)
      }
      return Promise.all(promises)
    }).then(values => {
      console.log(values.length + '個作りました')
    })
}

var job = new cronJob({
  cronTime: '0, 30 * * * * *',
  onTick: poll,
  start: true
})

job.start()
