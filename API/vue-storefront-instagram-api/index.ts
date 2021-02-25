import { Router } from 'express'
import { apiStatus } from '../../../lib/util'
import cache from '../../../lib/cache-instance'
import { Magento2Client } from 'magento2-rest-client'
import { sha3_224 } from 'js-sha3'

export function extendClient (client: Magento2Client) {
  client.addMethods('instagram', restClient => ({
    getPosts () {
      return restClient.get('/magebit-instagramfeed/media')
    }
  }))
}

async function saveToCache (req: any, result: any) {
  if (!cache) return

  try {
    await (cache as any).set(
      'api:' + sha3_224(`${JSON.stringify(req.body)}${req.url}`),
      result,
      ['instagram'],
      1800
    )
  } catch (e) {
    console.error('Failed to cache instagram:', e)
  }
}

async function loadFromCache (req: any) {
  if (!cache) return false

  const data = await (cache as any).get(
    'api:' + sha3_224(`${JSON.stringify(req.body)}${req.url}`)
  )

  return data
}

module.exports = ({ config }) => {
  const api = Router()
  const client = Magento2Client(config.magento2.api)
  extendClient(client)

  api.get('/feed', async (req, res) => {
    const { width, height } = req.query;
    const cached = await loadFromCache(req)

    if (cached) {
      res.setHeader('X-VS-Cache', 'Hit')
      return apiStatus(res, cached)
    }

    try {
      const posts = await client.instagram.getPosts()

      const items = posts.map(post => {
        post.media_url_thumb = `${config.server.url || ''}/img/?url=${encodeURIComponent(post.thumbnail_url || post.media_url)}&width=${width || 200}&height=${height || 200}&action=fit`;
        return post
      })

      if (config.server.useOutputCache) {
        saveToCache(req, items)
      }

      return apiStatus(res, items)
    } catch (e) {
      apiStatus(res, 'Failed to fetch posts: ' + e.message, 500)
    }
  })

  return api
}
