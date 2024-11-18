---
outline: deep
---

# linux安装elasticsearch

## 下载和解压

elasticsearch 的下载地址如下：
```url
https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.12.2-linux-x86_64.tar.gz
```

在 linux 中选择一个合适的目录，下载 elasticsearch 压缩包
```shell
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.12.2-linux-x86_64.tar.gz
```

下载完成之后，解压
```shell
tar -zxvf elasticsearch-8.12.2-linux-x86_64.tar.gz
```

## 设置用户和用户组

elasticsearch不能再root下启动，需要新增普通用户来启动elasticsearch

新增用户组
```shell
groupadd elastic
```

新增用户
```shell
useradd elastic -g elastic
```

设置用户密码
```shell
passwd elastic
```

给elastic用户设置sudo权限
```shell
visudo
```

在 在root ALL=(ALL) ALL一行下面添加elastic ALL=(ALL) ALL
```conf
root    ALL=(ALL)       ALL
elastic   ALL=(ALL)       ALL
```

## 修改虚拟内存的最大映射数
```shell
vim /etc/sysctl.conf
```

在最后一行加上
```conf
vm.max_map_count=262144
```

使虚拟内存配置立即生效
```shell
sysctl -p
```

## 配置 elasticsearch

修改 elasticsearch-8.12.2目录的用户和用户组，elasticsearch不能用root用户来启动
```shell
chown -R elastic:elastic elasticsearch-8.12.2
```

进入到解压缩后的目录里面
```shell
cd elasticsearch-8.12.2
```

在config目录下面的jvm.options文件里面修改内存的配置
```options
-Xms4g
-Xmx4g
```

在 elasticsearch.yml文件中取消以下配置的注释：
```yml
cluster.name: my-application
node.name: node-1
network.host: 0.0.0.0
http.port: 9200
cluster.initial_master_nodes: ["node-1"]
```

## 安全配置

先切换用户，elasticsearch的目录不能用root执行
```shell
su elastic
```

### 1. 创建一个证书颁发机构

```shell
./bin/elasticsearch-certutil ca
```

提示**Please enter the desired output file [elastic-stack-ca.p12]**：直接回车，会默认生成一个文件名为elastic-stack-ca.p12的文件
提示**Enter password for elastic-stack-ca.p12**：输入密码

### 2. 为节点生成证书和私钥

```shell
./bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12
```

* 提示**Enter password for CA (elastic-stack-ca.p12)** 输入第一步设置的elastic-stack-ca.p12文件的密码
* 提示**Please enter the desired output file [elastic-certificates.p12]** 直接回车，会默认生成一个文件名为elastic-certificates.p12的文件
* 提示**Enter password for elastic-certificates.p12** 输入密码

### 3. 将文件可拷贝到certs目录下
```shell
mkdir config/certs
```

```shell
mv elastic-certificates.p12 config/certs/
```

### 4. 给keystore和truststore设置密码

```shell
./bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password
```

* 提示**The elasticsearch keystore does not exist. Do you want to create it? [y/N]** 输入y
* 提示**Enter value for xpack.security.transport.ssl.keystore.secure_password:** 输入一个密码

```shell
./bin/elasticsearch-keystore add xpack.security.transport.ssl.truststore.secure_password
```

```shell
./bin/elasticsearch-keystore add xpack.security.http.ssl.keystore.secure_password
```
* 提示**Enter value for xpack.security.transport.ssl.truststore.secure_password** 输入一个密码

```shell
./bin/elasticsearch-keystore add xpack.security.http.ssl.truststore.secure_password
```
* 提示**Enter value for xpack.security.http.ssl.truststore.secure_password** 输入一个密码

### 5. 修改配置文件并重启
配置文件中加入以下配置，然后重启
```yml
xpack.security.enabled: true
xpack.security.http.ssl:
  enabled: false
  verification_mode: certificate
  truststore.path: certs/elastic-certificates.p12
  keystore.path: certs/elastic-certificates.p12

xpack.security.transport.ssl:
  enabled: true
  verification_mode: certificate
  keystore.path: certs/elastic-certificates.p12
  truststore.path: certs/elastic-certificates.p12
```

### 6. 创建用户密码

启动后，就可以设置账号密码了

* 自动创建密码，会自动生成elastic，kibana_system等用户的密码
```shell
./bin/elasticsearch-setup-passwords auto
```

* 手动输入密码
```shell
./bin/elasticsearch-setup-passwords interactive
```
提示**Please confirm that you would like to continue [y/N]** 输入y，然后按照要求输入密码

* 重置elastic用户的密码，密码随机
```shell
./bin/elasticsearch-reset-password -u elastic
```

* 重置elastic用户的密码，-i 后面是指定的密码
```shell
./bin/elasticsearch-reset-password -u elastic -i <password>
```

## 访问测试

### 1. curl访问
```shell
curl localhost:9200 -u elastic:xxx
```
elastic是用户名，xxx是密码
* 返回
```json
{
  "name" : "node-1",
  "cluster_name" : "my-application",
  "cluster_uuid" : "AI4GCa3zTw-Rsl76Vi4osA",
  "version" : {
    "number" : "8.12.2",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "48a287ab9497e852de30327444b0809e55d46466",
    "build_date" : "2024-02-19T10:04:32.774273190Z",
    "build_snapshot" : false,
    "lucene_version" : "9.9.2",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

### 2. 浏览器访问
* 浏览器登录
![浏览器登录](/uploads/2024/11/19/4b845f1ce0394d54218a0d77f571c743.png)
* 返回
```json
{
  "name" : "node-1",
  "cluster_name" : "my-application",
  "cluster_uuid" : "AI4GCa3zTw-Rsl76Vi4osA",
  "version" : {
    "number" : "8.12.2",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "48a287ab9497e852de30327444b0809e55d46466",
    "build_date" : "2024-02-19T10:04:32.774273190Z",
    "build_snapshot" : false,
    "lucene_version" : "9.9.2",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

### 3. kibana访问

* kibana登录
![kibana登录](/uploads/2024/11/19/33a687876a464d91879f8516a8a34978.png)

* 测试返回
![kibana访问](/uploads/2024/11/19/90a374c91b17dd618ead37a473e68dee.png)
