#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

let rl;
let type = process.argv[2];
let name = process.argv[3];
let directory = process.argv[4] || '.';

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

// * --------------------------------------------------------------------------------------------------

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

const makeTemplate = () => {
  mkdirp(directory);
  if (type === 'html') {
    const pathToFile = path.join(directory, `${name}.html`);
    if (exist(pathToFile)) {
      console.error('이미 해당 파일이 존재합니다.');
    } else {
      fs.writeFileSync(pathToFile, htmlTemplate);
      console.log(pathToFile, '생성 완료');
    }
  } else if (type === 'express-router') {
    const pathToFile = path.join(directory, `${name}.js`);
    if (exist(pathToFile)) {
      console.error('이미 해당 파일이 존재합니다.');
    } else {
      fs.writeFileSync(pathToFile, routerTemplate);
      console.log(pathToFile, '생성 완료');
    }
  } else {
    console.error('html 또는 express-router 둘 중 하나를 입력하세요');
  }
};

const program = () => {
  if (!type || !name) {
    console.error('사용방법: cli html|express-router 파일명 [생성 경로]');
  } else {
    makeTemplate();
  }
};

program();
