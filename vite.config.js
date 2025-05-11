import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
  AutoImport({
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  }),
  ],
  //配置别名@
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    // 指定输出目录，构建后的文件将放在此目录下
    outDir: 'resources',
    // 指定静态资源存放目录，图片、字体等会放在此目录
    assetsDir: 'static',
    // 小于此阈值的图片等资源会被内联为base64格式，单位为字节
    assetsInlineLimit: 4096,
    // 是否生成源代码映射文件，设为false可减小生产包体积
    sourcemap: false,
    // 自定义Rollup打包配置
    rollupOptions: {
      output: {
        // 手动控制包分割策略
        manualChunks(id) {
          // 将所有node_modules中的依赖打包到vendor.js
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }

})
