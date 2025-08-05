---
outline: deep
title: holiya介绍
url: introduction
createtime: 2025-07-13 08:33:00
updatetime: 2025-07-17 23:42:42
---

# holiya介绍

holiya 是我根据《用Go语言自制解释器》编写的编程语言，做了一些修改和增强。名字取自我和我的几个好朋友名字的一个或两个字母，纪念我们的友谊。

### 修改的部分
变量名更加严格，拒绝省略，比如：IDENT 改为 IDENTIFIER，代表结束的0字符使用END常量，可读性更好。

### 新增的部分
- 支持注释，注释支持中文，比如：// 这是注释
- 对于所有的 token 和 lexer，都添加测试，完全覆盖了所有情况。
- 新增 file 包，可以使用 `holiya filename.holiya` 运行holiya文件。

### 构建
windows:
```shell
go build -o holiya.exe main.go
```

linux:
```shell
go build -o holiya main.go
```

### 测试
执行所有测试：
```shell
go test ./...
```

### 使用
运行 repl:
windows：
```shell
holiya.exe
```

linux：
```shell
./holiya
```

执行文件：
windows:
```shell
holiya.exe filename.holiya
```

linux:
```shell
./holiya filename.holiya
```

### 后续计划
后续是打算支持更多的功能：比如多行注释，类似于PHP的/** **/多行注释，++运算符和--运算符，以及一些新的数据结构，比如字典，列表，元组等等。