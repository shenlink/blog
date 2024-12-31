import { DefaultTheme } from "vitepress";

export const footer: DefaultTheme.Footer = {
  message: `
  <span style="text-align: center;">
  <a href="https://beian.miit.gov.cn/" style="text-decoration: none" target="_blank">
    粤ICP备2024331772号
  </a>
  <br />
  <span style="display: inline-flex; justify-content: center; align-items: center; margin-left: 8px;">
    <img src="/images/beian.png" alt="粤公网安备44060502003783号" style="margin-right: 8px; width: 16px; height: 16px;">
    <a href="https://beian.mps.gov.cn/#/query/webSearch?code=44060502003783" style="text-decoration: none" rel="noreferrer" target="_blank">
      粤公网安备44060502003783号
    </a>
  </span>
  </span>`,
  copyright: 'Copyright © 2024-present <a href="https://github.com/shenlink">shenlink</a>'
};
