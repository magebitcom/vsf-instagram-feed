import { Module } from 'vuex'
import * as types from './mutation-types'
import fetch from 'isomorphic-fetch'
import config from 'config'
import RootState from 'core/types/RootState'
import InstagramFeedState from '../types/InstagramFeedState'

export const module: Module<InstagramFeedState, RootState> = {
  namespaced: true,
  state: {
    media: []
  },
  mutations: {
    [types.SET_INSTAGRAM_FEED] (state, payload) {
      state.media = payload
    }
  },
  actions: {
    get ({ getters, commit }, { width, height }) {
      if (!getters.hasItems) {
        fetch(`${config.instagram.endpoint}?width=${width}&height=${height}`)
          .then(res => {
            return res.json()
          })
          .then(res => {
            commit(types.SET_INSTAGRAM_FEED, res.result)
          })
      }
      return getters.media
    }
  },
  getters: {
    hasItems: state => state.media && state.media.length > 0,
    media: state => state.media
  }
}
