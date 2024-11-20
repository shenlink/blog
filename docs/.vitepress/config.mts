import { defineConfig } from 'vitepress'
import { generateSidebar } from './config/sidebar/generate_sidebar'
import { generateNavbar } from './config/navbar/generate_navbar'
import { head } from './config/head/headConfig'
import { footer } from './config/footer/footerConfig'
import path from 'path'

const articlesDir = path.resolve(__dirname, '../', 'articles')
export default defineConfig({
    title: "代码的诗",
    description: "分享编程知识",
    head: head,
    themeConfig: {
        nav: generateNavbar(articlesDir),
        sidebar: generateSidebar(articlesDir),
        socialLinks: [
            { icon: 'github', link: 'https://github.com/shenlink' }
        ],
        footer: footer,
        lastUpdated: {
            text: '最后更新',
            formatOptions: {
                dateStyle: 'medium',
                timeStyle: 'medium'
            }
        },
        search: {
            provider: 'local'
        },
    }
})
