const { prompt } = require('inquirer')
const chalk = require('chalk')
const ora = require('ora')

const question = [
  {
    type: 'input',
    name: 'project',
    message: '请输入生成项目名:',
    validate (val) {
      if (val !== '') {
        return true
      }
      return '请填写正确的项目名!'
    }
  },
  {
    type: 'input',
    name: 'place',
    message: '项目初始化的位置:',
    default: './'
  }
]

module.exports = prompt(question).then(({ project, module, place }) => {

})