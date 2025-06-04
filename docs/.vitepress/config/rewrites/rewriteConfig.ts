import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { articlesDir } from '../extra/config';

type Rewrites = Record<string, string>;

function normalizePath(p: string): string {
    return p
        .split(path.sep)
        .filter(Boolean)
        .join('/');
}

// 递归扫描目录并生成 rewrites
function generateRewriteConfig(): Rewrites {
    const articles = path.basename(articlesDir);
    const categories = fs.readdirSync(articlesDir);
    const skipDirs = categories;
    let rewrites: Rewrites = {};
    // 扫描目录
    function scanDirectory(dir: string) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                scanDirectory(filePath);
            } else if (file.endsWith('.md')) {
                const dirName = path.basename(dir);
                if (skipDirs.includes(dirName)) {
                    return;
                }

                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data } = matter(fileContent);
                const url = data.url || file.replace('.md', '');

                const relativeDir = normalizePath(dir.replace(articlesDir, '')); // 👈 精简路径
                const key = `${articles}/${relativeDir}/${file}`;
                const cleanDir = relativeDir
                    .split('/')
                    .map(part => part.replace(/^\d+\./, ''))
                    .filter(Boolean)
                    .join('/');

                const value = `${articles}/${cleanDir}/${url}.md`;

                rewrites[key] = value;
            }
        });
    }

    categories.forEach((category) => {
        const categoryPath = path.join(articlesDir, category);
        const stat = fs.statSync(categoryPath);
        if (stat.isDirectory()) {
            const subCategories = fs.readdirSync(categoryPath);
            subCategories.forEach((subCategory) => {
                const subCategoryPath = path.join(categoryPath, subCategory);
                const subStat = fs.statSync(subCategoryPath);
                if (subStat.isDirectory()) {
                    scanDirectory(subCategoryPath);
                } else if (subCategory === 'introduction.md') {
                    const numberMatch = subCategory.match(/^\d+/);
                    const number = numberMatch ? parseInt(numberMatch[0], 10) : 0;
                    const url = number === 0 ? 'introduction' : number.toString(10);

                    const relativeDir = normalizePath(path.dirname(subCategoryPath.replace(articlesDir, '')))
                        .replace(/^\//, '')
                        .replace(/\/$/, '');

                    const cleanDir = relativeDir
                        .split('/')
                        .map(part => part.replace(/^\d+\./, ''))
                        .filter(Boolean)
                        .join('/');

                    const key = `${articles}/${normalizePath(subCategoryPath.replace(articlesDir, ''))}`;
                    const value = `${articles}/${cleanDir}/${url}.md`;

                    rewrites[key] = value;
                }
            });
        }
    });

    return rewrites;
}

const rewritesConfig = generateRewriteConfig();

export { rewritesConfig };