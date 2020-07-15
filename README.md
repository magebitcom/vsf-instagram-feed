# Vue Storefront Instagram Feed extension
Standalone offline ready instagram feed extension for Vue Storefront. Works with default and capybara theme.

## Table of contents
* [Installation](#installation)
  * [Repository file structure](#repository-file-structure)
  * [Setting up VSF module](#setting-up-vsf-module)
  * [Setting up VSF-API module](#setting-up-vsf-api-module)
* [Usage and features](#installation)
  * [Config parameters](#config-parameters)
  * [Using feed data](#using-feed-data)
  * [Default theme example (with preview image)](#default-theme-example)
  * [Capybara theme example (with preview image)](#capybara-example)

### Installation

#### Repository file structure
- [vue storefront](https://bitbucket.org/magebit/instagram-feed/src/master/vue-storefront/) - vue-instagram-feed module
- [vue-storefront-api](https://bitbucket.org/magebit/instagram-feed/src/master/vue-storefront-api/) - vue-instagram-feed-api module

#### Setting up VSF module
- Copy content of `vue-storefront` directory to the project root folder
- Register module in `src/modules/client.ts`

```js
...
import { InstagramFeed } from './vue-storefront-instagram-feed'
...

export function registerClientModules () {
  ...
  registerModule(InstagramFeed)
}
```

- Add instagram endpoint to `config/local.json` file:

```json
"instagram": {
  "endpoint": "http://project.local:8080/api/ext/vue-storefront-instagram-api/feed"
}
```

- Add instagram image height and width params to `config/docker.json` and `config/production.json` file. These can be changed to fit your needs:

```json
"instagram": {
    "limit": 8,
    "thumbnails": {
      "width": 200,
      "height": 200
    }
  }
```

- To load instagram data, you need to dispatch `instagram-feed/get` action:
```js
this.$store.dispatch('instagram-feed/get', {
  limit: config.instagram.limit,
  width: config.instagram.thumbnails.width,
  height: config.instagram.thumbnails.height
})
```

To make sure instagram data is available during SSR, add tis dispatch to `beforeRouteEnter` and `asyncData`. For example, in Home.vue it would look something like this:

```js
  import config from 'config'

  beforeRouteEnter (to, from, next) {
    if (!isServer && !from.name) {
        ...
        await Promise.all([
          ...
          vm.$store.dispatch('instagram-feed/get', {
            limit: config.instagram.limit,
            width: config.instagram.thumbnails.width,
            height: config.instagram.thumbnails.height
          })
        ])
        ...
      })
    } else {
      next()
    }
  },
  async asyncData ({ store, route }) {
    ...
    await Promise.all([
      ...
      store.dispatch('instagram-feed/get', {
        limit: config.instagram.limit,
        width: config.instagram.thumbnails.width,
        height: config.instagram.thumbnails.height
      })
     ...
    ])
  },
```
    
#### Setting up VSF-API module
- Copy content of `vue-storefront-api` directory to the root of project directory
- Get instagram profile ID:
- [Here](https://www.instafollowers.co/find-instagram-user-id)
- Or Go to https://instagram.com/{INSTAGRAM_USERNAME}/ open developer tools and paste this in the console:
```js
window._sharedData.entry_data.ProfilePage[0].graphql.user.id
```
- Add "vue-storefront-instagram-api" to the list of `registeredExtensions` in your `development.json` and `production.json` config file.
- Add an `instagram` property to the `extensions` list with the following information:

```json
"extensions": {
    "instagram": {
      "profile": "CLIENT_INSTAGRAM_USERNAME",
      "id": "CLIENT_INSTAGRAM_PROFILE_ID"
    }
  }
```
- To return absolute image urls, also add `server.url` field to your api config:
```json
"server": {
  "url": "http://localhost:8080"
}
``` 

### Usage and features
Here are some examples on how to use instagram feed in your project.

#### Config parameters

- **instagram**
  - **width** (int) required - Thumbnail width
  - **height** (int) required - Thumbnail height
  - **limit** (int) required - Instagram image limit

These values will be used to construct a URL to the instagram feed VUE-API extension:

```
project.local:8080/api/ext/vue-storefront-instagram-api/feed?limit=5&width=370&height=370
```
This returns a JSON object with feed items

#### Using feed data
All feed data is available in the `instagram-feed` vuex store. You can manually retrieve the data with `mapGetters` or use the included mixin:

```js
import { mapGetters } from 'vuex'

...
{
  computed: {
    ...mapGetters({
      feed: 'instagram-feed/media',
      hasItems: 'instagram-feed/hasItems',
      username: 'instagram-feed/username',
      bio: 'instagram-feed/bio'
    })
  }
}
```

```js
import InstagramFeed from 'src/modules/vue-storefront-instagram-feed/mixins/InstagramFeed'

export default {
  mixins: [InstagramFeed]
}

```

### Default theme example
Here's a simple component you can use in the default theme

![Default theme](https://i.imgur.com/s8pBh5Q.png)

- **theme/components/theme/Instagram.vue**
```vue
<template>
  <div class="row center-xs">
    <div
      class="col-sm-3 pb15"
      v-for="media in feed"
      :key="media.id"
    >
      <div class="tile center-xs middle-xs">
        <a :href="media.pemalink">
          <img
            class="tile-image"
            v-lazy="media.image"
            :alt="media.caption"
          >
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import InstagramFeed from 'src/modules/vue-storefront-instagram-feed/mixins/InstagramFeed'

export default {
  name: 'InstagramFeed',
  mixins: [InstagramFeed]
}
</script>
```

- **pages/Home.vue**

```vue
<template>
  <!-- ... -->
  <div class="container">
    <h2 class="align-center">
      Instagram feed
    </h2>
    <instagram />
  </div>
  <!-- ... -->
</template>

<script>
import Instagram from 'theme/components/theme/Instagram'

export default {
  // ...
  components: {
    Instagram
  }
  // ...
}
</script>
```

### Capybara example
In Capybara you can use the built-in `a-images-grid.vue` atom and it will work just fine!

![Capybara](https://i.imgur.com/2H58yGu.png)

- **pages/Home.vue**

```vue
<template>
  <!-- ... -->
  <SfSection
    :title-heading="$t('Instagram feed')"
    subtitle-heading="@magebitcom"
    class="section"
  >
    <AImagesGrid :images="feed" />
  </SfSection>
  <!-- ... -->
</template>

<script>
export default {
  // ...
  computed: {
    ...mapGetters({
      feed: 'instagram-feed/media'
    })
  }
  // ...
}
</script>
```

## Authors

* **Lorens Milovanovs- Lācis** (lorens.milovanovs.lacis@magebit.com)
* **Kristofers Ozoliņš** (kristofers.ozolins@magebit.com)
