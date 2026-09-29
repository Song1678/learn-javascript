/**
 * 练习 1-1：预测 this 的指向  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 规则：
 *  1. 先「不要运行」，只读代码，把你认为的 run() 返回值填到 answer 里。
 *  2. 如果你认为 run() 会抛出异常，answer 填错误类型名，例如 'TypeError'。
 *  3. 本文件是 ES Module，天然处于严格模式（'use strict'）。
 *  4. 测试会以 `const { run } = q; run()` 的方式调用，所以 run 内部的 this 是 undefined。
 *  5. 注意答案的类型：数字填 2，字符串填 '2'，布尔值填 true。
 */
export const quiz = [
  {
    id: 1,
    title: '方法被赋值给变量后调用',
    run() {
      const shop = {
        name: '旗舰店',
        getName() {
          return this?.name ?? '无名';
        },
      };
      const getName = shop.getName;
      return getName();
    },
    answer: '?',
  },
  {
    id: 2,
    title: '数组回调中的普通函数',
    run() {
      const shop = {
        name: '旗舰店',
        products: ['A', 'B'],
        list() {
          return this.products.map(function (p) {
            return `${this?.name ?? '无名'}-${p}`;
          });
        },
      };
      return shop.list().join(',');
    },
    answer: '?',
  },
  {
    id: 3,
    title: '数组回调 + thisArg',
    run() {
      const shop = {
        name: '旗舰店',
        products: ['A', 'B'],
        list() {
          return this.products.map(function (p) {
            return `${this?.name ?? '无名'}-${p}`;
          }, this);
        },
      };
      return shop.list().join(',');
    },
    answer: '?',
  },
  {
    id: 4,
    title: '对象字面量里的箭头函数',
    run() {
      const shop = {
        name: '旗舰店',
        getName: () => this?.name ?? '无名',
      };
      return shop.getName();
    },
    answer: '?',
  },
  {
    id: 5,
    title: '方法内部的箭头函数',
    run() {
      const shop = {
        name: '旗舰店',
        getNameLater() {
          const inner = () => this.name;
          return inner();
        },
      };
      return shop.getNameLater();
    },
    answer: '?',
  },
  {
    id: 6,
    title: 'bind 两次',
    run() {
      function getName() {
        return this.name;
      }
      const a = getName.bind({ name: 'A' });
      const b = a.bind({ name: 'B' });
      return b();
    },
    answer: '?',
  },
  {
    id: 7,
    title: 'new 与 bind 的优先级',
    run() {
      function Shop(name) {
        this.name = name;
      }
      const BoundShop = Shop.bind({ name: 'X' });
      const s = new BoundShop('Y');
      return s.name;
    },
    answer: '?',
  },
  {
    id: 8,
    title: 'class 方法被解构',
    run() {
      class Counter {
        count = 0;
        inc() {
          this.count++;
          return this.count;
        }
      }
      const c = new Counter();
      const { inc } = c;
      return inc();
    },
    answer: '?',
  },
  {
    id: 9,
    title: 'class 字段箭头函数被解构',
    run() {
      class Counter {
        count = 0;
        inc = () => ++this.count;
      }
      const c = new Counter();
      const { inc } = c;
      inc();
      inc();
      return c.count;
    },
    answer: '?',
  },
  {
    id: 10,
    title: '逗号表达式调用',
    run() {
      const shop = {
        name: '旗舰店',
        getName() {
          return this?.name ?? '无名';
        },
      };
      return (0, shop.getName)();
    },
    answer: '?',
  },
  {
    id: 11,
    title: '多层对象',
    run() {
      const app = {
        name: 'app',
        shop: {
          name: 'shop',
          getName() {
            return this.name;
          },
        },
      };
      return app.shop.getName();
    },
    answer: '?',
  },
];
