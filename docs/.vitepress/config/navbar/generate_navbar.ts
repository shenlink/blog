import fs from 'fs';
import path from 'path';
import { DefaultTheme } from 'vitepress';

type NavItem = DefaultTheme.NavItem
type NavItemWithLink = DefaultTheme.NavItemWithLink

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

function generateNavbar(articlesDir: string): NavItem[] {
    const articles = path.basename(articlesDir)
    const nav: NavItem[] = [];
    nav.push({ text: '首页', link: '/' });
    const categories = fs.readdirSync(articlesDir).sort((a, b) => {
        const numA = parseInt(a.match(/^\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/^\d+/)?.[0] || '0', 10);
        return numA - numB;
    });
    categories.forEach((file) => {
        const filePath = path.join(articlesDir, file);
        const subCategories = fs.readdirSync(filePath);
        const subItems: NavItemWithLink[] = [];
        const sortedSubCategories = subCategories.sort((a, b) => {
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
        sortedSubCategories.forEach((item) => {
            if (item.includes('introduction.md') || item === 'description.json') {
                return;
            }

            // 修改：使用新的 getDescriptionName 函数
            const text = getDescriptionName(filePath, item);
            // 修改：查找并解析 introduction.md 文件
            const itemPath = path.join(filePath, item);
            const files = fs.readdirSync(itemPath).filter(f => f.includes('introduction.md'));
            if (files.length === 0) {
                return;
            }
            subItems.push({
                text: text,
                link: `${articles}/${file.replace(/^\d+\./, '')}/${item.replace(/^\d+\./, '')}/introduction`,
            });
        });

        // 修改：使用新的 getDescriptionName 函数
        const text = getDescriptionName(filePath);
        nav.push({
            text: text,
            items: subItems,
        });
    });

    return nav;
}

export { generateNavbar };
