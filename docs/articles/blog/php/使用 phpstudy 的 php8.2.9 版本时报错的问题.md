---
outline: deep
title: 使用 phpstudy 的 php8.2.9 版本时报错的问题
url: 46a07f36afc1b84537e952389d1ece6f
createtime: 2024-11-12T12:46:31.000Z
updatetime: 2024-11-23T21:39:19.000Z
---

# phpstudy 使用 php8.2.9 版本报错问题

### 错误
使用以下命令：
```shell
php -v
```
报错：
Fatal error: Directive 'track_errors' is no longer available in PHP in Unknown on line 0

### 解决方案
在D:/phpstudy_pro/Extensions/php/php8.2.9nts/php.ini中将track_errors=On改为track_errors=Off
