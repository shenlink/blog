
import fs from 'fs';
import path from 'path';
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
            if (skipDirs.includes(dirName) && file === 'introduction.md') {
                return;
            }
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                scanDirectory(filePath);
            } else if (file.endsWith('.md')) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data, content } = matter(fileContent);
                const url = data.url;
                const prefixPath = `${articles}/${dir.replace(articlesDir, '').replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')}`;
                const key = `${prefixPath}/${file}`;
                const value = `${prefixPath}/${url}.md`;
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
                }
            });
        }
    });

    return rewrites;
}

const rewritesConfig = generateRewriteConfig();

export { rewritesConfig };
