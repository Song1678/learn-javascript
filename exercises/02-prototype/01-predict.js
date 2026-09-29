/**
 * 练习 2-1：预测原型链相关代码的输出  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 规则同第 01 章：先不运行，把 run() 的返回值填入 answer；会抛错则填错误类型名。
 */
export const quiz = [
  {
    id: 1,
    title: '实例的原型',
    run() {
      function Product(name) {
        this.name = name;
      }
      const p = new Product('键盘');
      return Object.getPrototypeOf(p) === Product.prototype;
    },
    answer: '?',
  },
  {
    id: 2,
    title: '方法是自有属性吗',
    run() {
      function Product(name) {
        this.name = name;
      }
      Product.prototype.getName = function () {
        return this.name;
      };
      const p = new Product('键盘');
      return [Object.hasOwn(p, 'name'), Object.hasOwn(p, 'getName'), 'getName' in p].join(',');
    },
    answer: '?',
  },
  {
    id: 3,
    title: '共享的引用类型属性',
    run() {
      function Product(name) {
        this.name = name;
      }
      Product.prototype.tags = [];
      const a = new Product('键盘');
      const b = new Product('鼠标');
      a.tags.push('热销');
      return b.tags.length;
    },
    answer: '?',
  },
  {
    id: 4,
    title: '赋值会遮蔽原型属性',
    run() {
      function Product() {}
      Product.prototype.stock = 10;
      const a = new Product();
      a.stock = 5;
      const before = a.stock;
      delete a.stock;
      return `${before}-${a.stock}`;
    },
    answer: '?',
  },
  {
    id: 5,
    title: '重写 prototype 后的 constructor',
    run() {
      function Product() {}
      Product.prototype = {
        getName() {},
      };
      const p = new Product();
      return p.constructor === Product;
    },
    answer: '?',
  },
  {
    id: 6,
    title: '修改 prototype 对已有实例的影响',
    run() {
      function Product() {}
      const p = new Product();
      Product.prototype = {};
      return p instanceof Product;
    },
    answer: '?',
  },
  {
    id: 7,
    title: '原型链的尽头',
    run() {
      return String(Object.getPrototypeOf(Object.prototype));
    },
    answer: '?',
  },
  {
    id: 8,
    title: '纯净对象',
    run() {
      const dict = Object.create(null);
      dict.a = 1;
      return typeof dict.toString;
    },
    answer: '?',
  },
  {
    id: 9,
    title: 'class 继承中的静态方法',
    run() {
      class Model {
        static create(attrs) {
          return Object.assign(new this(), attrs);
        }
      }
      class User extends Model {}
      const u = User.create({ name: 'Tom' });
      return [u instanceof User, Object.getPrototypeOf(User) === Model].join(',');
    },
    answer: '?',
  },
  {
    id: 10,
    title: '函数也是对象',
    run() {
      function Product() {}
      return [
        Object.getPrototypeOf(Product) === Function.prototype,
        Object.getPrototypeOf(Product.prototype) === Object.prototype,
      ].join(',');
    },
    answer: '?',
  },
  {
    id: 11,
    title: '原型上的 getter 与赋值',
    run() {
      const base = {
        get price() {
          return 100;
        },
      };
      const item = Object.create(base);
      item.price = 50;
      return item.price;
    },
    answer: '?',
  },
];
