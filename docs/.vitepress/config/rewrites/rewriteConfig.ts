
import fs from 'fs';
import path, { dirname } from 'path';
import matter from 'gray-matter';
import { articlesDir } from '../extra/config';

type Rewrites = Record<string, string>
// 递归扫描目录并生成 rewrites
function generateRewriteConfig(): Rewrites {
    const articles = path.basename(articlesDir)
    const categories = fs.readdirSync(articlesDir);
    // 需要跳过的顶级目录列表
    const skipDirs = categories;
    let rewrites = {};
    // 扫描目录
    function scanDirectory(dir: string) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            // 判断是否是 skipDirs 目录下的 introduction.md 文件，跳过
            const dirName = path.basename(dir);
            if (skipDirs.includes(dirName)) {
                return;
            }
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                scanDirectory(filePath);
            } else if (file.endsWith('.md')) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data, content } = matter(fileContent);
                const url = data.url;
                const prefixKeyPath = `${articles}/${dir.replace(articlesDir, '').replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')}`;
                const prefixValuePath = `${articles}/${dir.replace(articlesDir, '').split('\\')
                    .map(part => part.replace(/^\d+\./, '')).join('\\').replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')}`;
                const key = `${prefixKeyPath}/${file}`;
                const value = `${prefixValuePath}/${url}.md`;
                rewrites[key] = value;
            }
        });
    }

    categories.forEach((category) => {
        const categoryPath = path.join(articlesDir, category);
        const stat = fs.statSync(categoryPath);
        if (stat.isDirectory()) {
            // 递归处理子目录
            const subCategories = fs.readdirSync(categoryPath);
            subCategories.forEach((subCategory) => {
                const subCategoryPath = path.join(categoryPath, subCategory);
                const subStat = fs.statSync(subCategoryPath);
                if (subStat.isDirectory()) {
                    scanDirectory(subCategoryPath);
                } else {
                    const extractNumber = (str: string): number => {
                        const match = str.match(/^\d+/);
                        return match ? parseInt(match[0], 10) : 0;
                    };
                    if (subCategoryPath.includes('introduction.md')) {
                        // 获取到文件名开头的数字
                        const number = extractNumber(subCategory);
                        const url = number === 0 ? 'introduction' : number.toString(10);
                        const prefixKeyPath = `${articles}/${subCategoryPath.replace(articlesDir, '').replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')}`;
                        const dir = path.dirname(subCategoryPath.replace(articlesDir, '')).split(path.sep).map(part => part.replace(/^\d+\./, ''));
                        const prefixValuePath = `${articles}/${path.join(...dir).replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')}`;
                        const key = `${prefixKeyPath}`;
                        const value = `${prefixValuePath}/${url}.md`;
                        rewrites[key] = value;
                    }
                }
            });
        }
    });

    return rewrites;
}

const rewritesConfig = generateRewriteConfig();

export { rewritesConfig };
