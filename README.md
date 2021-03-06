# wuui-cli

> wuui-cli node命令行辅助小工具，可生成模块、页面、控件文件结构

### 全局安装

#### 注意：node版本必须使用 node 6.0.0+ 稳定版

```
npm install -g wuui-cli

```

### 1.添加 page 页面

```
wuui page [pageName]

wuui page --name [pageName] --path [moduleName] --styl

```
简写：

```
wuui p [pageName]

wuui p -n [pageName] -p [moduleName] -s

```
#### 选项参数

##### -n，--name [pageName]
指定控件名称，[pageName]为页面名称

##### -p，--path [moduleName]
指定页面生成的模块／位置，[moduleName]为模块名
[moduleName]也可以为具体模块的位置，支持多层嵌套，以'／'分割，例如:
```
wuui p -n name -p module/product -s
```

##### -s，--styl
指定控件使用 styl

每个参数都是可缺省的!

#### 场景一
```
// 执行：
wuui p pageName
```

不选择模块，会在pages直接目录下生成文件，生成的文件结构如下：
```
    ├── pages                       - 所有页面总目录
    │   ├── pageName                - 某一页面目录
    │       ├── pageName.jade       - 页面html
    │       ├── pageName.js         - 页面级js
    │       ├── pageName.styl       - 页面级css
```

#### 场景二

```
// 执行：
wuui p --name pageName --path moduleName --styl
// 或
wuui p -n pageName -p moduleName -s

 ```

添加模块或者路径，可以在指定目录下生成文件，生成的文件结构如下：
```
    ├── pages                       - 所有页面总目录
    │   ├── moduleName              - 某一模块目录
    │       ├── pageName            - 某一页面目录
    │           ├── page.html       - 页面html
    │           ├── page.js         - 页面级js
    │           ├── page.styl       - 页面级css
```

### 2.添加 controls 控件

```
wuui control --name [controlName]

wuui c [controlName]

```
#### 选项参数

##### -n，--name [controlName]
指定控件名称，controlName为控件名

##### -s，--styl
指定控件使用 styl

每个参数都是可缺省的!
```
// 执行
wuui c controlName
// 或
wuui c -n controlName -s

```
生成的文件结构如下：

```
    ├── controls                       - 所有控件总目录
    │   ├── controlName                - 某一控件目录
    │       ├── controlName.jade       - 控件html
    │       ├── controlName.js         - 控件级js
    │       ├── controlName.styl       - 控件级css
```

### 3.添加 report 文件

待补充...