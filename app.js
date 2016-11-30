'use strict'

require('es6-promise').polyfill()
const fetch = require('node-fetch')
const tumblr = require('tumblr.js')
const client = tumblr.createClient({
  returnPromises: true
})
const cronJob = require('cron').CronJob
const fs = require('fs')

const SUZURI_TOKEN = 'TOKEN'
const SUZURI_API_BASE_URL = 'https://suzuri.jp/api/v1'
const SUZURI_AUTH_HEADER = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUZURI_TOKEN}`
}
const ACCOUNT = 'reblogadventcalender7'
const itemVariants = {"1": [71, 99, 431, 89, 103, 389, 86, 72, 5, 49, 371, 1, 7, 8, 11, 2, 3, 4, 6, 9, 10, 12, 16, 17, 18, 19, 20, 21, 27, 28, 31, 22, 23,24, 25, 26, 29, 30, 32, 33, 36, 37, 39, 40, 41, 47, 51, 42, 43, 44, 45, 46, 50, 52, 53, 54, 56, 57, 59, 60, 61, 67, 68, 62, 63, 64, 69, 70, 65, 66, 48, 381, 14, 74, 38, 58, 34, 77, 79, 80, 90, 94, 88, 93, 95, 96, 98, 100, 101, 104, 117, 127, 317, 321, 124, 78, 73, 87, 102, 91, 92, 107, 84, 85, 97, 106, 105, 156, 449, 164, 167, 441, 355, 407, 409, 410, 411, 412, 413, 417, 419, 420, 421, 422, 423, 424, 425, 427, 428, 152, 166, 429, 430, 435, 437, 438, 439, 440, 442, 443, 445, 446, 447, 448, 453, 456, 165, 162, 159, 154, 163, 160, 153, 415, 433, 335, 386, 405, 404, 343, 353, 457, 458, 460, 451, 459, 455, 13, 350, 76, 368, 339, 357, 323, 393, 320, 338, 356, 392, 351, 369, 387, 347, 365, 383, 401, 359, 395, 348, 366, 384, 402, 399, 329, 330, 327, 332, 333, 377, 374, 341, 375, 345, 340, 358, 376, 394, 349, 367, 385, 403, 352, 370, 388, 406, 337, 373, 361, 379, 134, 391, 331, 334, 151, 118, 325, 363, 158, 319, 135, 144, 322, 397, 161, 132, 149, 131, 148, 128, 145, 125, 142, 120, 137, 129, 146, 126, 143, 119, 136, 122, 139, 141, 130, 147, 133, 150],
                      "8": [602, 461, 462, 463],
                      "5": [174, 228, 175, 203, 210, 188, 242, 185, 237, 194, 200, 251, 215, 275, 218, 222, 227, 230, 183, 198, 176, 209, 238, 239, 240, 244, 245, 246, 252, 253, 254, 255, 256, 257, 259, 264, 266, 267, 268, 269, 270, 271, 272, 274, 276, 233, 265, 173, 273, 190, 177, 250, 192, 234, 261, 207, 195, 205, 220, 191, 189, 204, 219, 213, 263, 249, 260, 241, 211, 236, 248, 221, 206, 235, 197, 258, 225, 243, 182,184, 186, 196, 193, 199, 201, 208, 212, 214, 216, 223, 178, 224, 231, 226, 229, 179, 180, 181],
                      "9": [465, 467, 468, 472, 473, 474, 475, 476, 477, 478, 484, 485, 490, 492, 494, 495, 501, 502, 507, 509, 511, 512, 517, 526, 528, 529, 536, 537, 538, 540, 543, 525, 544, 497, 535, 539, 483, 545, 546, 555, 556, 561, 567, 572, 573, 576, 577, 578, 579, 580, 503, 565, 466, 471, 488, 568, 510, 500, 487, 534, 469, 481, 527, 524, 505, 498, 542, 493, 518, 571, 491, 563, 522, 489, 519, 486, 520, 532, 521,560, 470, 514, 531, 548, 582, 482, 480, 499, 516, 541, 554, 585, 591, 593, 595, 597, 552, 551, 562, 589, 575, 566, 557, 574, 559, 584, 587, 594, 549, 586, 596, 588, 583, 592, 558, 553, 590, 599, 570, 569, 504, 523, 508, 550, 533, 600, 506, 515],
                      "2": [81],
                      "3": [82],
                      "10": [601],
                      "4": [171, 172, 83],
                      "6": [286, 287, 289, 288, 278, 464, 293, 295, 296, 297, 298, 300, 301, 302, 303, 299, 279, 281, 282, 283, 284, 285],
                      "7": [308, 307, 314, 309, 311, 316, 310, 313, 312, 315],
                      "12": [607],
                      "11": [606],
                      "13": [610]
                     }
let lastPostId
let lastOmoide
function poll() {
  new Promise((resolve, reject) => {
    return fs.readFile('./lastPostId', function (err, text) {
      if (err) {
        lastPostId = 0
      } else {
        lastPostId = parseInt(text)
      }
      return resolve()
    })
  }).then(() => {
    return fetch(`${SUZURI_API_BASE_URL}/choices?userName=${ACCOUNT}`, {
      headers: SUZURI_AUTH_HEADER
    })
  }).then(resp => resp.json())
  .then(json => {
    if (json.choices && json.choices.length) {
      lastOmoide = json.choices[0]
    }
    return
  }).then(() => {
    return client.blogPosts(ACCOUNT, {api_key: 'KEY'})
  }).then(resp => {
      const promises = []
      const posts = resp.posts.sort((a, b) => {
        if (a.id < b.id) return -1
        if (a.id > b.id) return 1
        return 0
      })
      console.log(lastPostId + '以降のpostを同期します')
      for (let post of posts) {
        if (lastPostId >= post.id) {
          continue
        }
        lastPostId = post.id
      let lastPostDate = (new Date(post.timestamp * 1000)).toDateString()
        let res
        if (post.type == 'photo') {
          let itemId = Math.floor(Math.random() * Object.keys(itemVariants).length) + 1
          let resizeMode = (itemId == 8 ? "cover" : "contain")
          let targetVariants = itemVariants[itemId]
          let itemVariantId = targetVariants[Math.floor(Math.random() * targetVariants.length)]
          let title = post.summary ? post.summary : (post.slug ? post.slug : post.post_url)
        console.log(post.id + 'の画像を同期します')
          res = fetch('https://suzuri.jp/api/v1/materials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + SUZURI_TOKEN
            },
            body: JSON.stringify({
              texture: "http://copyright-protector.herokuapp.com/protected.png?mozaic=true&tile=true&url=" + encodeURIComponent(post.photos[0].original_size.url),
              title: title,
              description: post.post_url,
              products: [{
                itemId: itemId,
                resizeMode: resizeMode,
                exemplaryItemVariantId: itemVariantId,
                published: true
              }]
            })
          })
        } else if (post.type == 'quote') {
          console.log(post.id + 'の文字を同期します')
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
      res.then(resp =>  resp.json())
      .then(productResp => {
        let choicePromise
        if (!lastOmoide || lastPostDate != lastOmoide.title) {
          choicePromise = fetch(`${SUZURI_API_BASE_URL}/choices`, {
            method: 'POST',
            headers: SUZURI_AUTH_HEADER,
            body: JSON.stringify({
              title: lastPostDate
            })
          }).then(res => res.json())
        } else {
          choicePromise = Promise.resolve(lastOmoide)
        }
        return choicePromise.then(omoideResp => {
          lastOmoide = omoideResp.choice || omoideResp
          return fetch(`${SUZURI_API_BASE_URL}/choices/${lastOmoide.id}`, {
            method: 'POST',
            headers: SUZURI_AUTH_HEADER,
            body: JSON.stringify({
              productId: productResp.products[0].id,
              itemVariantId: productResp.products[0].sampleItemVariant.id
            })
          })
        })
      })
        promises.push(res)
      }
      return Promise.all(promises)
    }).then(values => {
      console.log(new Date(Date.now()).toISOString() + ':' + values.length + '個作りました')
    fs.writeFile("./lastPostId", `${lastPostId}`)
    })
}

var job = new cronJob({
  cronTime: '0, 30 * * * * *',
  onTick: poll,
  start: true
})

job.start()
