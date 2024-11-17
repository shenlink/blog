import fs from 'fs';
import path from 'path';
import { SidebarItem } from './SidebarItem'

// 递归扫描目录并生成 sidebar
function generateSidebar(articlesDir: string): { [key: string]: SidebarItem[] } {
  const sidebar: { [key: string]: SidebarItem[] } = {};
  // 构建 articlesDir 的绝对路径
  const baseDir = path.resolve(__dirname, '../../', articlesDir);
  // 需要跳过的顶级目录列表
  const skipDirs = fs.readdirSync(baseDir);
  // 扫描目录
  function scanDirectory(dir: string): SidebarItem[] {
    const items: SidebarItem[] = [];
    const files = fs.readdirSync(dir);
    // 先收集所有的 .md 文件
    const mdFiles: SidebarItem[] = [];
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      // 判断是否是 skipDirs 目录下的 introduction.md 文件，跳过
      const dirName = path.basename(dir);
      if (skipDirs.includes(dirName) && file === 'introduction.md') return;

      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        // 如果是文件夹，递归扫描该文件夹
        items.push({
          text: file,
          collapsed: true,
          // 递归进入子目录
          items: scanDirectory(filePath),
        });
      } else if (file.endsWith('.md')) {
        // 如果是Markdown文件，添加到列表
        mdFiles.push({
          text: file.replace('.md', ''),
          link: `/${articlesDir}/${dir.replace(baseDir, '').replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')}/${file.replace('.md', '')}`,
        });
      }
    });

    // 将 introduction.md 文件放在最前面
    const introIndex = mdFiles.findIndex(file => file.text.toLowerCase() === 'introduction');
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

  const categories = fs.readdirSync(baseDir);

  categories.forEach((category) => {
    const categoryPath = path.join(baseDir, category);

    const stat = fs.statSync(categoryPath);
    if (stat.isDirectory()) {
      // 为每个articlesDir目录的目录生成 sidebar 配置
      sidebar[`/${articlesDir}/${category}/`] = scanDirectory(categoryPath);
      // 递归处理子目录
      const subCategoryPaths = fs.readdirSync(categoryPath);
      subCategoryPaths.forEach((subCategory) => {
        const subCategoryPath = path.join(categoryPath, subCategory);
        const subStat = fs.statSync(subCategoryPath);
        if (subStat.isDirectory()) {
          sidebar[`/${articlesDir}/${category}/${subCategory}/`] = scanDirectory(subCategoryPath);
        }
      });
    }
  });
  return sidebar;
}

export default generateSidebar;
