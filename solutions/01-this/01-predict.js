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
    answer: '无名',
    // 💡 this 由「调用方式」决定，而不是「定义位置」。getName() 是独立调用，严格模式下 this 为 undefined。
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
    answer: '无名-A,无名-B',
    // 💡 map 内部以普通函数方式调用回调，回调里的 this 与外层 list 的 this 无关。
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
    answer: '旗舰店-A,旗舰店-B',
    // 💡 map/forEach/filter 等支持第二个参数 thisArg，用于指定回调的 this。
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
    answer: '无名',
    // 💡 箭头函数没有自己的 this，取「定义时外层函数」的 this。对象字面量不构成作用域，外层是 run()，而 run 的 this 是 undefined。
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
    answer: '旗舰店',
    // 💡 inner 继承 getNameLater 的 this，而 getNameLater 以 shop.getNameLater() 调用，this 是 shop。
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
    answer: 'A',
    // 💡 bind 返回的函数 this 已被永久固定，再次 bind / call / apply 都改不了（只有 new 能覆盖）。
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
    answer: 'Y',
    // 💡 优先级：new 绑定 > 显式绑定(bind/call/apply) > 隐式绑定(obj.fn()) > 默认绑定。
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
    answer: 'TypeError',
    // 💡 class 内部总是严格模式，脱离实例调用时 this 为 undefined，读取 undefined.count 抛 TypeError。
    //    这就是 React 类组件里需要 this.handleClick = this.handleClick.bind(this) 的原因。
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
    answer: 2,
    // 💡 class 字段在构造时于实例上创建，箭头函数捕获的 this 就是该实例。代价：每个实例一份函数，且不在原型上。
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
    answer: '无名',
    // 💡 (0, obj.fn) 先求值得到一个「纯函数值」，丢失了引用上的 base 对象，于是变成默认绑定。
    //    打包工具（如 Babel/webpack）输出的代码里常见这种写法，用于刻意去掉 this。
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
    answer: 'shop',
    // 💡 隐式绑定只看「点号左边最近的那个对象」。
  },
];
