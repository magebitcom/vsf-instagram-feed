import { module } from './store'
import { StorefrontModule } from '@vue-storefront/core/lib/modules'

export const KEY = 'instagram-feed'

export const InstagramFeed: StorefrontModule = function ({ store }) {
  store.registerModule(KEY, module)
}
