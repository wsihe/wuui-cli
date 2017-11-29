/**
 * @author <%= conf.author %>
 * @date <%= conf.date %>
 * @desc <%= conf.description %>
 */

(function (Asset) {
  'use strict';
  var Page = Asset.Page;
  var utils = Asset.utils;

  var <%= conf.mName %>Page = Page.extend({
    vm: null,

    onCreate: function (params) {
      this.vm = new Vue({
        el: this.el,
        data: {},
        methods: {
          test: this.test.bind(this)
        }
      });

    },

    test: function () {
    }

  });

  Asset.<%= conf.mName %>Page = <%= conf.mName %>Page;
})(window.Asset);