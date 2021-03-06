/**
 * @desc 创建control类
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

class Control extends Base {
  /**
   * @constructor
   * @param {Object} options
   * @param {String} [options.pageName] - 页面名称
   * @param {Boolean} [options.styl] - 是否使用styl
   */
  constructor (options) {
    super()
    this.conf = _.assign({
      controlName: null
    }, options)
    this.init()
  }

  init () {
    var userHome = Util.homedir();
    this.userName = process.env.USER || path.basename(userHome)
  }

  /**
   * @desc 输出询问信息
   * @param {Function} cb - 回调
   */
  talk (cb) {

    var questions = []
    var conf = this.conf
    var _this = this
    this.fileUrl = 'src/app/controls'

    if (typeof conf.controlName !== 'string') {
      questions.push({
        type: 'input',
        name: 'controlName',
        message: '请输入控件名字:',
        validate: function(input) {
          if (!input) {
            return '控件名字不能为空~'
          }

          if (exists(_this.destinationPath(_this.fileUrl, input))) {
            return `控件已存在${this.fileUrl}目录中了，换个名字~`
          }
          return true;
        }
      })
    } else if (exists(_this.destinationPath(_this.fileUrl, conf.controlName))) {
      questions.push({
        type: 'input',
        name: 'controlName',
        message: `控件已存在${_this.fileUrl}目录中了，换个名字:`,
        validate: function(input) {
          if (!input) {
            return '控件名字不能为空~';
          }
          if (exists(_this.destinationPath(_this.fileUrl, input))) {
            return `控件已存在${_this.fileUrl}目录中了，换个名字~`
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
      this.conf.mName = Util.classify(this.conf.controlName)
      this.conf.secondaryDomain = 's'
      this.write(cb)
    })
  }

  /**
   * @desc 创建目录，拷贝模板
   * @param {Function} cb - 回调
   */
  write (cb) {

    var conf = this.conf
    conf.tmpName = undefined
    conf.tmpId = this.getTmpIdByTmpName(conf.tmpName)

    var controlName = conf.controlName
    var cssFileName = ''
    var fileUrl = this.fileUrl
    var pageUrl = `${fileUrl}/${controlName}/${controlName}`
    this.mkdir(`${fileUrl}/${controlName}`)
    this.template(conf.tmpId , 'control' , 'control.jade', `${pageUrl}.jade`, this, {
      delimiter: '$'
    })
    if (conf.cssPretreatment === 'styl') {
      cssFileName = `${pageUrl}.styl`
      this.copy({tmpName:conf.tmpName, tmpId:conf.tmpId}, 'control' , 'control.css', `${pageUrl}.styl`)
    }
    this.copy({tmpName:conf.tmpName, tmpId:conf.tmpId}, 'control' , 'control.js', `${pageUrl}.js`)

    this.fs.commit(function () {
      if (typeof cb === 'function') {
        cb(controlName)
      }
      console.log()
      console.log(chalk.green(`    创建文件: ${pageUrl}.jade`))
      console.log(chalk.green(`    创建文件: ${cssFileName}`))
      console.log(chalk.green(`    创建文件: ${pageUrl}.js`))
      console.log()
      console.log('    ' + chalk.magenta(`控件${controlName} 创建成功！`))
      console.log()
    }.bind(this))
  }

  /**
   * @desc 创建项目
   * @param {Function} cb - 回调
   */
  create (cb) {
    var that = this
    this.getLocalConf(function(){
      that.talk(cb)
    })
  }
}

module.exports = Control