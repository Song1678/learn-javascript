/**
 * 练习 1-3：手写 call / apply / bind / bindAll
 *
 * 【业务背景】
 * 公司的前端埋点 SDK 需要在各种回调中保证 this 正确，同时团队想借这个机会
 * 彻底弄懂 call/apply/bind 的原理。你需要不借助原生 call/apply/bind 实现它们。
 *
 * 【要求】
 *  - 禁止在实现中使用 Function.prototype.call / apply / bind（测试会检查）。
 *  - 提示：「隐式绑定」规则 —— obj.fn() 调用时 this 就是 obj。
 *    可以把函数临时挂到 thisArg 上调用，再删掉。用 Symbol 作为 key 可避免覆盖已有属性。
 *  - thisArg 为 null / undefined 时，按非严格模式的语义处理：this 指向 globalThis。
 *  - thisArg 为原始值（数字、字符串等）时，需要装箱：Object(thisArg)。
 */

/**
 * 以 thisArg 作为 this 调用 fn，参数逐个传入
 * @example myCall(greet, { name: '张三' }, '你好') // 等价于 greet.call({ name: '张三' }, '你好')
 */
export function myCall(fn, thisArg, ...args) {
  // TODO
  throw new Error('TODO: 实现 myCall');
}

/**
 * 与 myCall 类似，但参数以数组（或 null/undefined）形式传入
 */
export function myApply(fn, thisArg, argsArray) {
  // TODO
  throw new Error('TODO: 实现 myApply');
}

/**
 * 返回一个新函数，调用时 this 固定为 thisArg，并预置部分参数（柯里化）。
 * 进阶要求（测试会覆盖）：
 *  - 返回的函数被 new 调用时，应忽略 thisArg，表现得像 new fn(...)，
 *    且创建出的实例 instanceof fn 为 true。
 */
export function myBind(fn, thisArg, ...presetArgs) {
  // TODO
  throw new Error('TODO: 实现 myBind');
}

/**
 * 把对象上指定的方法全部绑定到对象自身（类似 lodash 的 _.bindAll），返回 obj。
 * 常用于：把实例方法作为事件回调传出去之前，统一绑定 this。
 * 可以使用你自己实现的 myBind。
 *
 * @example
 *   const tracker = bindAll(new Tracker(), ['track', 'flush']);
 *   button.addEventListener('click', tracker.track); // this 依然正确
 */
export function bindAll(obj, methodNames) {
  // TODO
  throw new Error('TODO: 实现 bindAll');
}
