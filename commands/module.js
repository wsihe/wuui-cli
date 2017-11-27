/**
* @fileoverview 创建module类
* @author  river
*/

'use strict';

var _ = require('lodash')
var fs = require('fs')
var path = require('path')
var chalk = require('chalk')
var inquirer = require('inquirer')
var uuid = require('uuid')

var Base = require('./base/base')
var Util = require('../libs/index')

var MModule = Base.extend({
  /**
   * @constructor
   * @param {Object} options
   * @param {String} [options.moduleName] - 模块名称
   */
  construct: function (options) {
    this.conf = _.assign({
      moduleName: null,
      date: null
    }, options);
    this.super.apply(this, arguments);
    this.init();
  },

  init: function () {
    this.userName = process.env.USER || path.basename(userHome);
    console.log(chalk.magenta(this.userName + '开始创建模块!'));
  },

  /**
   * @desc 输出询问信息
   * @param {Function} cb - 回调
   */
  talk: function (cb) {
    var prompts = [];
    var conf = this.conf;
    if (typeof conf.moduleName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'moduleName',
        message: '请输入模块的名字！',
        validate: function(input) {
          if (!input) {
            return '模块的名字不能为空！';
          }
          if (fs.existsSync(this.destinationPath(input))) {
            return '模块已经存在，如果你只想增加页面，请使用 wuui -p 页面名~';
          }
          return true;
        }.bind(this)
      });
    } else if (fs.existsSync(this.destinationPath(conf.moduleName))) {
      prompts.push({
        type: 'input',
        name: 'moduleName',
        message: '模块已经存在，会在该模块下直接创建页面~',
        validate: function(input) {
          if (!input) {
            return '不能为空哦，会让人家很为难的~';
          }
          if (fs.existsSync(this.destinationPath(input))) {
            return '模块已经存在哦，换个名字吧~';
          }
          return true;
        }.bind(this)
      });
    }

    inquirer.prompt(prompts).then((answers) => {
      if (!answers.author) {
        answers.author = this.userName;
      }
      _.assign(this.conf, answers);
      this.write(cb);
    })
  },

  /**
   * @desc 创建目录
   * @param {Function} cb - 回调
   */
  write: function (cb) {
    var conf = this.conf;
    conf.moduleId = uuid.v1();
    this.mkdir(conf.moduleName);

    this.fs.commit(function () {
      if (typeof cb === 'function') {
        cb(conf.moduleName);
      }
      console.log()
      console.log('    ' + chalk.bgGreen('模块' + conf.moduleName + '创建成功！'));
      console.log()
      console.log(chalk.yellow('    请执行 cd ' + conf.moduleName + ' 进入到模块下开始工作吧！'));
      console.log()
    }.bind(this))
  },

  /**
   * @desc 创建项目
   * @param {Function} cb - 创建完后的回调
   */
  create: function (cb) {
    var that = this;
    that.talk(cb);
  }
});

module.exports = MModule;
