import { defineConfig } from 'vitepress'
import { head } from './config/head/headConfig'
import { themeConfig } from './config/theme/themeConfig'
import { viteConfig } from './config/vite/viteConfig'

export default defineConfig({
    title: "代码的诗",
    description: "分享编程知识",
    head: head,
    themeConfig: themeConfig,
    vite: viteConfig,
})
