import chokidar from 'chokidar';
import { ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// 存储文件修改时间（用于更新 updatetime 字段）
const fileModifyTimes: Record<string, string> = {};

/**
 * 更新或插入 Markdown 文件的 frontmatter 信息
 * @param filePath 文件路径
 * @param fileContent 文件内容
 */
function updateFrontmatter(filePath: string, fileContent: string): void {
    // 解析 frontmatter 和正文内容
    const { frontmatterText, content } = extractFrontmatter(fileContent) || {};
    if (!frontmatterText) return;

    // 将 frontmatter 转换为对象
    const data = parseFrontmatter(frontmatterText);

    // 如果没有 title 字段，则跳过
    if (!data.title) return;

    // 获取文件名并去除前缀数字及点号
    const fileName = path.basename(filePath, path.extname(filePath));
    let newTitle = fileName.replace(/^\d+\./, '');

    // 如果是 introduction 文件，则从 description.json 中获取标题
    if (newTitle.includes('introduction')) {
        newTitle = getTitleFromDescriptionFile(filePath);
    }

    // 构造 url 字段
    let url: string = '';
    if (fileName.includes('introduction')) {
        url = 'introduction';
    } else {
        const urlMatch = fileName.match(/^\d+/);
        url = urlMatch ? urlMatch[0] : '';
    }

    if (!url) {
        console.log('获取文件的 url 失败');
        return;
    }

    // 设置新的字段值
    data.url = url;
    data.title = newTitle;
    const updatetime = fileModifyTimes[filePath] || getDatetimeString();
    data.updatetime = updatetime;

    // 拼接新的 frontmatter 和正文内容
    const newContent = `---${os.EOL}outline: ${data.outline || ''}${os.EOL}title: ${data.title}${os.EOL}url: ${data.url || ''}${os.EOL}createtime: ${data.createtime || ''}${os.EOL}updatetime: ${data.updatetime}${os.EOL}---${os.EOL}${os.EOL}${content}`;

    // 写入新内容到原文件
    fs.writeFileSync(filePath, newContent, 'utf8');

    // 清除临时存储的修改时间
    delete fileModifyTimes[filePath];
}

/**
 * 提取 frontmatter 和正文内容
 * @param content 原始文件内容
 * @returns 包含 frontmatter 文本和正文内容的对象
 */
function extractFrontmatter(content: string) {
    const frontmatterMatch = content.trim().match(/^---[\r\n]([\s\S]*?)[\r\n]---/);
    if (!frontmatterMatch) return null;

    const frontmatterText = frontmatterMatch[1]; // frontmatter 内容
    const bodyContent = content.substring(frontmatterMatch[0].length).trimStart(); // 正文内容
    return { frontmatterText, content: bodyContent };
}

/**
 * 解析 frontmatter 文本为键值对象
 * @param frontmatterText frontmatter 文本内容
 * @returns 键值对象
 */
function parseFrontmatter(frontmatterText: string): Record<string, any> {
    const data: Record<string, any> = {};
    frontmatterText.split(/[\r\n]+/).forEach(line => {
        const [key, ...rest] = line.split(':').map(s => s.trim());
        if (key && rest.length > 0) {
            data[key] = rest.join(':').trim();
        }
    });
    return data;
}

// 获取当前时间，格式为 YYYY-MM-DD HH:mm:ss
function getDatetimeString(): string {
    const now = new Date();
    const padZero = (num: number): string => String(num).padStart(2, '0');
    const year = now.getFullYear();
    const month = padZero(now.getMonth() + 1);
    const day = padZero(now.getDate());
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const seconds = padZero(now.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 从 description.json 文件中提取 introduction 字段作为标题
 * @param filePath 当前文件路径
 * @returns introduction 字段值
 */
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

/**
 * 获取目录下最大的数字前缀，用于自动命名新文件
 * @param directory 目录路径
 * @returns 最大前缀 + 1
 */
function getNewNumberPrefix(directory: string): number {
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

/**
 * 删除 frontmatter 部分，返回正文内容
 * @param content 原始文件内容
 * @returns 正文内容
 */
function removeFrontmatter(content: string): string {
    const frontmatterMatch = content.trim().match(/^---[\r\n]([\s\S]*?)[\r\n]---/);
    if (!frontmatterMatch) return content; // 没有 frontmatter，直接返回原始内容
    return content.substring(frontmatterMatch[0].length).trimStart();
}

/**
 * 监听指定目录下的 .md 文件变化，并自动更新 frontmatter
 * @param directoryToWatch 要监听的目录
 * @returns 返回一个 vite 插件对象
 */
function fileWatcher(directoryToWatch: string) {
    let debounceTimer: NodeJS.Timeout | null = null; // 防抖定时器
    let lastContentMap = new Map<string, string>(); // 记录上次处理的内容哈希值

    return {
        name: 'file-watcher',
        configureServer(server: ViteDevServer) {
            const watcher = chokidar.watch(directoryToWatch, {
                ignoreInitial: true,
                persistent: true,
                ignored: /(^|[\/\\])\../, // 忽略以 . 开头的隐藏文件
            });

            // 当文件被添加时触发
            watcher.on('add', async (filePath: string) => {
                if (path.extname(filePath) !== '.md') return;

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

                // 如果文件已有内容，更新 frontmatter
                if (fileContent.trim().length > 0) {
                    updateFrontmatter(filePath, fileContent);
                    return;
                }

                try {
                    const fileName = path.basename(filePath, path.extname(filePath));
                    let url: string = '';

                    if (fileName === 'introduction') {
                        url = 'introduction';
                    } else {
                        const urlMatch = fileName.match(/^\d+/);
                        url = urlMatch ? urlMatch[0] : '';
                    }

                    if (!url) {
                        console.log('获取文件的 url 失败');
                        return;
                    }

                    let title = fileName.replace(/^\d+\./, '');
                    if (fileName.includes('introduction')) {
                        title = getTitleFromDescriptionFile(filePath);
                    }

                    const datetime = getDatetimeString();
                    const frontmatter = `---${os.EOL}outline: deep${os.EOL}title: ${title}${os.EOL}url: ${url}${os.EOL
                        }createtime: ${datetime}${os.EOL}updatetime: ${datetime}${os.EOL}---${os.EOL}`;

                    fs.writeFileSync(filePath, frontmatter, 'utf-8');
                } catch (error) {
                    console.error(`获取 URL 或写入文件时出错: ${error.message}`);
                }
            });

            // 当文件被修改时触发
            watcher.on('change', async (filePath: string) => {
                if (path.extname(filePath) !== '.md') return;

                let currentContent = '';
                let currentHash = '';

                try {
                    currentContent = fs.readFileSync(filePath, 'utf-8');
                    const contentWithoutFrontmatter = removeFrontmatter(currentContent);
                    currentHash = crypto.createHash('md5').update(contentWithoutFrontmatter).digest('hex');
                    const lastHash = lastContentMap.get(filePath);

                    if (currentHash === lastHash) return; // 内容未变化，跳过
                    lastContentMap.set(filePath, currentHash); // 更新哈希记录
                } catch (error) {
                    console.error(`读取文件时出错: ${error.message}`);
                    return;
                }

                fileModifyTimes[filePath] = getDatetimeString(); // 记录修改时间

                if (debounceTimer) clearTimeout(debounceTimer); // 清除之前的定时器

                debounceTimer = setTimeout(async () => {
                    try {
                        updateFrontmatter(filePath, currentContent);
                    } catch (error) {
                        console.error(`更新文件时出错: ${error.message}`);
                    } finally {
                        debounceTimer = null; // 执行完成后清空定时器引用
                    }
                }, 10000); // 延迟10秒执行
            });

            server.httpServer?.on('close', () => {
                watcher.close();
                if (debounceTimer) clearTimeout(debounceTimer); // 清除定时器
            });
        },
    };
}

export { fileWatcher };