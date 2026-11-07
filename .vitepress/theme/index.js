import DefaultTheme from 'vitepress/theme'
import ApiPlayground from './components/ApiPlayground.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ApiPlayground', ApiPlayground)
  }
}
