import { defineConfig } from 'vitepress'
import { generateSidebar } from './plugins/sidebar/generate_sidebar'
import { generateNavbar } from './plugins/navbar/generate_navbar'
import { head } from './plugins/head/config'
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
        footer: {
            message: '<a href="https://beian.miit.gov.cn/" style="text-decoration: none" target="_blank">粤ICP备2024331772号</a>',
            copyright: 'Copyright © 2024-present <a href="https://github.com/shenlink">shenlink</a>'
        },
        lastUpdated: {
            text: '最后更新',
            formatOptions: {
                dateStyle: 'medium',
                timeStyle: 'medium'
            }
        }
    }
})
