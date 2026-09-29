/**
 * 练习 2-3 参考答案：手写 new / instanceof / Object.create
 */

export function myNew(Ctor, ...args) {
  if (typeof Ctor !== 'function') throw new TypeError(`${Ctor} is not a constructor`);
  // 1 + 2：创建对象并链接原型（Ctor.prototype 不是对象时，原生 new 会回退到 Object.prototype）
  const proto = Ctor.prototype !== null && typeof Ctor.prototype === 'object' ? Ctor.prototype : Object.prototype;
  const obj = myCreate(proto);
  // 3：以 obj 为 this 执行构造函数
  const result = Ctor.apply(obj, args);
  // 4：构造函数返回对象则用它，否则用 obj
  const isObject = result !== null && (typeof result === 'object' || typeof result === 'function');
  return isObject ? result : obj;
}

export function myInstanceOf(obj, Ctor) {
  if (typeof Ctor !== 'function') {
    throw new TypeError("Right-hand side of 'instanceof' is not callable");
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return false;
  }
  const target = Ctor.prototype;
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === target) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

export function myCreate(proto, propertiesObject) {
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError(`Object prototype may only be an Object or null: ${proto}`);
  }
  // 经典 ES5 写法：
  //   function F() {}
  //   F.prototype = proto;
  //   const obj = new F();
  // 但它无法处理 proto 为 null 的情况（new F() 会回退到 Object.prototype），这里用 setPrototypeOf
  const obj = {};
  Object.setPrototypeOf(obj, proto);
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }
  return obj;
}
