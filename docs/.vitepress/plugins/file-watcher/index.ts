import chokidar from 'chokidar';
import { ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os'

// 修改文件的frontmatter
function updateFrontmatter(filePath: string, fileContent: string): void {
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
    const fileName = path.basename(filePath, path.extname(filePath));
    let newTitle = fileName.replace(/^\d+/, '').replace(/\./g, '');
    if (newTitle.includes('introduction')) {
        newTitle = getTitleFromDescriptionFile(filePath);
    }
    if (newTitle === data.title) {
        return;
    }
    let url: string = '';
    if (fileName.includes('introduction')) {
        url = 'introduction';
    } else {
        const urlMatch = fileName.match(/^\d+/);
        url = urlMatch ? urlMatch[0] : '';
    }
    if (url === '') {
        console.log('获取文件的 url 失败');
        return;
    }
    data.url = url;
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

// 新增函数：从 description.json 文件中提取 introduction 字段值
function getTitleFromDescriptionFile(filePath: string): string {
    const dirPath = path.dirname(filePath); // 获取文件所在目录
    const descriptionPath = path.join(dirPath, 'description.json');

    if (!fs.existsSync(descriptionPath)) {
        throw new Error(`description.json 文件不存在于目录 ${dirPath}`);
    }
    try {
        const descriptionContent = fs.readFileSync(descriptionPath, 'utf-8');
        const descriptionData = JSON.parse(descriptionContent);
        if (!descriptionData.introduction) {
            throw new Error(`description.json 文件中缺少 introduction 字段：${descriptionPath}`);
        }
        return descriptionData.introduction;
    } catch (error) {
        throw new Error(`解析 description.json 文件时出错：${error.message}`);
    }
}

// 扫描指定目录及其子目录的所有 .md 文件，提取最大序号
function scanAndFindMaxIndex(directory: string): number {
    let currentMax = 0;
    function walkDir(currentPath: string) {
        const files = fs.readdirSync(currentPath);

        for (const file of files) {
            const filePath = path.join(currentPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                walkDir(filePath); // 递归进入子目录
            } else if (path.extname(file) === '.md') {
                const match = file.match(/^(\d+)/);
                if (match) {
                    const index = parseInt(match[1], 10);
                    if (index > currentMax) {
                        currentMax = index;
                    }
                }
            }
        }
    }

    walkDir(directory);
    return currentMax + 1; // 下一个可用序号
}

function getNewNumberPrefix(directory: string): number {
    // 遍历目录下的所有 .md 文件，找到最大的前缀数字
    const files = fs.readdirSync(directory);
    let maxPrefix = 0;
    files.forEach(file => {
        const match = file.match(/^(\d+)\./);
        if (match) {
            const prefix = parseInt(match[1], 10);
            if (prefix > maxPrefix) {
                maxPrefix = prefix;
            }
        }
    });
    return maxPrefix + 1;
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
                const dir = path.dirname(filePath);
                const baseName = path.basename(filePath, '.md');
                const ext = path.extname(filePath);
                // 跳过已有数字前缀的文件
                if (!/^\d+\./.test(baseName) && baseName !== 'introduction') {
                    const newPrefix = getNewNumberPrefix(dir);
                    const newFileName = `${newPrefix.toString()}.${baseName}${ext}`;
                    const newFilePath = path.join(dir, newFileName);
                    // 防止重复重命名
                    if (!fs.existsSync(newFilePath)) {
                        fs.renameSync(filePath, newFilePath);
                    }

                    filePath = newFilePath;
                }
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                // 文件有内容，是修改文件名称
                if (fileContent.trim().length > 0) {
                    updateFrontmatter(filePath, fileContent);
                    return;
                }
                try {
                    // 获取文件名并提取数字部分作为 url
                    const fileName = path.basename(filePath, path.extname(filePath));
                    let url: string = '';
                    if (fileName === 'introduction') {
                        url = 'introduction';
                    } else {
                        const urlMatch = fileName.match(/^\d+/);
                        url = urlMatch ? urlMatch[0] : '';
                    }
                    if (url === '') {
                        console.log('获取文件的 url 失败');
                        return;
                    }
                    let title = fileName.replace(/^\d+/, '').replace(/\./g, '');
                    // 如果文件名包含 introduction.md，则从 description.json 中获取 title
                    if (fileName.includes('introduction')) {
                        title = getTitleFromDescriptionFile(filePath);
                    }
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
                    updateFrontmatter(filePath, fileContent);
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