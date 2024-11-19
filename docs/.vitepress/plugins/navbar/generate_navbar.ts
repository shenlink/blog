import fs from 'fs';
import path from 'path';
import { NavItem, NavItemWithLink, NavItems } from './types'
import { categoryNamesConfig } from '../../config/categoryNamesConfig';
import { subCategoryNamesConfig } from '../../config/subCategoryNamesConfig'
import { categoryOrderConfig } from '../../config/categoryOrdersConfig';
import { subCategoryOrdersConfig } from '../../config/subCategoryOrdersConfig';

function generateNavbar(articlesDir: string): Array<NavItem> {
    const baseDir = path.resolve(__dirname, '../../../', articlesDir);
    const nav: NavItem[] = [];
    nav.push({ text: '首页', link: '/' });
    const categories = fs.readdirSync(baseDir);
    const items: NavItems = {};
    categories.forEach((file) => {
        const filePath = path.join(baseDir, file);
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
                link: `${articlesDir}/${file}/${item}/introduction`,
            });
        });

        const text = categoryNamesConfig[file] || file;
        items[file] = {
            text: text,
            items: subItems,
        };
    });

    // 排序 nav，根据 categoryOrderConfig 顺序
    categoryOrderConfig.forEach((folder) => {
        if (items[folder]) {
            nav.push(items[folder]);
        }
    });

    return nav;
}

export { generateNavbar };
