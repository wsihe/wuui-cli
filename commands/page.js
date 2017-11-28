/**
 * @desc 创建page类
 * @author  river
 */

const _ = require('lodash')
const fs = require('fs')
const exists = require('fs').existsSync
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Base = require('./base/base')
const Util = require('../libs/index')

let Page = Base.extend({
  /**
   * @constructor
   * @param {Object} options
   * @param {String} [options.pageName] - 页面名称
   * @param {Boolean} [options.styl] - 是否使用styl
   */
  construct: function (options) {
    this.conf = _.assign({
      moduleName: null,
      pageName: null
    }, options)
    this.super.apply(this, arguments)
    this.init()
  },

  init: function () {
    var userHome = Util.homedir();
    this.userName = process.env.USER || path.basename(userHome)
  },

  /**
   * @desc 输出询问信息
   * @param {Function} cb - 回调
   */
  talk: function (cb) {

    var prompt = []
    var conf = this.conf
    var _this = this
    this.pageFileUrl = 'src/app/pages'

    if(typeof conf.moduleName !== 'string'){
      prompt.push({
        type: 'input',
        name: 'moduleName',
        message: '在指定模块或路径下新建，模块或路径：'
      })
    }
    inquirer.prompt(prompt).then((answers) => {
      var questions = [];
      if(answers.moduleName){
        _this.pageFileUrl = `${_this.pageFileUrl}/${answers.moduleName}`
      }
      if (typeof conf.pageName !== 'string') {
        questions.push({
          type: 'input',
          name: 'pageName',
          message: '请输入页面名字:',
          validate: function(input) {
            if (!input) {
              return '页面名字不能为空~'
            }

            if (exists(_this.destinationPath(_this.pageFileUrl, input))) {
              return `页面已存在${this.pageFileUrl}目录中了，换个名字~`
            }
            return true;
          }
        })
      } else if (exists(_this.destinationPath(_this.pageFileUrl, conf.pageName))) {
        questions.push({
          type: 'input',
          name: 'pageName',
          message: `页面已存在${_this.pageFileUrl}目录中了，换个名字:`,
          validate: function(input) {
            if (!input) {
              return '页面名字不能为空~';
            }
            if (exists(_this.destinationPath(_this.pageFileUrl, input))) {
              return `页面已存在${_this.pageFileUrl}目录中了，换个名字~`
            }
            return true
          }
        })
      }

      if (conf.styl === undefined) {
        questions.push({
          type: 'list',
          name: 'cssPretreatment',
          message: '是否添加css文件:',
          choices: [{
            name: 'Styl',
            value: 'styl'
          },{
            name: '不需要',
            value: 'none'
          }]
        })
      }

      inquirer.prompt(questions).then((answers) => {
        answers.author = this.userName
        if (conf.styl) {
          answers.cssPretreatment = 'styl'
        }
        _.assign(this.conf, answers)
        let date = new Date()
        this.conf.date = (`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`)
        this.conf.secondaryDomain = 's'
        this.write(cb)
      })
    })

  },

  /**
   * @desc 创建目录，拷贝模板
   * @param {Function} cb - 回调
   */
  write: function (cb) {

    var conf = this.conf
    conf.tmpName = undefined
    conf.tmpId = this.getTmpIdByTmpName(conf.tmpName)

    var pageName = conf.pageName
    var cssFileName = ''
    var pageFileUrl = this.pageFileUrl
    var pageUrl = `${pageFileUrl}/${pageName}/${pageName}`
    this.mkdir(`${pageFileUrl}/${pageName}`)
    this.template(conf.tmpId , 'page' , 'page.html', `${pageUrl}.html`, this, {
      delimiter: '$'
    })
    if (conf.cssPretreatment === 'styl') {
      cssFileName = `${pageUrl}.styl`
      this.copy({tmpName:conf.tmpName, tmpId:conf.tmpId}, 'page' , 'page.css', `${pageUrl}.styl`)
    }
    this.copy({tmpName:conf.tmpName, tmpId:conf.tmpId}, 'page' , 'page.js', `${pageUrl}.js`)

    this.fs.commit(function () {
      if (typeof cb === 'function') {
        cb(pageName)
      }
      console.log()
      console.log(chalk.green(`    创建文件: ${pageUrl}.html`))
      console.log(chalk.green(`    创建文件: ${cssFileName}`))
      console.log(chalk.green(`    创建文件: ${pageUrl}.js`))
      console.log()
      console.log('    ' + chalk.magenta(`页面${pageName}创建成功！`))
      console.log()
    }.bind(this))
  },

  /**
   * @desc 创建项目
   * @param {Function} cb - 回调
   */
  create: function (cb) {
    var that = this
    this.getLocalConf(function(){
      that.talk(cb)
    })
  }
});

module.exports = Page