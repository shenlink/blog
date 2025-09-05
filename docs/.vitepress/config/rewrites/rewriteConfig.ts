import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { articlesDir } from '../extra/config';

// 定义重写规则类型，键值对形式的字符串记录
type Rewrites = Record<string, string>;

/**
 * 标准化路径分隔符为正斜杠
 * @param p - 需要标准化的路径
 * @returns 标准化后的路径
 */
function normalizePath(p: string): string {
    return p
        .split(path.sep)
        .filter(Boolean)
        .join('/');
}

/**
 * 递归扫描目录并生成重写规则配置
 * 主要功能是将带有数字前缀和分类的文件路径重写为更简洁的URL路径
 * @returns 重写规则对象
 */
function generateRewriteConfig(): Rewrites {
    // 获取文章目录的基本名称
    const articles = path.basename(articlesDir);
    // 读取所有分类目录
    const categories = fs.readdirSync(articlesDir);
    // 需要跳过的目录列表
    const skipDirs = categories;
    // 初始化重写规则对象
    let rewrites: Rewrites = {};
    
    /**
     * 递归扫描目录函数
     * @param dir - 需要扫描的目录路径
     */
    function scanDirectory(dir: string) {
        // 读取当前目录下的所有文件和文件夹
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            // 构造完整的文件路径
            const filePath = path.join(dir, file);
            // 获取文件状态信息
            const stat = fs.statSync(filePath);

            // 如果是目录，则递归扫描
            if (stat.isDirectory()) {
                scanDirectory(filePath);
            // 如果是 Markdown 文件
            } else if (file.endsWith('.md')) {
                // 获取当前文件所在目录名
                const dirName = path.basename(dir);
                // 如果当前目录在跳过列表中，则返回
                if (skipDirs.includes(dirName)) {
                    return;
                }

                // 读取文件内容
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                // 使用 gray-matter 解析文件的 frontmatter
                const { data } = matter(fileContent);
                // 从 frontmatter 获取 url，如果没有则使用文件名（不含扩展名）
                const url = data.url || file.replace('.md', '');

                // 获取相对于文章目录的路径
                const relativeDir = normalizePath(dir.replace(articlesDir, '')); // 👈 精简路径
                // 构造重写规则的键（原始路径）
                const key = `${articles}/${relativeDir}/${file}`;
                // 清理路径中的数字前缀（如 01. 02. 等）
                const cleanDir = relativeDir
                    .split('/')
                    .map(part => part.replace(/^\d+\./, ''))
                    .filter(Boolean)
                    .join('/');

                // 构造重写规则的值（目标路径）
                const value = `${articles}/${cleanDir}/${url}.md`;

                // 添加到重写规则中
                rewrites[key] = value;
            }
        });
    }

    // 遍历所有分类目录
    categories.forEach((category) => {
        // 构造分类目录完整路径
        const categoryPath = path.join(articlesDir, category);
        // 获取目录状态信息
        const stat = fs.statSync(categoryPath);
        // 如果是目录
        if (stat.isDirectory()) {
            // 读取子分类目录
            const subCategories = fs.readdirSync(categoryPath);
            subCategories.forEach((subCategory) => {
                // 构造子分类完整路径
                const subCategoryPath = path.join(categoryPath, subCategory);
                // 获取文件状态信息
                const subStat = fs.statSync(subCategoryPath);
                // 如果是目录，则扫描目录
                if (subStat.isDirectory()) {
                    scanDirectory(subCategoryPath);
                // 如果是 introduction.md 文件
                } else if (subCategory === 'introduction.md') {
                    // 匹配文件名开头的数字
                    const numberMatch = subCategory.match(/^\d+/);
                    // 提取数字，如果没有则默认为 0
                    const number = numberMatch ? parseInt(numberMatch[0], 10) : 0;
                    // 根据数字确定 URL，0 对应 introduction，其他数字对应相应数字字符串
                    const url = number === 0 ? 'introduction' : number.toString(10);

                    // 获取相对于文章目录的路径并清理首尾斜杠
                    const relativeDir = normalizePath(path.dirname(subCategoryPath.replace(articlesDir, '')))
                        .replace(/^\//, '')
                        .replace(/\/$/, '');

                    // 清理路径中的数字前缀
                    const cleanDir = relativeDir
                        .split('/')
                        .map(part => part.replace(/^\d+\./, ''))
                        .filter(Boolean)
                        .join('/');

                    // 构造原始路径键
                    const key = `${articles}/${normalizePath(subCategoryPath.replace(articlesDir, ''))}`;
                    // 构造目标路径值
                    const value = `${articles}/${cleanDir}/${url}.md`;

                    // 添加到重写规则中
                    rewrites[key] = value;
                }
            });
        }
    });

    return rewrites;
}

// 生成重写规则配置
const rewritesConfig = generateRewriteConfig();

// 导出重写规则配置
export { rewritesConfig };