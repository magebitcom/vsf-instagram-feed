import { mapGetters } from 'vuex'

export default {
  name: 'InstagramFeed',
  computed: {
    ...mapGetters({
      feed: 'instagram-feed/media',
      hasItems: 'instagram-feed/hasItems',
      username: 'instagram-feed/username',
      bio: 'instagram-feed/bio'
    })
  }
}
