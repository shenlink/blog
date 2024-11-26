import fs from 'fs';
import path from 'path';
import { subCategoryNamesConfig } from '../category/subCategoryNamesConfig'
import { subCategoryOrdersConfig } from '../category/subCategoryOrdersConfig';
import { DefaultTheme } from 'vitepress';
import matter from 'gray-matter';

type Sidebar = DefaultTheme.Sidebar
type SidebarItem = DefaultTheme.SidebarItem
type SubCategoryNames = { [key: string]: string }

// 递归扫描目录并生成 sidebar
function generateSidebar(articlesDir: string): Sidebar {
    const articles = path.basename(articlesDir)
    const sidebar: Sidebar = {};
    const categories = fs.readdirSync(articlesDir);
    // 需要跳过的顶级目录列表
    const skipDirs = categories;
    let subCategoryNames: SubCategoryNames = {}
    // 扫描目录
    function scanDirectory(dir: string): SidebarItem[] {
        const items: SidebarItem[] = [];
        const files = fs.readdirSync(dir);
        const categoryOrder = subCategoryOrdersConfig[path.basename(dir)] || []
        let sortedFiles = files
        if (categoryOrder.length !== 0) {
            sortedFiles = files.sort((a, b) => {
                // 检查 a 和 b 是否在 customSortOrder 中
                const indexA = categoryOrder.indexOf(a);
                const indexB = categoryOrder.indexOf(b);
                // 如果 a 和 b 都在 customSortOrder 中，按顺序排序
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                // 如果 a 和 b 都不在 customSortOrder 中，保持原顺序
                if (indexA === -1 && indexB === -1) {
                    return 0;
                }
                // 如果 a 在 customSortOrder 中而 b 不在，a 排在前面
                if (indexA !== -1 && indexB === -1) {
                    return -1;
                }
                // 如果 b 在 customSortOrder 中而 a 不在，b 排在前面
                if (indexA === -1 && indexB !== -1) {
                    return 1;
                }
                return 0;
            });
        }
        // 先收集所有的 .md 文件
        const mdFiles: SidebarItem[] = [];
        sortedFiles.forEach((file) => {
            const filePath = path.join(dir, file);
            // 判断是否是 skipDirs 目录下的 introduction.md 文件，跳过
            const dirName = path.basename(dir);
            if (skipDirs.includes(dirName) && file === 'introduction.md') return;
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                // 如果是文件夹，递归扫描该文件夹
                items.push({
                    text: subCategoryNames[file] || file,
                    collapsed: true,
                    // 递归进入子目录
                    items: scanDirectory(filePath),
                });
            } else if (file.endsWith('.md')) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data, content } = matter(fileContent);
                const url = data.url;
                // 如果是Markdown文件，添加到列表
                mdFiles.push({
                    text: file.replace('.md', ''),
                    link: `/${articles}/${dir.replace(articlesDir, '').replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')}/${url}`,
                });
            }
        });

        // 将 introduction.md 文件放在最前面
        const introIndex = mdFiles.findIndex(file => file.text && file.text.toLowerCase() === 'introduction');
        if (introIndex !== -1) {
            // 找到并移除 introduction.md
            const introFile = mdFiles.splice(introIndex, 1)[0];
            // 将 introduction.md 放在最前面
            mdFiles.unshift(introFile);
        }

        // 将所有文件添加到 items 数组
        items.push(...mdFiles);

        return items;
    }

    categories.forEach((category) => {
        const categoryPath = path.join(articlesDir, category);
        const stat = fs.statSync(categoryPath);
        subCategoryNames = subCategoryNamesConfig[category] || []
        if (stat.isDirectory()) {
            // 为每个articlesDir目录的目录生成 sidebar 配置
            sidebar[`/${articles}/${category}/`] = scanDirectory(categoryPath);
            // 递归处理子目录
            const subCategories = fs.readdirSync(categoryPath);
            subCategories.forEach((subCategory) => {
                const subCategoryPath = path.join(categoryPath, subCategory);
                const subStat = fs.statSync(subCategoryPath);
                if (subStat.isDirectory()) {
                    sidebar[`/${articles}/${category}/${subCategory}/`] = scanDirectory(subCategoryPath);
                }
            });
        }
    });
    return sidebar;
}

export { generateSidebar };
