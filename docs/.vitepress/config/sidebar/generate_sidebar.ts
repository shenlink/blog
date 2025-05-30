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
        const files = fs.readdirSync(dir);
        let sortedFiles = files
        sortedFiles = files.sort((a, b) => {
            // 提取目录名称中的数字部分
            const extractNumber = (str: string): number => {
                const match = str.match(/^\d+/);
                return match ? parseInt(match[0], 10) : Infinity;
            };

            const numA = extractNumber(a);
            const numB = extractNumber(b);

            // 按数字大小排序
            return numA - numB;
        });
        // 先收集所有的 .md 文件
        const mdFiles: SidebarItem[] = [];
        sortedFiles.forEach((file) => {
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
                const { data, content } = matter(fileContent);
                const url = data.url;
                // 如果是Markdown文件，添加到列表
                mdFiles.push({
                    text: file.replace('.md', '').replace(/^\d+\./, ''),
                    // 去掉url中的数字和.
                    link: `/${articles}/${dir.replace(articlesDir, '').replace(/\\(\d+\.)/g, '\\').replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')}/${url}`,
                });
            }
        });

        // 将所有文件添加到 items 数组
        items.push(...mdFiles);

        return items;
    }

    categories.forEach((category) => {
        const categoryPath = path.join(articlesDir, category);
        const stat = fs.statSync(categoryPath);
        if (stat.isDirectory()) {
            // 为每个articlesDir目录的目录生成 sidebar 配置
            sidebar[`/${articles}/${category.replace(/^\d+\./, '')}/`] = scanDirectory(categoryPath);
            // 递归处理子目录
            const subCategories = fs.readdirSync(categoryPath);
            subCategories.forEach((subCategory) => {
                const subCategoryPath = path.join(categoryPath, subCategory);
                const subStat = fs.statSync(subCategoryPath);
                if (subStat.isDirectory()) {
                    sidebar[`/${articles}/${category.replace(/^\d+\./, '')}/${subCategory.replace(/^\d+\./, '')}/`] = scanDirectory(subCategoryPath);
                }
            });
        }
    });
    return sidebar;
}

export { generateSidebar };
