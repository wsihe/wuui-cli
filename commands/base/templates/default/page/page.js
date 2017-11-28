/**
 * @author <%= conf.author %>
 * @date <%= conf.date %>
 * @desc <%= conf.description %>
 */

import utils from '@/app/common/utils'
import rest from '@/app/rest/rest'
import Control from '@/app/base/control'

var <%= conf.pageName %> = Control.extend({

  onCreate: function (params) {
    var options = {
      el: this.el,
      data: {

      },
      methods: {
        handleClick: this.handleClick.bind(this),
      }
    };
    this.proxy(options)
    this.vm = new Vue(options)
    this.init()
  },

  init () {

  },

  handleClick () {

  }

})

export default <%= conf.pageName %>

