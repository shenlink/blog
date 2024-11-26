import chokidar from 'chokidar';
import { ViteDevServer } from 'vite';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os'
import { apiUrl } from './config'
import matter from 'gray-matter';

// 修改文件的frontmatter的title
function updateTitle(filePath: string, fileContent: string): void {
    const { data, content } = matter(fileContent);
    if (!data.title) {
        return;
    }
    const newTitle = path.basename(filePath, path.extname(filePath));
    if (newTitle === data.title) {
        return;
    }
    data.title = newTitle;
    const newContent = matter.stringify(content, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
}

// 文件监听
function fileWatcher(directoryToWatch: string) {
    return {
        name: 'file-watcher',
        configureServer(server: ViteDevServer) {
            const watcher = chokidar.watch(directoryToWatch, {
                ignoreInitial: true,
                persistent: true,
                // 忽略以 . 开头的文件
                ignored: /(^|[\/\\])\../,
            });
            // 当文件被添加时触发
            watcher.on('add', async (filePath: string) => {
                if (path.extname(filePath) !== '.md') {
                    return;
                }
                if (null === apiUrl) {
                    return;
                }
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                // 文件有内容，是修改文件名称
                if (fileContent.trim().length > 0) {
                    updateTitle(filePath, fileContent);
                    return;
                }
                try {
                    const response = await axios.get(apiUrl);
                    const { url } = response.data;
                    const title = path.basename(filePath, path.extname(filePath));
                    const frontmatter = `---${os.EOL}outline: deep${os.EOL}title: ${title}${os.EOL}url: ${url}${os.EOL}---${os.EOL}`;
                    fs.writeFileSync(filePath, frontmatter, 'utf-8');
                } catch (error) {
                    console.error(`获取 URL 或写入文件时出错: ${error.message}`);
                }
            });
            // 当文件被修改时触发
            watcher.on('change', async (filePath: string) => {
                if (path.extname(filePath) !== '.md') {
                    return;
                }
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    updateTitle(filePath, fileContent);
                } catch (error) {
                    console.error(`更新文件时出错: ${error.message}`);
                }
            });
            server.httpServer?.on('close', () => {
                watcher.close();
            });
        },
    };
}

export { fileWatcher };