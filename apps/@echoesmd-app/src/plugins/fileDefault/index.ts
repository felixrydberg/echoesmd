import { Plugin } from '@echoesmd/plugin-types'
import Default from './default.vue'

const plugin: Plugin = {
  install(helpers) {
    helpers.addComponent('file-default', Default)
  },
  version: "0.0.1",
}

export default plugin
