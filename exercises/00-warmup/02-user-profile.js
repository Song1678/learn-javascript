/**
 * 练习 0-2：用户资料与购物车 —— 对象操作热身  ⭐
 *
 * 【业务背景】
 * 后端接口返回的数据格式和前端想要的格式往往不一样（字段名是下划线风格、有些字段可能缺失……），
 * 前端需要写「数据转换」函数。另外，在 React / Vue 等框架中，更新数据时经常要求「不修改原对象，返回新对象」。
 *
 * 【练习目标】
 * 解构赋值、展开运算符 ...、可选链 ?.、空值合并 ??、模板字符串、Object.entries / Object.fromEntries
 */

export const DEFAULT_AVATAR = 'https://cdn.example.com/default-avatar.png';

/**
 * 1. 金额格式化：金额单位为「分」，转换为带 ¥ 的「元」，保留两位小数
 *    1290 => '¥12.90'      0 => '¥0.00'
 * 用到：模板字符串、toFixed
 */
export function formatPrice(cents) {
  // TODO
}

/**
 * 2. 把后端返回的用户数据转换成前端需要的格式
 *
 *   后端返回（raw）：
 *     { id: 1, nick_name: '小明', avatar_url: 'https://...', profile: { city: '杭州' } }
 *     注意：avatar_url 和 profile 都可能不存在；profile 存在时 city 也可能不存在
 *
 *   转换结果：
 *     { id: 1, name: '小明', avatar: 'https://...', city: '杭州' }
 *     avatar 缺失时使用 DEFAULT_AVATAR；city 缺失时为 '未知'
 *
 * 用到：解构赋值、?.、??
 */
export function normalizeUser(raw) {
  // TODO
}

/**
 * 3. 合并请求配置：options 中的配置覆盖 defaults，但 headers 要「合并」而不是「整体覆盖」
 *
 *   defaults = { timeout: 3000, headers: { 'Content-Type': 'application/json' } }
 *   options  = { timeout: 5000, headers: { Authorization: 'Bearer xxx' } }
 *   结果      = { timeout: 5000, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer xxx' } }
 *
 *   要求：不能修改 defaults 和 options；options 可能不传，也可能没有 headers
 * 用到：展开运算符 ...
 */
export function mergeOptions(defaults, options = {}) {
  // TODO
}

/**
 * 4. 从对象中挑出指定的字段（用于只把部分字段发给后端）
 *   pick({ id: 1, name: '小明', password: '123' }, ['id', 'name'])  =>  { id: 1, name: '小明' }
 *   对象中不存在的 key 不出现在结果中
 */
export function pick(obj, keys) {
  // TODO
}

/**
 * 5. 从对象中去掉指定的字段（用于把用户信息写入日志前，去掉敏感字段）
 *   omit({ id: 1, name: '小明', password: '123' }, ['password'])  =>  { id: 1, name: '小明' }
 * 用到：Object.entries、filter、Object.fromEntries
 */
export function omit(obj, keys) {
  // TODO
}

/**
 * 6. 修改购物车中某个商品的数量，返回「新的」购物车，不修改原来的 cart ⭐⭐
 *
 *   cart = { userId: 'u1', items: [{ sku: 'A', qty: 1 }, { sku: 'B', qty: 2 }] }
 *   updateQty(cart, 'B', 5)  =>  { userId: 'u1', items: [{ sku: 'A', qty: 1 }, { sku: 'B', qty: 5 }] }
 *   updateQty(cart, 'B', 0)  =>  数量为 0 时，从购物车中移除该商品
 *
 * 这就是 React 中 setState 时要求的「不可变更新」写法。
 * 用到：展开运算符、map、filter
 */
export function updateQty(cart, sku, qty) {
  // TODO
}
