/**
 * @desc 创建的基类
 * @author  river
 */
const mkdirp = require('mkdirp')
const memFs = require('mem-fs')
const FileEditor = require('mem-fs-editor')
const path = require('path')
const fs = require('fs')
const del = require('del')
const pathIsAbsolute = require('path-is-absolute')
const pathExists = require('path-exists')
const request = require('request')
const unzip = require('unzip')
const crypto = require('crypto')
const chalk = require('chalk')
const _ = require('lodash')
const Util = require('../../libs/index')

//读取模板缓存
function readCache (path) {
  var _cache = {
    version : 0,
    items : [{
      name : '默认模板',
      _id  : 'default',
      desc : '默认模板'
    }]
  };

  if (!fs.existsSync(path)) {
    writeCache(_cache, path);
  }
  _cache = fs.readFileSync(path,'utf8');
  _cache = JSON.parse(_cache);
  return _cache;
}

// 写入模板缓存
function writeCache (content, _path) {
  fs.writeFileSync(_path, JSON.stringify(content), 'utf8');
}

/**
 * @class Base
 * @classdesc Base类
 */
class Base {

  constructor() {
    this.sharedFs = memFs.create();
    this.fs = FileEditor.create(this.sharedFs);
    this._ = _
    this.sourceRoot(path.join(Util.getWuuiPath(), 'tmp'));
    // 用于缓存模板JSON列表以快速查询
    this.onceReadCache = {waitInit: true};
    this.tmpNameList = [];
  }

  /**
   * @desc 创建目录
   */
  mkdir () {
    mkdirp.sync.apply(mkdirp, arguments);
  }

  /**
   * @desc 资源根路径
   * @param {String} rootPath 资源根目录
   * @return {String} 资源根路径
   */
  sourceRoot (rootPath) {
    if (typeof rootPath === 'string') {
      this._sourceRoot = path.resolve(rootPath);
    }
    if(!fs.existsSync(this._sourceRoot)){
      this.mkdir(this._sourceRoot);
    }
    return this._sourceRoot;
  }

  /**
   * @desc 获取模板路径
   * @return {String} 模板路径
   */
  templatePath () {
    var filepath = path.join.apply(path, arguments);
    if (!pathIsAbsolute(filepath)) {
      filepath = path.join(this.sourceRoot(), 'templates' , filepath);
    }
    return filepath;
  }

  /**
   * @description 获取生成代码的根目录
   * @param {String} rootPath 根目录
   * @return {String} 路径
   */
  destinationRoot (rootPath) {
    if (typeof rootPath === 'string') {
      this._destinationRoot = path.resolve(rootPath);

      if (!pathExists.sync(rootPath)) {
        mkdirp.sync(rootPath);
      }

      process.chdir(rootPath);
    }
    return this._destinationRoot || process.cwd();
  }

  /**
   * @desc 获取生成代码的目标路径
   * @return {String} 路径
   */
  destinationPath () {
    var filepath = path.join.apply(path, arguments);
    if (!pathIsAbsolute(filepath)) {
      filepath = path.join(this.destinationRoot(), filepath);
    }

    return filepath;
  }

  /**
   * @desc 渲染模板
   * @param {String} tmpId 模板ID
   * @param {String} type 创建类型，如app
   * @param {String} source 模板文件名
   * @param {String} dest 生成目标文件路径
   * @param {Object} data 模板数据
   * @param {Object} options 生成选项
   * @return {Object} this
   */
  template (tmpId, type, source, dest, data, options) {
    if (typeof dest !== 'string') {
      options = data;
      data = dest;
      dest = source;
    }
    this.fs.copyTpl(
      this.templatePath(tmpId, type, source),
      this.destinationPath(dest),
      data || this,
      options
    );
    return this;
  }

  /**
   * @desc 拷贝并渲染模板
   * @param {Object} tpl {tmpName, tmpId}
   * @param {String} type 创建类型，如app
   * @param {String} source 模板文件名
   * @param {String} dest 生成目标文件路径
   * @return {Object} this
   */
  copy (tpl, type, source, dest) {
    var tmpId = 'default';
    dest = dest || source;
    if(tpl.tmpName) {
      tmpId = this.getTmpIdByTmpName(tpl.tmpName);
    } else {
      tmpId = tpl.tmpId || tmpId;
    }

    this.template(tmpId, type, source, dest);
    return this;
  }

  /**
   * @desc 获取本地页面配置
   * @param {function} cbk
   * @return {Object} this
   */
  getLocalConf (cbk) {
    var that = this;
    var cache = readCache(path.join(that.sourceRoot(), '_cache.json'))
    that.setDefaultTmp();
    cbk(cache);
  }

  /**
   * @desc 获取远程页面配置
   * @param {function} cbk
   * @return {Object} this
   */
  getRemoteConf (cbk) {
    var that = this;
    var cache = readCache(path.join(that.sourceRoot(), '_cache.json'))
    that.setDefaultTmp();
    cbk(cache);
  }

  /**
   * @desc设置使用默认模板
   */
  setDefaultTmp () {
    var tmpPath = path.join(Util.getWuuiPath(), 'tmp', 'templates');
    if (!Util.existsSync(tmpPath)) {
      this.sourceRoot(path.join(__dirname));
    }
  }

  /**
   * @desc 通过模板名称获取模板ID
   * @param {string} tmpName
   */
  getTmpIdByTmpName (tmpName) {
    if(this.onceReadCache.waitInit) {
      readCache(path.join(this.sourceRoot(), '_cache.json')).items.forEach(function(item) {
        this.onceReadCache[item.name] = item._id;
        this.tmpNameList.push(item.name);
      }.bind(this));
      this.onceReadCache.waitInit = false;
    }
    if (!tmpName) {
      return 'default';
    }
    return this.onceReadCache[tmpName];
  }
}

module.exports = Base;
