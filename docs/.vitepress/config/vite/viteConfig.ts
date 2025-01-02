import { fileWatcher } from "../../plugins/file-watcher"
import { articlesDir } from '../extra/config'
import path from "path"

export const viteConfig = {
    plugins: [
        fileWatcher(articlesDir)
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../../../')
        }
    }
}