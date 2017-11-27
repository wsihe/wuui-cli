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
   * @param {Boolean} [options.sass] - 是否使用sass
   */
  construct: function (options) {
    this.conf = _.assign({
      pageName: null
    }, options);
    this.super.apply(this, arguments);
    this.init();
  },

  init: function () {
    var userHome = Util.homedir();
    this.userName = process.env.USER || path.basename(userHome)
    this.appConfPath = this.destinationPath('..', 'app-conf.js')
    console.log(chalk.magenta(this.userName + '开始创建页面！'))
  },

  /**
   * @desc 输出询问信息
   * @param {Function} cb - 回调
   */
  talk: function (cb) {
    var prompts = [];
    var conf = this.conf;
    // this.moduleConf = require(this.destinationPath('module-conf'));
    if (typeof conf.pageName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'pageName',
        message: '请输入页面名字！',
        validate: function(input) {
          if (!input) {
            return '页面名字不能为空~';
          }
          if (exists(this.destinationPath('page', input))) {
            return '页面已经存在当前模块page目录中了，换个名字~';
          }
          return true;
        }.bind(this)
      });
    } else if (exists(this.destinationPath('page', conf.pageName))) {
      prompts.push({
        type: 'input',
        name: 'pageName',
        message: '页面已经存在当前模块page目录中了，换个名字吧~',
        validate: function(input) {
          if (!input) {
            return '不能为空哦，会让人家很为难的~';
          }
          if (exists(this.destinationPath('page', input))) {
            return '页面已经存在当前模块page目录中了，换个名字吧~';
          }
          return true;
        }.bind(this)
      });
    }

    if (conf.sass === undefined && conf.less === undefined) {
      prompts.push({
        type: 'list',
        name: 'cssPretreatment',
        message: '想使用什么css预处理器呢？',
        choices: [{
          name: 'Sass/Compass',
          value: 'sass'
        },{
          name: '不需要',
          value: 'none'
        }]
      });
    }

    inquirer.prompt(prompts).then((answers) => {
      answers.author = this.userName
      if (conf.sass) {
        answers.cssPretreatment = 'sass'
      }
      _.assign(this.conf, answers)
      this.conf.date = ((new Date()).getFullYear()) + '-' + ((new Date()).getMonth() + 1) + '-' + ((new Date()).getDate());
      // this.conf.modName = this.moduleConf.module;
      // this.conf.modClassName = Util.classify(this.conf.modName);
      this.conf.secondaryDomain = 's';
      this.write(cb);
    })
  },

  /**
   * @desc 创建目录，拷贝模板
   * @param {Function} cb - 回调
   */
  write: function (cb) {
    // 创建目录
    var conf = this.conf;

    // var appConf = require(this.appConfPath);
    // var conf = this.conf;
    // conf.tmpName = appConf.tmpName || undefined;
    // conf.tmpId = appConf.tmpId ? appConf.tmpId : this.getTmpIdByTmpName(conf.tmpName)
    //

    var conf = this.conf
    conf.tmpName = undefined
    conf.tmpId = this.getTmpIdByTmpName(conf.tmpName)

    var pageName = conf.pageName
    var cssFileName = ''
    this.mkdir('page/' + pageName);
    this.template(conf.tmpId , 'page' , 'page.html', 'page/' + pageName + '/' + pageName + '.html', this, {
      delimiter: '$'
    });
    if (conf.cssPretreatment === 'sass') {
      cssFileName = 'page/' + pageName + '/' + pageName + '.scss';
    }
    this.copy({tmpName:conf.tmpName, tmpId:conf.tmpId}, 'page' , 'page.css', cssFileName);
    this.copy({tmpName:conf.tmpName, tmpId:conf.tmpId}, 'page' , 'page.js', 'page/' + pageName + '/' + pageName + '.js');

    this.fs.commit(function () {
      if (typeof cb === 'function') {
        cb(pageName);
      }
      console.log(chalk.green('    创建文件:' + 'page/' + pageName + '/' + pageName + '.html'));
      console.log(chalk.green('    创建文件:' + cssFileName));
      console.log(chalk.green('    创建文件:' + 'page/' + pageName + '/' + pageName + '.js'));
      console.log();
      console.log('    ' + chalk.bgGreen('页面' + pageName + '创建成功！'));
      console.log();
    }.bind(this));
  },

  /**
   * @desc 创建项目
   * @param {Function} cb - 回调
   */
  create: function (cb) {
    var that = this;
    this.getRemoteConf(function(){
      that.talk(cb);
    });
  }
});

module.exports = Page;