/**
 * 练习 0-2 参考答案：用户资料与购物车
 */

export const DEFAULT_AVATAR = 'https://cdn.example.com/default-avatar.png';

export function formatPrice(cents) {
  return `¥${(cents / 100).toFixed(2)}`;
}

export function normalizeUser(raw) {
  // 解构时可以重命名：nick_name: name 表示「取出 nick_name，存到变量 name 里」
  const { id, nick_name: name, avatar_url: avatar = DEFAULT_AVATAR, profile } = raw;
  return {
    id,
    name,
    avatar,
    // profile 可能是 undefined，?. 让表达式在遇到 null/undefined 时直接返回 undefined 而不是报错
    city: profile?.city ?? '未知',
  };
}

export function mergeOptions(defaults, options = {}) {
  return {
    ...defaults,
    ...options,
    // 后展开的属性覆盖先展开的；headers 单独再合并一次
    headers: { ...defaults.headers, ...options.headers },
  };
}

export function pick(obj, keys) {
  return Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]]));
}

export function omit(obj, keys) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
}

export function updateQty(cart, sku, qty) {
  const items =
    qty <= 0
      ? cart.items.filter((item) => item.sku !== sku)
      : cart.items.map((item) => (item.sku === sku ? { ...item, qty } : item));
  return { ...cart, items };
}
