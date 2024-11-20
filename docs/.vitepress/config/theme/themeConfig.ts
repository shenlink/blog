import { generateSidebar } from '../sidebar/generate_sidebar'
import { generateNavbar } from '../navbar/generate_navbar'
import { socialLinks } from '../socialLinks/socialLinkConfig'
import { footer } from '../footer/footerConfig'
import { lastUpdated } from '../lastUpdated/lastUpdatedConfig'
import { search } from '../search/searchConfig'
import { docFooter } from '../docFooter/docFooterConfig'
import path from 'path'
import { DefaultTheme } from 'vitepress'

const articlesDir = path.resolve(__dirname, '../../../', 'articles')

export const themeConfig: DefaultTheme.Config = {
    nav: generateNavbar(articlesDir),
    sidebar: generateSidebar(articlesDir),
    socialLinks: socialLinks,
    footer: footer,
    lastUpdated: lastUpdated,
    search: search,
    docFooter: docFooter,
    outlineTitle: "本页目录",
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
}