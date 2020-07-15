import { Router } from 'express'
import request from 'request'

module.exports = ({ config }) => {
  const api = Router();

  api.get('/feed', (req, res) => {
    const { limit, width, height } = req.query;
    const { profile, id } = config.extensions.instagram;
    const url = `https://www.instagram.com/graphql/query/?query_id=17888483320059182&variables={"id":${id},"first":${limit},"after":null}`

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
          apiResult = { code: 500, result: errorResponse || 'Please provide height and width for resize < &height=&width= >' }
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

          apiResult = { code: 200, result: resultObj }
        }

        res.status(apiResult.code).json(apiResult)
      }
    )
  })

  return api
}
