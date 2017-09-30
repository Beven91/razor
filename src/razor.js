/**
 *  扩展vash 主要用于变更vash的layout书写方式
 * 
 *  const razor = require('./razor.js')
 *  const app = express();
 *  
 *  app.engine('razor',razor({
 *      layout:'layout', //默认layout
 *      layoutDir:path.resolve('views/layout'), //母版页存放目录
 *  })) 
 * 
 *  app.set('view engine','razor')
 *  app.set('views',path.resolve('views'))
 *   
 *  app.get('/',(req,res,next)=>{
 *      res.render('index',{title:'xxx',layout:'xxx'})
 *      //或者使用默认layout
 *      res.render('index',{title:'xxx'})
 *  })
 */

const vash = require('vash');
const path = require('path');
const fs = require('fs');

const BODY = '@@body@@';

class Razor {

    /**
     * razor视图构造函数
     * @param {Object} options 配置参数 
     */
    constructor(options) {
        this.viewOptions = options;
        const rz = this;
        vash.loadFile = this.loadFile.bind(this);
        vash.helpers.renderBody = function(){
            return this.block(BODY)
        }
        //这里返回普通匿名函数 而非箭头函数 用于使用this指向view
        return function (filepath, options, callback) {
            return rz.renderFile(this, filepath, options, callback);
        }
    }

    /**
     * 渲染视图
     * @param {View} view 视图对象
     * @param {String} filepath 要渲染的视图路径
     * @param {Object} options 渲染参数
     * @param {Function} callback 回调函数
     */
    renderFile(view, filepath, options, callback) {
        const layout = this.findLayout(view, filepath, options);
        vash.loadFile(filepath, options, function (err, tpl) {
            // auto setup an `onRenderEnd` callback to seal the layout
            var prevORE = options.onRenderEnd;
            callback(err, !err && tpl(options, function (err, ctx) {
                ctx.finishLayout()
                if (prevORE) prevORE(err, ctx);
            }));
        }, layout)
    }


    /**
     * 加载指定视图文件，并且附加对应的layout母版页
     * @param {String} filepath 要渲染的视图路径
     * @param {Object} options 渲染参数
     * @param {Function} callback 回调函数
     * @param {String} layout 母版页
     */
    loadFile(filepath, options, callback, layout) {
        let tpl;
        options = Object.assign({}, vash.config, options || {});
        if (options.settings && options.settings.views) {
            filepath = path.normalize(filepath);
            if (filepath.indexOf(path.normalize(options.settings.views)) === -1) {
                filepath = path.join(options.settings.views, filepath);
            }
            if (!path.extname(filepath)) {
                filepath += '.' + (options.settings['view engine'] || 'vash')
            }
        }
        try {
            const content = this.getViewContent(filepath, layout, options);
            tpl = options.cache
                ? vash.helpers.tplcache[filepath] || (vash.helpers.tplcache[filepath] = vash.compile(content))
                : vash.compile(content)
            callback(null, tpl);
        } catch (e) {
            callback(e, null);
        }
    }

    /**
     * 查找layout
     * @param {View} view 视图对象
     * @param {String} filepath 要渲染的视图路径
     * @param {Object} options 渲染参数
     */
    findLayout(view, filepath, options) {
        const optionLayout = options.layout;
        const layout = optionLayout === null ? null : optionLayout || this.viewOptions.layout;
        const layoutDir = this.viewOptions.layoutDir || view.root;
        const layoutPath = path.join(layoutDir, layout + view.ext);

        if (layout && !fs.existsSync(layoutPath)) {
            throw new Error(`Cannot find layout:${layout}`)
        }
        if(layout){
            return path.relative(view.root, layoutPath).replace(/\\/g,'/');
        }
    }

    /**
     * 获取视图
     * @param {String} filepath 要渲染的视图路径
     * @param {String} layout 母版页
     * @param {Object} options 渲染参数
     */
    getViewContent(filepath, layout, options) {
        const body = fs.readFileSync(filepath, 'utf8');
        if (layout) {
            return `
            @html.extend('${layout}', function(model){
                @html.block('${BODY}', function(model){
                    ${body}
                })
            })`;
        } else {
            return body;
        }
    }
}

module.exports = (options) => new Razor(options)