/**
 * 练习 4-0：Promise 入门  ⭐
 *
 * 本练习「不允许」使用 async / await（测试会检查），目的是让你先熟悉 Promise 本身：
 * new Promise、then、catch、Promise.all。下一章再学 async/await，你会体会到它帮你省掉了什么。
 *
 * 所有 api 对象都是测试中传入的「假接口」，它们的方法都返回 Promise。
 */

/**
 * 任务 1：延迟
 * 返回一个 Promise，ms 毫秒后以 value 成功
 *   delay(100, 'ok').then((v) => console.log(v));   // 100ms 后打印 ok
 * 提示：new Promise((resolve) => { ... })，在 setTimeout 的回调里调用 resolve
 */
export function delay(ms, value) {
  // TODO
}

/**
 * 任务 2：把回调风格的函数包装成 Promise
 * readFile(path, callback) 是一个老式的读文件函数：
 *   readFile('config.json', (err, content) => { ... })
 *   - 读取失败时 err 是一个错误对象
 *   - 读取成功时 err 为 null，content 是文件内容（字符串）
 * 实现 loadConfig：读取 path 文件，把内容用 JSON.parse 解析后作为 Promise 的结果；读取失败时 Promise 失败
 */
export function loadConfig(readFile, path) {
  // TODO
}

/**
 * 任务 3：链式调用 then
 * 查询用户的会员等级对应的折扣：
 *   1. api.getUser(userId)            => Promise<{ id, level }>
 *   2. api.getDiscount(user.level)    => Promise<number>，例如 0.9
 * 返回 Promise<number>：折扣
 * 提示：在第一个 then 的回调里 return 第二个 Promise，下一个 then 会等它完成
 */
export function getUserDiscount(api, userId) {
  // TODO
}

/**
 * 任务 4：catch 兜底
 * 获取用户昵称，接口失败时返回 '游客'
 *   api.getUser(userId)  => Promise<{ name }>，可能失败
 */
export function getNickname(api, userId) {
  // TODO
}

/**
 * 任务 5：Promise.all 并行请求
 * 首页同时请求轮播图和推荐商品，两个都返回后，组装成 { banners, products }
 *   api.getBanners()   => Promise<Array>
 *   api.getProducts()  => Promise<Array>
 */
export function loadHomePage(api) {
  // TODO
}
