#!/usr/bin/env node
const program = require('commander');
const inquirer = require('inquirer');
const { sequelize, Wallet } = require('./models');
const { version } = require('./package');

let triggered = false;

program.version(version, '-v --version').usage('[options]');

// 수입
program
  .command('revenue <money> <desc>')
  .description('수입을 기록합니다.')
  .action(async (money, desc) => {
    try {
      await sequelize.sync();
      await Wallet.create({
        money: parseInt(money, 10),
        desc,
        type: true,
      });
      console.log(`${money}원을 얻었습니다.`);
      await sequelize.close();
      triggered = true;
    } catch (error) {
      console.error(error);
    }
  });

// 지출
program
  .command('expense <money> <desc>')
  .description('지출을 기록합니다.')
  .action(async (money, desc) => {
    try {
      await sequelize.sync();
      await Wallet.create({
        money: parseInt(money, 10),
        desc,
        type: false,
      });
      console.log(`${money}원을 썼습니다.`);
      await sequelize.close();
      triggered = true;
    } catch (error) {
      console.error(error);
    }
  });

// 잔액
program
  .command('balance')
  .description('잔액을 표시합니다.')
  .action(async () => {
    try {
      // 수입과 지출을 가져온 후 뺀다.
      await sequelize.sync();
      const logs = await Wallet.findAll({});
      const revenue = logs
        .filter(log => log.type === true)
        .reduce((acc, log) => acc + log.money, 0);
      const expense = logs
        .filter(log => log.type === false)
        .reduce((acc, log) => acc + log.money, 0);

      console.log(revenue);
      console.log(expense);
      console.log(`잔액은 ${revenue - expense}원 입니다.`);

      await sequelize.close();
      triggered = true;
    } catch (error) {
      console.error(error);
    }
  });

program.command('*').action(() => {
  console.log('알 수 없는 명령어가 입력되었습니다.');
});

program.parse(process.argv);

if (!triggered) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'type',
        message: '보고자 하는 종류를 선택하세요',
        choices: ['수입', '지출', '잔액'],
      },
      {
        type: 'input',
        name: 'money',
        message: '금액을 입력하세요.',
        default: 0,
        when: answer => answer.type !== '잔액',
      },
      {
        type: 'input',
        name: 'desc',
        message: '설명을 입력하세요.',
        defualt: '.',
        when: answer => answer.type !== '잔액',
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: '생성하시겠습니까?',
      },
    ])
    .then(async answers => {
      if (answers.confirm) {
        if (answers.type === '수입') {
          try {
            await sequelize.sync();
            await Wallet.create({
              money: parseInt(answers.money, 10),
              desc: answers.desc,
              type: true,
            });
            console.log(`${answers.money}원을 얻었습니다.`);
            await sequelize.close();
          } catch (error) {
            console.error(error);
          }
        } else if (answers.type === '지출') {
          try {
            await sequelize.sync();
            await Wallet.create({
              money: parseInt(answers.money, 10),
              desc: answers.desc,
              type: false,
            });
            console.log(`${answers.money}원을 썼습니다.`);
            await sequelize.close();
          } catch (error) {
            console.error(error);
          }
        } else {
          try {
            // 수입과 지출을 가져온 후 뺀다.
            await sequelize.sync();
            const logs = await Wallet.findAll({});
            const revenue = logs
              .filter(log => log.type === true)
              .reduce((acc, log) => acc + log.money, 0);
            const expense = logs
              .filter(log => log.type === false)
              .reduce((acc, log) => acc + log.money, 0);

            console.log(`잔액은 ${revenue - expense}원 입니다.`);
            await sequelize.close();
          } catch (error) {
            console.error(error);
          }
        }
      }
    });
}
