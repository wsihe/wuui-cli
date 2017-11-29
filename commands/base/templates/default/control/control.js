/**
 * @author <%= conf.author %>
 * @date <%= conf.date %>
 * @desc <%= conf.description %>
 */

(function (Asset) {
  "use strict";
  var utils = Asset.utils;
  var Control = Asset.Control;

  var <%= conf.mName %>Panel = Control.extend({
    vm: null,

    onCreate: function (params) {
      var text = params.text;
      this.vm = new Vue({
        el: this.el,
        data: {
          text: text || ""
        },
        methods: {
          close: this.destroy.bind(this),
          confirm: this.confirm.bind(this)
        },
        watch: {
          text: this.onTextChanged.bind(this)
        }
      });
    },

    onTextChanged: function () {
      this.trigger("text:changed", this.vm.text);
    },

    confirm: function () {
      this.setResult(RESULT_OK, this.vm.text);
      this.destroy();
    }

  });

  Asset.<%= conf.mName %>Panel = <%= conf.mName %>Panel;
})(window.Asset);


