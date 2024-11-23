import { fileWatcher } from "../../plugins/file-watcher"
import { articlesDir } from '../extra/config'

export const viteConfig = {
    plugins: [
        fileWatcher(articlesDir)
    ],
}