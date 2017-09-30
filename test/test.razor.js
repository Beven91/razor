const path = require('path');
const chai = require('chai');
const Razor = require('../index.js');

describe('node-razor', () => {

    //--------------Dante.date.ensureArray--------------------->
    it('layout', () => {

        const razorOptions = {
            //默认使用的母版页
            layout: 'layout',
            //母版页的查找目录
            layoutDir: path.resolve('views/layout'),
        }

        const render = Razor(razorOptions);

        const view = {
            ext: '.vash',
            root: path.resolve('views')
        }

        const options = {
            settings: {
                'view engine': 'vash'
            },
            users: [
                { name: '张三', age: 20 }
            ]
        }

        render.call(view, path.resolve('views/home/index.vash'), options, (err, html) => {
            if (!err) {
                console.log(html);
            }

            chai.assert.ifError(err)
        })
    })
});