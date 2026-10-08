import DefaultTheme from 'vitepress/theme'
import ApiPlayground from './components/ApiPlayground.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ApiPlayground', ApiPlayground)
  }
}
