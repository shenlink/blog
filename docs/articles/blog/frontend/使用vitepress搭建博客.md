---
outline: deep
title: 使用vitepress搭建博客
url: 1fe89e3706fbfe66fe0157ca649b3373
createtime: 2024-11-17 11:18:00
updatetime: 2024-11-27 00:18:32
---

# 使用vitepress搭建博客

## 前置准备

* [Node.js](https://nodejs.org) 18 及以上版本。
* 通过命令行界面 (CLI) 访问 VitePress 的终端。
* 支持 [Markdown](https://baike.baidu.com/item/markdown) 语法的编辑器。
  * 推荐 [VSCode](https://code.visualstudio.com) 及其[官方 Vue 扩展](https://marketplace.visualstudio.com/items?itemName=Vue.volar)。
  
## 安装vitepress

### 安装vitepress依赖

```npm
npm add -D vitepress
```

### 安装向导

VitePress 附带一个命令行设置向导，可以帮助你构建一个基本项目。安装后，通过运行以下命令启动向导：

```npm
npx vitepress init
```

将需要回答几个简单的问题：

```cmd
T  Welcome to VitePress!
|
o  Where should VitePress initialize the config?
|  ./docs
|
o  Site title:
|  My Awesome Project
|
o  Site description:
|  A VitePress Site
|
o  Theme:
|  Default Theme
|
o  Use TypeScript for config and theme files?
|  Yes
|
o  Add VitePress npm scripts to package.json?
|  Yes
|
—  Done! Now run npm run docs:dev and start writing.
```

一路选择默认配置

## 文件结构

```cmd
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.mts
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

docs 目录作为 VitePress 站点的项目根目录。.vitepress 目录是 VitePress 配置文件、开发服务器缓存、构建输出和可选主题自定义代码的位置。

## 配置文件

配置文件 (.vitepress/config.mts) 让你能够自定义 VitePress 站点的各个方面，我的配置如下，可以参考一下：

```typescript
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import sidebarConfig from './plugins/generate_sidebar.js'

export default defineConfig({
  title: "代码的诗",
  description: "分享编程知识",
  head: [
    // 插入百度统计的脚本
    [
      'script',
      {},
      `
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?xxx";
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(hm, s);
        })();
      `,
    ],
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '计算机基础',
        items: [
          { text: '数据结构与算法', link: '/articles/cs/algorithms/introduction' }
        ]
      },
      {
        text: '编程之美',
        items: [
          { text: '设计模式', link: '/articles/code/design-pattern/introduction' },
        ]
      },
      {
        text: '博客',
        items: [
          { text: 'php', link: '/articles/blog/php/introduction' },
          { text: 'frontend', link: '/articles/blog/frontend/introduction' }
        ]
      }
    ],
    sidebar: sidebarConfig('articles'),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/shenlink' }
    ],
    footer: {
      message: '<a href="https://beian.miit.gov.cn/" style="text-decoration: none" target="_blank">粤ICP备2024331772号</a>',
      copyright: 'Copyright © 2024-present <a href="https://github.com/shenlink">shenlink</a>'
    }
  }
})

```

自动生成侧边栏的插件代码如下：

```typeScript
// SidebarItem.ts

// 定义 SidebarItem 的类型
export interface SidebarItem {
    text: string;
    link?: string;
    collapsed?: boolean;
    items?: SidebarItem[];
}
```

```typeScript
// generate_sidebar.ts

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

```

可以根据需要修改

## 部署到nginx

运行命令，生成最终的发布版文件

```npm
npm run docs:build
```

编译后的发布版文件在./docs/.vitepress/dist/目录下面

nginx配置文件参考如下：
```conf
server
{
    listen 80;
    server_name hxqzzxk.com;
    index index.php index.html index.htm default.php default.htm default.html;
    root /www/wwwroot/hxqzzxk/docs/.vitepress/dist;

    #ERROR-PAGE-START  错误页配置，可以注释、删除或修改
    error_page 404 /404.html;
    #error_page 502 /502.html;
    #ERROR-PAGE-END

    access_log  /www/wwwlogs/hxqzzxk.com.log;
    error_log  /www/wwwlogs/hxqzzxk.com.error.log;
}
```