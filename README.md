# razor

[![NPM version][npm-image]][npm-url]

## 一、简介

基于 <a href="https://github.com/kirbysayshi/vash">`vash`</a> 扩展的`razor`视图引擎

视图引擎语法文档:<a href="https://github.com/kirbysayshi/vash">`vash`</a>

`visual studio code` 高亮语法插件(执行 `ext install vash` 安装)

## 二 安装

  npm install node-razor

## 三、Express使用

```js

const path = require('path');
const express = require('express');
const razor = require('razor');

const app = express();

const razorOptions = {
  //默认使用的母版页
  layout: 'layout',
  //母版页的查找目录
  layoutDir: path.resolve('api/views/layout'),
}

//添加vash视图引擎
app.engine('vash', razor(razorOptions));
//设置当前使用的默认视图引擎
app.set('view engine', 'vash');
//设置视图查找目录
app.set('views', path.resolve('api/views'));

```

## 四、扩展

### 扩展了母版页的使用方式

* 母版页变动如下

    * 新增 `@html.renderBody()` 用于在(`layout`)母版页中输出具体页面的内容 用于替代`vash`中的 `@html.block('content')` 同时无需在具体页面中指定`@html.block('content', function(model){ ...}` 

    * 将母版页选择改成`express.render('home/index',{ layout:'layout'})` 渲染时指定`layout`参数来分配页面需要使用的母版页 从而不用再具体的页面使用`@html.extend('layout', function(model){ ...}`

* 母版页使用方式如下

> home.controller.js

```js

  app.get('/home/index.html',(req,resp,next){
      resp.render('/home/index',{ layout:'layout' });
  })

```

> /home/index.vash

```html
<h1 class="name">Welcome to </h1>
```

> /layout/layout.vash (母版页)

```html

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>@model.title</title>
        <link rel="stylesheet" href="stylesheets/style.css" type="text/css" media="screen" charset="utf-8">
    </head>
    <body>
        @html.renderBody()
        <footer>
            @html.block('footer')
        </footer>
    </body>
</html>

```

## 五、开源许可

基于 [MIT License](http://zh.wikipedia.org/wiki/MIT_License) 开源，使用代码只需说明来源，或者引用 [license.txt](https://github.com/sofish/typo.css/blob/master/license.txt) 即可。

[npm-url]: https://www.npmjs.com/package/node-razor
[npm-image]: https://img.shields.io/npm/v/node-razor.svg
