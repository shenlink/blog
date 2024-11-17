---
outline: deep
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

    sidebar: {
      '/articles/cs/': [
        {
          text: '数据结构与算法', collapsed: true, items: [
            { text: '数据结构与算法介绍', link: '/articles/cs/algorithms/introduction' },
            { text: '动态数组', link: '/articles/cs/algorithms/动态数组' },
          ]
        }
      ],
      '/articles/cs/algorithms/': [
        { text: '数据结构与算法介绍', link: '/articles/cs/algorithms/introduction' },
        { text: '动态数组', link: '/articles/cs/algorithms/动态数组' },
      ],
      '/articles/code/': [
        {
          text: '设计模式', collapsed: true, items: [
            { text: '设计模式介绍', link: '/articles/code/design-pattern/introduction' },
            { text: '单例模式', link: '/articles/code/design-pattern/单例模式' },
          ]
        }
      ],
      '/articles/code/design-pattern/': [
        { text: '设计模式介绍', link: '/articles/code/design-pattern/introduction' },
        { text: '单例模式', link: '/articles/code/design-pattern/单例模式' },
      ],
      '/articles/blog/': [
        {
          text: 'php', collapsed: true, items: [
            { text: 'php介绍', link: '/articles/blog/php/introduction' },
            { text: 'FastAdmin的搜索加上selectpage的重置功能', link: '/articles/blog/php/FastAdmin的搜索加上selectpage的重置功能' },
          ]
        },
        {
          text: 'frontend', collapsed: true, items: [
            { text: '前端介绍', link: '/articles/blog/frontend/introduction' },
            { text: '使用vitepress搭建博客', link: '/articles/blog/frontend/使用vitepress搭建博客' },
          ]
        }
      ],
      '/articles/blog/php/': [
        { text: 'php介绍', link: '/articles/blog/php/introduction' },
        { text: 'FastAdmin的搜索加上selectpage的重置功能', link: '/articles/blog/php/FastAdmin的搜索加上selectpage的重置功能' },
      ],
      '/articles/blog/frontend/': [
        { text: '前端介绍', link: '/articles/blog/frontend/introduction' },
        { text: '使用vitepress搭建博客', link: '/articles/blog/frontend/使用vitepress搭建博客' },
      ]

    },

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

## 部署到nginx

运行命令，生成最终的发布版文件

```npm
npm run docs:build
```

在./docs/.vitepress/dist/目录下面
nginx配置文件参考如下：
```conf
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # content location
        root /app;

        # exact matches -> reverse clean urls -> folders -> not found
        try_files $uri $uri.html $uri/ =404;

        # non existent pages
        error_page 404 /404.html;

        # a folder without index.html raises 403 in this setup
        error_page 403 /404.html;

        # adjust caching headers
        # files in the assets folder have hashes filenames
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```