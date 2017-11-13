const { prompt } = require('inquirer')
const chalk = require('chalk')
const download = require('download-git-repo')
const ora = require('ora')

let tplList = require(`${__dirname}/../templates`)

console.log(chalk.green(`欢迎，使用wuui-cli初始化项目！`));

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
    type: "list",
    name: "module",
    message: "请选择模版：",
    choices: Object.keys(tplList),
    filter: function (val) {
      return tplList[val]
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
  const gitPlace = module['owner/name']
  const gitBranch = module['branch']
  const spinner = ora('正在下载模板，请稍后...')

  spinner.start()

  download(`${gitPlace}#${gitBranch}`, `${place}/${project}`, (err) => {
    if (err) {
      console.log(chalk.red(err))
      process.exit()
    }
    spinner.stop()
    console.log(chalk.green('恭喜，新项目生成成功 successfully!'))
  })
})