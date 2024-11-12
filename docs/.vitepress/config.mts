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
          hm.src = "https://hm.baidu.com/hm.js?9c2fdd102f0a62fbd1b5b9195edd14ed";
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
          { text: 'php', link: '/articles/blog/php/introduction' }
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
        }
      ],
      '/articles/blog/php/': [
        { text: 'php介绍', link: '/articles/blog/php/introduction' },
        { text: 'FastAdmin的搜索加上selectpage的重置功能', link: '/articles/blog/php/FastAdmin的搜索加上selectpage的重置功能' },
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
