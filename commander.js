#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

let triggered = false;

const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta chart="utf-8" />
  <title>Template</title>
</head>
<body>
  <h1>Hello</h1>
  <p>CLI</p>
</body>
</html>`;

const routerTemplate = `const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
   try {
     res.send('ok');
   } catch (error) {
     console.error(error);
     next(error);
   }
});

module.exports = router;`;

const exist = dir => {
  try {
    fs.accessSync(
      dir,
      // 파일 존재 | 일기 가능 | 쓰기 가능 체크
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
    );
    return true; // 이미 존재한다.
  } catch (err) {
    return false;
  }
};

const mkdirp = dir => {
  const dirname = path
    .relative('.', path.normalize(dir))
    .split(path.sep)
    .filter(g => !!g); // 혹시나 배열에 undefined가 있을 경우 제외
  dirname.forEach((d, idx) => {
    const pathBuilder = dirname.slice(0, idx + 1).join(path.sep);
    if (!exist(pathBuilder)) {
      fs.mkdirSync(pathBuilder);
    }
  });
};

const copyFile = (name, directory) => {
  if (exist(name)) {
    mkdirp(directory);
    fs.copyFileSync(name, path.join(directory, name));
    console.log(chalk.green(`${name} 파일이 복사되었습니다.`));
  } else {
    console.error(chalk.red('파일이 존재하지 않습니다.'));
  }
};

const rimraf = pt => {
  if (exist(pt)) {
    try {
      const dir = fs.readdirSync(pt); // 현재 디렉토리 내용을 읽어온다.
      dir.forEach(d => {
        rimraf(path.join(pt, d));
      });
      fs.rmdirSync(pt); // 디렉토리 삭제. (파일일 경우 에러 발생)
      console.log(`${pt} 폴더를 삭제했습니다.`);
    } catch (error) {
      fs.unlinkSync(pt); // 파일 삭제
      console.log(`${pt} 파일을 삭제했습니다.`);
    }
  } else {
    console.error(chalk.red('폴더나 파일이 존재하지 않습니다.'));
  }
};

const makeTemplate = (type, name, directory) => {
  mkdirp(directory);
  if (type === 'html') {
    const pathToFile = path.join(directory, `${name}.html`);
    if (exist(pathToFile)) {
      console.error(chalk.bold.red('이미 해당 파일이 존재합니다.'));
    } else {
      fs.writeFileSync(pathToFile, htmlTemplate);
      console.log(chalk.green(pathToFile, '생성 완료'));
    }
  } else if (type === 'express-router') {
    const pathToFile = path.join(directory, `${name}.js`);
    if (exist(pathToFile)) {
      console.error(chalk.bold.red('이미 해당 파일이 존재합니다.'));
    } else {
      fs.writeFileSync(pathToFile, routerTemplate);
      console.log(chalk.green(pathToFile, '생성 완료'));
    }
  } else {
    console.error('html 또는 express-router 둘 중 하나를 입력하세요');
  }
};

// * ---------------------------------------------------------------------------------------

program.version('0.0.1', '-v, --version').usage('[options]');

program
  .command('template <type>')
  .usage('--name <name> --path [path]')
  .description('템플릿을 생성합니다.')
  .alias('templ')
  .option('-n, --name <name>', '파일명을 입력하세요.', 'index')
  .option('-d, --directory [path]', '생성 경로를 입력하세요.', '.')
  .action((type, options) => {
    makeTemplate(type, options.name, options.directory);
    triggered = true;
  });

program
  .command('copy <name> <directory>')
  .usage('<name> <directory>')
  .description('파일을 복사합니다.')
  .action((name, directory) => {
    copyFile(name, directory);
    triggered = true;
  });

program
  .command('rimraf <path>')
  .usage('<path>')
  .description('폴더나 파일을 삭제합니다.')
  .action(path => {
    rimraf(path);
    triggered = true;
  });

program.command('*', { noHelp: true }).action(() => {
  console.log('해당 명령어를 찾을 수 없습니다.');
  program.help();
  triggered = true;
});

program.parse(process.argv);

if (!triggered) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'type',
        message: '템플릿 종류를 선택하세요.',
        choices: ['html', 'express-router'],
      },
      {
        type: 'input',
        name: 'name',
        message: '파일의 이름을 입력하세요.',
        default: 'index',
      },
      {
        type: 'input',
        name: 'directory',
        message: '파일이 위치할 폴더의 경로를 입력하세요.',
        defualt: '.',
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: '생성하시겠습니까?',
      },
    ])
    .then(answer => {
      if (answer.confirm) {
        makeTemplate(answer.type, answer.name, answer.directory);
        console.log(chalk.rgb(128, 128, 128)('터미널을 종료합니다.'));
      }
    });
}
