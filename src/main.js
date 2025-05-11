import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import router from './router/index.js'//导入路由
import { createPinia } from 'pinia';//导入pinia
import piniaPluginPersist from 'pinia-plugin-persist'
import echarts from './utils/echarts-register.js';//导入echarts配置



const app = createApp(App)

app.config.globalProperties.$echarts = echarts//将echarts挂载到app实例上，方便全局使用

const pinia = createPinia()
pinia.use(piniaPluginPersist)

app.use(router)
app.use(pinia)

app.mount('#app')