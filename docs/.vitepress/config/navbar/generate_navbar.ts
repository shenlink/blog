import fs from 'fs';
import path from 'path';
import { categoryNamesConfig } from '../category/categoryNamesConfig';
import { subCategoryNamesConfig } from '../category/subCategoryNamesConfig'
import { categoryOrdersConfig } from '../category/categoryOrdersConfig';
import { subCategoryOrdersConfig } from '../category/subCategoryOrdersConfig';
import { DefaultTheme } from 'vitepress';

type NavItem = DefaultTheme.NavItem
type NavItemWithLink = DefaultTheme.NavItemWithLink
type NavItems = { [key: string]: NavItem }

function generateNavbar(articlesDir: string): NavItem[] {
    const articles = path.basename(articlesDir)
    const nav: NavItem[] = [];
    nav.push({ text: '首页', link: '/' });
    const categories = fs.readdirSync(articlesDir);
    const items: NavItems = {};
    categories.forEach((file) => {
        const filePath = path.join(articlesDir, file);
        const subCategories = fs.readdirSync(filePath);
        const subItems: NavItemWithLink[] = [];
        const subCategoryOrders = subCategoryOrdersConfig[file] || []
        const sortedSubCategories = subCategories.sort((a, b) => {
            // 检查 a 和 b 是否在 subCategoryOrders 中
            const indexA = subCategoryOrders.indexOf(a);
            const indexB = subCategoryOrders.indexOf(b);
            // 如果 a 和 b 都在 subCategoryOrders 中，按顺序排序
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // 如果 a 和 b 都不在 subCategoryOrders 中，保持原顺序
            if (indexA === -1 && indexB === -1) {
                return 0;  // 返回 0 保证它们的相对顺序不变
            }
            // 如果 a 在 subCategoryOrders 中而 b 不在，a 排在前面
            if (indexA !== -1 && indexB === -1) {
                return -1;
            }
            // 如果 b 在 subCategoryOrders 中而 a 不在，b 排在前面
            if (indexA === -1 && indexB !== -1) {
                return 1;
            }
            return 0;
        });
        const subCategoryNames = subCategoryNamesConfig[file]
        sortedSubCategories.forEach((item) => {
            if (item === 'introduction.md') {
                return;
            }
            const text = subCategoryNames[item] || item;
            subItems.push({
                text: text,
                link: `${articles}/${file}/${item}/introduction`,
            });
        });

        const text = categoryNamesConfig[file] || file;
        items[file] = {
            text: text,
            items: subItems,
        };
    });

    // 排序 nav，根据 categoryOrderConfig 顺序
    categoryOrdersConfig.forEach((folder) => {
        if (items[folder]) {
            nav.push(items[folder]);
        }
    });
    console.log(items)

    return nav;
}

export { generateNavbar };
