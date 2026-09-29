/**
 * 练习 4-5（挑战题）：从零实现 Promise
 *
 * 【为什么要做这道题】
 * 自己实现一遍 Promise，你会真正理解：
 *   - 为什么 then 一定是异步执行的
 *   - 为什么 then 返回的是一个「新」Promise，链式调用的值是怎么传递的
 *   - 为什么在 then 里 return 一个 Promise，下一个 then 会等它完成
 *   - 错误是如何沿着链条「冒泡」的
 *
 * 【要求】实现 MyPromise 类（不允许在实现中使用原生 Promise，可以使用 queueMicrotask）：
 *
 *  1. new MyPromise(executor)
 *     - executor(resolve, reject) 同步执行；executor 抛错等同于 reject
 *     - 状态：'pending' -> 'fulfilled' | 'rejected'，只能改变一次
 *
 *  2. then(onFulfilled, onRejected) 返回新的 MyPromise（记为 p2）
 *     - 回调总是异步执行（放入微任务 queueMicrotask），即使当前 promise 已经完成
 *     - onFulfilled / onRejected 不是函数时，值/错误「穿透」到 p2
 *     - 回调正常返回 x：用 x「解决」p2（见第 3 条）
 *     - 回调抛出异常 e：p2 以 e 失败
 *     - 同一个 promise 可以多次调用 then，回调按注册顺序执行
 *
 *  3. 解决过程 resolvePromise(p2, x)（Promise/A+ 规范的核心）
 *     - x === p2：以 TypeError 失败（避免自己等待自己，死循环）
 *     - x 是对象或函数，且有 then 方法（thenable）：调用 x.then(resolve, reject) 来「接管」x 的状态
 *       · 这样 p2 就能跟随另一个 Promise（包括原生 Promise 或其它库的实现）
 *       · 读取 x.then 或调用 x.then 时抛错 → p2 失败（但如果 resolve/reject 已被调用过，则忽略）
 *       · resolve/reject 被多次调用时只有第一次有效
 *     - 其他情况：p2 以 x 成功
 *     - 另外：构造函数中调用 resolve(x) 时，同样要走这个解决过程（resolve 一个 Promise 会等待它）
 *
 *  4. catch(onRejected)、finally(onFinally)
 *     - finally 回调不接收参数；它不改变原本的值/错误，但如果回调抛错或返回失败的 Promise，则以该错误失败
 *     - finally 回调返回 Promise 时，要等它完成
 *
 *  5. 静态方法：MyPromise.resolve(value)、MyPromise.reject(reason)、MyPromise.all(iterable)
 *     - MyPromise.resolve(p) 当 p 本身就是 MyPromise 实例时，直接返回 p
 */
export class MyPromise {
  constructor(executor) {
    // TODO
  }

  then(onFulfilled, onRejected) {
    // TODO
  }

  catch(onRejected) {
    // TODO
  }

  finally(onFinally) {
    // TODO
  }

  static resolve(value) {
    // TODO
  }

  static reject(reason) {
    // TODO
  }

  static all(iterable) {
    // TODO
  }
}
