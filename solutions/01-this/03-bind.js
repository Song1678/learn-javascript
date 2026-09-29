/**
 * 练习 1-3 参考答案：手写 call / apply / bind / bindAll
 */

export function myCall(fn, thisArg, ...args) {
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');
  // null/undefined -> globalThis；原始值 -> 包装对象
  const context = thisArg == null ? globalThis : Object(thisArg);
  // 用 Symbol 作为临时 key，不会与已有属性冲突
  const key = Symbol('fn');
  context[key] = fn;
  try {
    // 隐式绑定：context[key]() 调用时 this === context
    return context[key](...args);
  } finally {
    delete context[key];
  }
}

export function myApply(fn, thisArg, argsArray) {
  return myCall(fn, thisArg, ...(argsArray ?? []));
}

export function myBind(fn, thisArg, ...presetArgs) {
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  function bound(...args) {
    // new.target 存在说明是被 new 调用的：此时 this 是新创建的实例，应忽略 thisArg
    if (new.target) {
      const result = myApply(fn, this, [...presetArgs, ...args]);
      // 构造函数显式返回对象时，以返回值为准（与 new 的语义一致）
      return result !== null && (typeof result === 'object' || typeof result === 'function')
        ? result
        : this;
    }
    return myApply(fn, thisArg, [...presetArgs, ...args]);
  }

  // 让 new bound() 创建的实例原型链上有 fn.prototype，从而 instanceof fn 为 true
  // 用 Object.create 而不是直接赋值 fn.prototype，避免修改 bound.prototype 时污染 fn.prototype
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }
  return bound;
}

export function bindAll(obj, methodNames) {
  for (const name of methodNames) {
    if (typeof obj[name] !== 'function') {
      throw new TypeError(`${String(name)} is not a function`);
    }
    // 在实例上创建一个同名的「自有属性」，遮蔽原型上的方法
    obj[name] = myBind(obj[name], obj);
  }
  return obj;
}
