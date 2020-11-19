import { Router } from 'express'
import request from 'request'
import cache from '../../../lib/cache-instance';
import {sha3_224} from 'js-sha3';

// This might change in the future, but most libraries use it
const QUERY_ID = '17888483320059182'

function _cacheStorageHandler (config, result, hash, tags) {
  if (config.server.useOutputCache && cache) {
    cache.set(
      'api:' + hash,
      result,
      tags,
      1800 // Caching instagram request for 30 minutes
    ).catch((err) => {
      console.error(err)
    })
  }
}

module.exports = ({ config }) => {
  const api = Router();

  api.get('/feed', (req, res) => {
    const reqHash = sha3_224(`${JSON.stringify(req.body)}${req.url}`)
    const s = Date.now()

    const dynamicRequestHandler = () => {
      const {limit, width, height} = req.query;
      const {profile, id} = config.extensions.instagram;
      const url = `https://www.instagram.com/graphql/query/?query_id=${QUERY_ID}&variables={"id":${id},"first":${limit},"after":null}`

      request(
        {
          url,
          json: true
        },
        (error, response, body) => {
          let apiResult;
          const errorResponse = error || body.error;
          const errorInQuery = !width || !height

          if (errorResponse || errorInQuery) {
            apiResult = {
              code: 500,
              result: errorResponse || 'Please provide height and width for resize < &height=&width= >'
            }
          } else {
            let resultObj = {}

            Object.assign(resultObj, {
              'username': profile,
              'items': []
            })

            body.data.user.edge_owner_to_timeline_media.edges.forEach((item) => {
              const captionEdges = item.node.edge_media_to_caption.edges
              resultObj.items.push({
                'image': `${config.server.url || ''}/img/?url=${encodeURIComponent(item.node.thumbnail_src + '&mime=.jpg')}&width=${width}&height=${height}&action=fit`,
                'image_hq': item.node.display_url,
                'caption': captionEdges.length ? captionEdges[0].node.text : null,
                'permalink': `https://instagram.com/p/${item.node.shortcode}`,
                'like_count': item.node.edge_media_preview_like.count,
                'id': item.node.id
              })
            })

            apiResult = {code: 200, result: resultObj}
          }

          res.status(apiResult.code).json(apiResult)
        }
      )
    }

    if (config.server.useOutputCache && cache) {
      cache.get(
        'api:' + reqHash
      ).then(output => {
        if (output !== null) {
          res.setHeader('X-VS-Cache', 'Hit')
          res.status(output.code).json(output)
          console.log(`cache hit [${req.url}], cached request: ${Date.now() - s}ms`)
        } else {
          res.setHeader('X-VS-Cache', 'Miss')
          console.log(`cache miss [${req.url}], request: ${Date.now() - s}ms`)
          dynamicRequestHandler()
        }
      }).catch(err => console.error(err))
    } else {
      dynamicRequestHandler()
    }
  })

  return api
}
