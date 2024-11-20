import { HeadConfig } from "../../config/types"

export const head: HeadConfig = [
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
]
