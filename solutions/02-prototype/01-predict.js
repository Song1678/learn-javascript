/**
 * 练习 2-1：预测原型链相关代码的输出
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
    answer: true,
    // 💡 new 做的事之一：把新对象的 [[Prototype]] 指向构造函数的 prototype 属性。
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
    answer: 'true,false,true',
    // 💡 getName 在原型上，所有实例共享一份；in 运算符会沿原型链查找，hasOwn 只看自身。
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
    answer: 1,
    // 💡 a.tags 是「读取」操作，沿原型链找到了共享的数组，push 修改的是同一个数组。
    //    这是真实项目中的经典 Bug：可变数据应放在构造函数里（每个实例一份），原型上只放方法。
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
    answer: '5-10',
    // 💡 a.stock = 5 是「写入」，会在实例上创建自有属性（遮蔽原型上的同名属性），不会修改原型。
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
    answer: false,
    // 💡 默认的 prototype 对象上有 constructor 指回函数；整个替换后新对象没有 constructor，
    //    p.constructor 沿链找到 Object.prototype.constructor，即 Object。所以继承时要手动修复 constructor。
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
    answer: false,
    // 💡 instanceof 检查的是「Product.prototype 当前值」是否在 p 的原型链上。p 的原型还是旧对象。
  },
  {
    id: 7,
    title: '原型链的尽头',
    run() {
      return String(Object.getPrototypeOf(Object.prototype));
    },
    answer: 'null',
    // 💡 Object.prototype 的原型是 null，属性查找到这里就结束了。
  },
  {
    id: 8,
    title: '纯净对象',
    run() {
      const dict = Object.create(null);
      dict.a = 1;
      return typeof dict.toString;
    },
    answer: 'undefined',
    // 💡 Object.create(null) 创建没有原型的对象，常用来做字典/Map，避免 key 与 toString、__proto__ 等冲突。
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
    answer: 'true,true',
    // 💡 class 继承会建立两条原型链：User.prototype -> Model.prototype（实例方法），
    //    以及 User -> Model（静态方法）。静态方法里的 this 是调用它的类，即 User。
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
    answer: 'true,true',
    // 💡 要区分：Product 自身的原型（Function.prototype），和 Product.prototype 这个属性（将来实例的原型）。
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
    answer: 'TypeError',
    // 💡 如果原型链上有同名 accessor（只有 getter 没有 setter），给实例赋值不会创建自有属性：
    //    非严格模式下静默失败，严格模式（ESM 就是严格模式）下直接抛 TypeError。
    //    同理，原型上 writable: false 的数据属性也无法被实例遮蔽。想强行遮蔽请用 Object.defineProperty。
  },
];
