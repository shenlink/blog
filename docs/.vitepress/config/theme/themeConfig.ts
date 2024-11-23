import { generateSidebar } from '../sidebar/generate_sidebar'
import { generateNavbar } from '../navbar/generate_navbar'
import { socialLinks } from '../socialLinks/socialLinkConfig'
import { footer } from '../footer/footerConfig'
import { lastUpdated } from '../lastUpdated/lastUpdatedConfig'
import { search } from '../search/searchConfig'
import { docFooter } from '../docFooter/docFooterConfig'
import { DefaultTheme } from 'vitepress'
import { articlesDir, outlineTitle, lightModeSwitchTitle, darkModeSwitchTitle } from '../extra/config'

export const themeConfig: DefaultTheme.Config = {
    nav: generateNavbar(articlesDir),
    sidebar: generateSidebar(articlesDir),
    socialLinks: socialLinks,
    footer: footer,
    lastUpdated: lastUpdated,
    search: search,
    docFooter: docFooter,
    outlineTitle: outlineTitle,
    lightModeSwitchTitle: lightModeSwitchTitle,
    darkModeSwitchTitle: darkModeSwitchTitle,
}