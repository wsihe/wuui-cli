# wuui-cli

> wuui-cli node命令行辅助小工具，可生成模块、页面、控件文件结构


### 1.添加 page 页面

```
wuui page [pageName]

wuui page --name [pageName] --path [moduleName] --styl

```
简写：

```
wuui p [pageName]

wuui p --name [pageName] --path [moduleName] --styl

```

参数 --name 指定页面名称

参数 --path 指定页面生成的位置

参数 --styl 指定页面使用 styl

每个参数都是可缺省的!

#### 场景一

执行：wuui p pageName

不选择模块，会在pages直接目录下生成文件，生成的文件结构如下：
```
    ├── pages                         - 所有页面总目录
   	│   ├── pageName              - 某一页面目录
    │       ├── pageName.jade       - 页面html
    │       ├── pageName.js         - 页面级js
    │       ├── pageName.styl       - 页面级css
```

#### 场景二

执行：wuui p --name pageName --path moduleName --styl

添加模块或者路径，可以在指定目录下生成文件，生成的文件结构如下：
```
    ├── pages                     - 所有页面总目录
    │   ├── moduleName            - 某一模块目录
    │       ├── pageName          - 某一页面目录
    │           ├── page.html       - 页面html
    │           ├── page.js         - 页面级js
    │           ├── page.styl       - 页面级css
```

### 2.添加 controls 控件

```
wuui control --name [controlName]

wuui c [controlName]

```

参数 --name 指定控件名称

参数 --styl 指定控件使用 styl

每个参数都是可缺省的!

执行 wuui c controlName ，生成的文件结构如下：

```
    ├── controls                        - 所有控件总目录
   	│   ├── controlName              - 某一控件目录
    │       ├── controlName.jade       - 控件html
    │       ├── controlName.js         - 控件级js
    │       ├── controlName.styl       - 控件级css
```

