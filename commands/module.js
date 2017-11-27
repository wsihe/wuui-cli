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
   * @param {String} [options.moduleDescription] - 模块描述
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
    this.gConfig = Util.getConfig();
    var userHome = Util.homedir();
    if (this.gConfig.user_name) {
      this.userName = this.gConfig.user_name;
    } else {
      this.needSetUsername = true;
      this.userName = process.env.USER || path.basename(userHome);
    }
    this.appConfPath = this.destinationPath('app-conf.js');
    console.log(chalk.magenta(this.userName + '开始创建模块!'));
  },

  /**
   * @desc 输出询问信息
   * @param {Function} cb - 输入完后的回调
   */
  talk: function (cb) {
    var prompts = [];
    var conf = this.conf;
    if (typeof conf.moduleName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'moduleName',
        message: '+++~',
        validate: function(input) {
          if (!input) {
            return '不能为空哦，会让人家很为难的~';
          }
          if (fs.existsSync(this.destinationPath(input))) {
            return '模块已经存在哦，如果你只想增加页面，请使用 wuui -p 页面名~';
          }
          return true;
        }.bind(this)
      });
    } else if (fs.existsSync(this.destinationPath(conf.moduleName))) {
      prompts.push({
        type: 'input',
        name: 'moduleName',
        message: '模块已经存在哦，换个名字吧~',
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

    inquirer.prompt(prompts, function(answers) {
      if (!answers.author) {
        answers.author = this.userName;
      }
      _.assign(this.conf, answers);
      this.write(cb);
    }.bind(this));
  },

  /**
   * @desc 创建目录，拷贝模板
   * @param {Function} cb - 创建完后的回调
   */
  write: function (cb) {
    // 创建目录
    var appConf = require(this.appConfPath);
    var conf = this.conf;
    conf.tmpName = appConf.tmpName || undefined;
    conf.tmpId = appConf.tmpId ? appConf.tmpId : this.getTmpIdByTmpName(conf.tmpName);
    conf.moduleId = uuid.v1();
    this.mkdir(conf.moduleName);

    this.fs.commit(function () {

      var appConfFile = fs.readFileSync(this.appConfPath);
      var appConfStr = String(appConfFile);
      var appConfStrLines = appConfStr.split('\n');
      var moduleList = appConf.moduleList;
      if (moduleList.indexOf(conf.moduleName) < 0) {
        for (var i = 0; i < appConfStrLines.length; i++) {
          var line = appConfStrLines[i];
          if (line.indexOf('moduleList') >= 0) {
            appConfStrLines[i] = line.split(']')[0];
            if (moduleList.length > 0) {
              appConfStrLines[i] += ', \'' + conf.moduleName + '\'],';
            } else {
              appConfStrLines[i] += '\'' + conf.moduleName + '\'],';
            }
          }
        }
        fs.writeFileSync(this.appConfPath, appConfStrLines.join('\n'));
      }
      if (typeof cb === 'function') {
        cb(conf.moduleName);
      }
      console.log();
      console.log('    ' + chalk.bgGreen('模块' + conf.moduleName + '创建成功！'));
      console.log();
      console.log(chalk.yellow('    请执行 cd ' + conf.moduleName + ' 进入到模块下开始工作吧！'));
      console.log();
    }.bind(this));
  },

  /**
   * @desc 创建项目
   * @param {Function} cb - 创建完后的回调
   */
  create: function (cb) {
    var that = this;
    this.getRemoteConf(function(){
      that.talk(cb);
    });
  }
});

module.exports = MModule;
