/**
* @fileoverview 创建module类
* @author  liweitao
*/

'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var inquirer = require('inquirer');
var uuid = require('uuid');

var Base = require('../base');
var Util = require('../../util');

var MModule = Base.extend({
  /**
   * @constructor
   * @param {Object} options
   * @param {String} [options.appName] - 项目名称
   * @param {String} [options.moduleName] - 模块名称
   * @param {String} [options.author] - 作者
   * @param {String} [options.moduleDescription] - 模块描述
   * @param {Boolean} [options.sass] - 是否使用sass
   * @param {Boolean} [options.less] - 是否使用less
   */
  construct: function (options) {
    this.conf = _.assign({
      appName: null,
      moduleName: null,
      author: null,
      moduleDescription: null,
      date: null
    }, options);
    this.super.apply(this, arguments);
    this.init();
  },

  /**
   * @description 初始化
   */
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
   * @description 输出询问信息
   * @param {Function} cb - 输入完后的回调
   */
  talk: function (cb) {
    var prompts = [];
    var conf = this.conf;
    if (typeof conf.moduleName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'moduleName',
        message: '告诉我模块名称吧~',
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
    if (!this.userName) {
      prompts.push({
        type: 'input',
        name: 'author',
        message: '雁过留声，人过留名~~'
      });
    }

    if (typeof conf.moduleDescription !== 'string') {
      prompts.push({
        type: 'input',
        name: 'moduleDescription',
        message: '这个模块是干什么的呢？',
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
        }, {
          name: 'Less',
          value: 'less'
        }, {
          name: '不需要',
          value: 'none'
        }]
      });
    }

    inquirer.prompt(prompts, function(answers) {
      var appConf = require(this.appConfPath);
      if (!answers.author) {
        answers.author = this.userName;
      }
      this.gConfig.user_name = answers.author;
      if (this.needSetUsername) {
        Util.setConfig(this.gConfig);
      }
      if (conf.sass) {
        answers.cssPretreatment = 'sass';
      } else if (conf.less) {
        answers.cssPretreatment = 'less';
      }
      _.assign(this.conf, answers);
      this.conf.appName = appConf.app;
      this.conf.moduleDescription = this.conf.moduleDescription || '';
      this.write(cb);
    }.bind(this));
  },

  /**
   * @description 创建目录，拷贝模板
   * @param {Function} cb - 创建完后的回调
   */
  write: function (cb) {
    // 创建目录
    var appConf = require(this.appConfPath);
    var conf = this.conf;
    //-xz160506---
    conf.tmpName = appConf.tmpName || undefined;
    conf.tmpId = appConf.tmpId ? appConf.tmpId : this.getTmpIdByTmpName(conf.tmpName);
    conf.moduleId = uuid.v1();
    this.mkdir(conf.moduleName);
    this.mkdir(conf.moduleName + '/page');
    this.writeGitKeepFile(conf.moduleName + '/page');
    this.mkdir(conf.moduleName + '/static');
    this.mkdir(conf.moduleName + '/static/css');
    this.writeGitKeepFile(conf.moduleName + '/static/css');
    this.mkdir(conf.moduleName + '/static/images');
    this.writeGitKeepFile(conf.moduleName + '/static/images');
    this.mkdir(conf.moduleName + '/static/js');
    this.writeGitKeepFile(conf.moduleName + '/static/js');
    if (conf.cssPretreatment === 'sass') {
      this.mkdir(conf.moduleName + '/static/sass');
      this.writeGitKeepFile(conf.moduleName + '/static/sass');
    } else if (conf.cssPretreatment === 'less') {
      this.mkdir(conf.moduleName + '/static/less');
      this.writeGitKeepFile(conf.moduleName + '/static/less');
    }
    this.mkdir(conf.moduleName + '/widget');
    this.writeGitKeepFile(conf.moduleName + '/widget');
    this.copy({tmpName:conf.tmpName, tmpId:conf.tmpId},'module' ,'_module-conf.js', conf.moduleName + '/module-conf.js');
    this.copy({tmpName:conf.tmpName, tmpId:conf.tmpId},'module' ,'_static-conf.js', conf.moduleName + '/static-conf.js');

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
      console.log(chalk.green('    创建文件:' + conf.moduleName + '/module-conf.js'));
      console.log(chalk.green('    创建文件:' + conf.moduleName + '/static-conf.js'));
      console.log();
      console.log('    ' + chalk.bgGreen('模块' + conf.moduleName + '创建成功！'));
      console.log();
      console.log(chalk.yellow('    请执行 cd ' + conf.moduleName + ' 进入到模块下开始工作吧！'));
      console.log();
    }.bind(this));
  },

  /**
   * @description 创建项目
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
