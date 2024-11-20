import { defineConfig } from 'vitepress'
import { generateSidebar } from './config/sidebar/generate_sidebar'
import { generateNavbar } from './config/navbar/generate_navbar'
import { head } from './config/head/headConfig'
import { socialLinks } from './config/socialLinks/socialLinkConfig'
import { footer } from './config/footer/footerConfig'
import { lastUpdated } from './config/lastUpdated/lastUpdatedConfig'
import { search } from './config/search/searchConfig'
import path from 'path'

const articlesDir = path.resolve(__dirname, '../', 'articles')
export default defineConfig({
    title: "代码的诗",
    description: "分享编程知识",
    head: head,
    themeConfig: {
        nav: generateNavbar(articlesDir),
        sidebar: generateSidebar(articlesDir),
        socialLinks: socialLinks,
        footer: footer,
        lastUpdated: lastUpdated,
        search: search,
    }
})
