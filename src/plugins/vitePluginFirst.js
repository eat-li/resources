export default function vitePluginFirst() {
  return {
    name: 'vite-plugin-first',
    enforce: 'pre',
    // 在构建阶段的钩子
    buildStart() {
      console.log('构建开始...');
    },
    buildEnd() {
      console.log('构建结束...');
    },
    // 转换代码的钩子
    transform(code, id) {
      // 简单示例：在JS文件中添加构建时间注释
      if (id.endsWith('.js') && !id.includes('node_modules')) {
        const buildTime = new Date().toLocaleString();
        return `/* 构建时间: ${buildTime} */\n${code}`;
      }
      return code;
    }
  };
}