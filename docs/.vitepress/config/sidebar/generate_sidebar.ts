import fs from 'fs';
import path from 'path';
import { DefaultTheme } from 'vitepress';
import matter from 'gray-matter';

type Sidebar = DefaultTheme.Sidebar
type SidebarItem = DefaultTheme.SidebarItem

// 新增函数：从 description.json 文件中读取 name 属性
function getDescriptionName(directoryPath: string, itemName?: string): string {
    let descriptionPath = path.join(directoryPath, 'description.json');
    if (itemName) {
        descriptionPath = path.join(directoryPath, itemName, 'description.json');
    }

    if (fs.existsSync(descriptionPath)) {
        try {
            const description = JSON.parse(fs.readFileSync(descriptionPath, 'utf-8'));
            return description.name || '';
        } catch (error) {
            console.error(`Failed to parse description.json for ${itemName || directoryPath}:`, error);
        }
    }

    return itemName || path.basename(directoryPath);
}

// 新增函数：从 description.json 文件中读取 introduction 属性
function getDescriptionIntroduction(directoryPath: string, itemName?: string): string {
    let descriptionPath = path.join(directoryPath, 'description.json');
    if (itemName) {
        descriptionPath = path.join(directoryPath, itemName, 'description.json');
    }

    if (fs.existsSync(descriptionPath)) {
        try {
            const description = JSON.parse(fs.readFileSync(descriptionPath, 'utf-8'));
            return description.introduction;
        } catch (error) {
            console.error(`Failed to parse description.json for ${itemName || directoryPath}:`, error);
        }
    }

    return itemName || path.basename(directoryPath);
}

function cleanPathSegment(segment: string): string {
    return segment.replace(/^\d+\./, '');
}

function normalizePath(p: string): string {
    return p.split(path.sep).filter(Boolean).join('/');
}

// 递归扫描目录并生成 sidebar
function generateSidebar(articlesDir: string): Sidebar {
    const articles = path.basename(articlesDir)
    const sidebar: Sidebar = {};
    const categories = fs.readdirSync(articlesDir);
    // 需要跳过的顶级目录列表
    const skipDirs = categories;
    // 扫描目录
    function scanDirectory(dir: string): SidebarItem[] {
        const items: SidebarItem[] = [];
        const files = fs.readdirSync(dir).sort((a, b) => {
            const extractNumber = (str: string): number => {
                const match = str.match(/^\d+/);
                return match ? parseInt(match[0], 10) : Infinity;
            };
            // 按数字大小排序
            return extractNumber(a) - extractNumber(b);
        });
        // 先收集所有的 .md 文件
        const mdFiles: SidebarItem[] = [];
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            // 判断是否是 skipDirs 目录下的 introduction.md 文件，跳过
            const dirName = path.basename(dir);
            if (skipDirs.includes(dirName) && file.includes('introduction.md')) return;
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                // 如果是文件夹，递归扫描该文件夹
                items.push({
                    text: getDescriptionName(filePath),
                    collapsed: true,
                    // 递归进入子目录
                    items: scanDirectory(filePath),
                });
            } else if (file.endsWith('.md')) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data } = matter(fileContent);
                const url = data.url || file.replace('.md', '');
                // 如果是Markdown文件，添加到列表
                const relativeDir = normalizePath(dir.replace(articlesDir, ''));
                const cleanedDir = relativeDir
                    .split('/')
                    .map(cleanPathSegment)
                    .filter(Boolean)
                    .join('/');

                mdFiles.push({
                    text: file.replace('.md', '').replace(/^\d+\./, ''),
                    link: `/${articles}/${cleanedDir}/${url}`,
                });
            }
        });

        // 将所有文件添加到 items 数组
        items.push(...mdFiles);
        // 将 introduction.md 文件放在最前面
        const introIndex = items.findIndex(file => file.text && file.text.includes('introduction'));
        if (introIndex !== -1) {
            // 找到并移除 introduction.md
            const introFile = items.splice(introIndex, 1)[0];
            introFile.text = getDescriptionIntroduction(dir)
            // 将 introduction.md 放在最前面
            items.unshift(introFile);
        }
        return items;
    }

    categories.forEach((category) => {
        const categoryPath = path.join(articlesDir, category);
        const stat = fs.statSync(categoryPath);
        if (stat.isDirectory()) {
            const categoryKey = cleanPathSegment(category);
            sidebar[`/${articles}/${categoryKey}/`] = scanDirectory(categoryPath);

            const subCategories = fs.readdirSync(categoryPath);
            subCategories.forEach((subCategory) => {
                const subCategoryPath = path.join(categoryPath, subCategory);
                const subStat = fs.statSync(subCategoryPath);
                if (subStat.isDirectory()) {
                    const subCategoryKey = cleanPathSegment(subCategory);
                    sidebar[`/${articles}/${categoryKey}/${subCategoryKey}/`] = scanDirectory(subCategoryPath);
                }
            });
        }
    });
    return sidebar;
}

export { generateSidebar };
