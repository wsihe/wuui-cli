const path = require('path');
const fs = require('fs');
const os = require('os');
const url = require('url');
const _ = require('lodash');
const chalk = require('chalk');


var Util = {
  // 一些正则
  regexps: {
    // 空格
    blank: /(^\s+)|(\s+$)/g,
    // 注释
    comment: /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm,
    // 图片
    images: /\.(jpeg|jpg|gif|png|webp)$/,
    // url
    url: /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i,
    // media
    media: /\.(jpeg|jpg|gif|png|webp|ico|mp3|mp4|oog|wav|eot|svg|ttf|woff|woff2|TTF|otf|OTF|json)$/,
    tpl: /\.(html|php|vm)$/,
    js: /\.js$/,
    css: /\.css$/,
    singleBraceInterpolate: /{([\s\S]+?)}/g,
    doubleBraceInterpolate: /{{([\s\S]+?)}}/g,
    htmlTag: /(<([^>]+)>)/ig,
    require: /(?:(?:var|const)\s*(.*?)\s*=\s*)?require\(['"]([^'"]+)['"](?:, ['"]([^'"]+)['"])?\);?/g,
    requireAsync: /require.async\(\[?((?:['"][^'"]+['"],?\s?)*)\]?\s?,\s?(?:function\s?\((.*)\))?/g,
    useStrict: /(\/\/.*\r?\n)*['"]use strict['"];?/g
  },

  // 缓存目录名
  CACHE: '.cache',

  // 获取目录
  getWuuiPath: function () {
    var wuuiPath = path.join(this.homedir(), 'wuui-cli');
    if (!this.existsSync(wuuiPath)) {
      fs.mkdirSync(wuuiPath);
    }
    return wuuiPath;
  },

  // 获取用户目录
  homedir: function () {
    function homedir() {
      var env = process.env;
      var home = env.HOME;
      var user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

      if (process.platform === 'win32') {
        return env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || null;
      }

      if (process.platform === 'darwin') {
        return home || (user ? '/Users/' + user : null);
      }

      if (process.platform === 'linux') {
        return home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : null));
      }

      return home || null;
    }
    return typeof os.homedir === 'function' ? os.homedir : homedir;
  } (),

  //获取根目录
  getRootPath: function () {
    return path.resolve(__dirname, '../');
  },

  // 转换字符串
  makeString: function (object) {
    if (object == null) {
      return '';
    }
    return '' + object;
  },

  // 首字母大写
  classify: function (str) {
    str = Util.makeString(str);
    return _.capitalize(_.camelCase(str.replace(/[\W_]/g, ' ')).replace(/\s/g, ''));
  },

  // 获取package.json
  getPkgInfo: function () {
    var info = {};
    try {
      info = JSON.parse(String(fs.readFileSync(path.join(this.getRootPath(), 'package.json'))));
    } catch (e) {
      console.log('  读取package.json出错！');
    }
    return info;
  },

  // 获取配置
  getConfig: function () {
    var configPath = path.join(this.getWuuiPath(), 'config.json');
    var config = {};
    if (this.existsSync(configPath)) {
      try {
        config = JSON.parse(String(fs.readFileSync(configPath)));
      } catch (e) {
        config = {};
      }
    }
    return config;
  },

  // 写入配置
  setConfig: function (config) {
    var wuuiPath = this.getWuuiPath();
    if (typeof config === 'object') {
      fs.writeFileSync(path.join(wuuiPath, 'config.json'), JSON.stringify(config, null, 2));
    }
  },

  // 获取设置
  getSetting: function () {
    var settingPath = path.join(this.getRootPath(), '.setting.json');
    var setting = {};
    if (fs.existsSync(settingPath)) {
      try {
        setting = JSON.parse(String(fs.readFileSync(settingPath)));
      } catch (e) {
        setting = {};
      }
    }
    return setting;
  },

  // 写入配置
  setSetting: function (setting) {
    if (typeof setting === 'object') {
      fs.writeFileSync(path.join(this.getRootPath(), '.setting.json'), JSON.stringify(setting, null, 2));
    }
  },


  // 降版本号分割成可比较的数组
  splitVersion: function (version) {
    version = version.replace(/(\d+)([^\d\.]+)/, '$1.$2');
    version = version.replace(/([^\d\.]+)(\d+)/, '$1.$2');
    var parts = version.split('.');
    var rmap = {
      'rc': -1,
      'pre': -2,
      'beta': -3,
      'b': -3,
      'alpha': -4,
      'a': -4
    };
    var v, n;
    var splits = [];
    for (var i = 0; i < parts.length; ++i) {
      v = parts[i];
      n = parseInt(v, 10);
      if (isNaN(n)) {
        n = rmap[v] || -1;
      }
      splits.push(n);
    }
    return splits;
  },

  // 比较版本号数组，结果0表示两个版本一致，-1表示version2更旧，1表示version2更新
  compareVersion: function (version1, version2) {
    version1 = this.splitVersion(version1);
    version2 = this.splitVersion(version2);
    var v1, v2;
    for (var i = 0; i < Math.max(version1.length, version2.length); ++i) {
      v1 = version1[i] || 0;
      v2 = version2[i] || 0;
      if (v2 > v1) {
        return 1;
      }
      if (v1 > v2) {
        return -1;
      }
    }
    return 0;
  },

  // 由于fs.existsSync 将会被废弃，重写
  existsSync: function (fPath) {
    try {
      var stats = fs.statSync(fPath);
      return (stats.isFile() || stats.isDirectory());
    } catch (err) {
      return false;
    }
  },


  //Inspect anything.
  inspect: function () {
    var _args = [].slice.call(arguments);
    console.log(_args.map(function (v, k) {
      var __str,
          __owner = v,
          __inspect = __owner && __owner.inspect;
      if (__inspect) {
        while (1) {
          if (__owner == null || __owner.hasOwnProperty('inspect'))
            break;
          __owner = __owner.__proto__;
        }
        __owner.inspect = null;
      }
      __str = util.inspect(v, {
        showHidden: true,
        colors: true,
        depth: null
      });
      if (__inspect)
        __owner.inspect = __inspect;
      return __str;
    }).join(' '));
  }

};

module.exports = Util;
