import chokidar from 'chokidar';
import { ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os'
import crypto from 'crypto';

// 修改文件的frontmatter的title
function updateTitle(filePath: string, fileContent: string): void {
    // 提取 frontmatter 和 content
    const frontmatterMatch = fileContent.trim().match(/^---[\r\n]([\s\S]*?)[\r\n]---/);
    if (!frontmatterMatch) {
        return; // 没有 frontmatter，直接返回
    }

    const frontmatterText = frontmatterMatch[1]; // 获取 frontmatter 内容
    const content = fileContent.substring(frontmatterMatch[0].length).trimStart(); // 剩余内容

    // 解析 frontmatter 字段为对象
    const data: Record<string, any> = {};
    frontmatterText.split(/[\r\n]+/).forEach(line => {
        const [key, ...rest] = line.split(':').map(s => s.trim());
        if (key && rest.length > 0) {
            data[key] = rest.join(':').trim();
        }
    });

    if (!data.title) {
        return;
    }
    const newTitle = path.basename(filePath, path.extname(filePath));
    if (newTitle === data.title) {
        return;
    }
    data.title = newTitle;
    data.updatetime = getDatetimeString();
    const newContent = `---${os.EOL}outline: ${data.outline || ''}${os.EOL}title: ${data.title}${os.EOL}url: ${data.url || ''}${os.EOL}createtime: ${data.createtime || ''}${os.EOL}updatetime: ${data.updatetime}${os.EOL}---${os.EOL}${os.EOL}` + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
}

// 获取当前时间，格式为 YYYY-MM-DD HH:mm:ss
function getDatetimeString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                // 文件有内容，是修改文件名称
                if (fileContent.trim().length > 0) {
                    updateTitle(filePath, fileContent);
                    return;
                }
                try {
                    const url = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
                    const title = path.basename(filePath, path.extname(filePath));
                    const datetime = getDatetimeString();
                    const frontmatter = `---${os.EOL}outline: deep${os.EOL}title: ${title}${os.EOL}url: ${url}${os.EOL}createtime: ${datetime}${os.EOL}updatetime: ${datetime}${os.EOL}---${os.EOL}`;
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