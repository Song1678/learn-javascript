/**
 * 练习 0-3 参考答案：修 Bug 热身
 */

/**
 * Bug 1：浮点数精度问题。计算机用二进制存储小数，0.1、0.2 都无法精确表示。
 * 修法一（这里使用）：最后四舍五入到两位小数。
 * 修法二（真实项目更推荐）：金额一律用「分」为单位的整数存储和计算，展示时再转换成元。
 */
export function calcTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return Math.round(total * 100) / 100;
}

/**
 * Bug 2：两处「差一」错误（off-by-one）
 *   - page 从 1 开始，所以起始下标是 (page - 1) * pageSize
 *   - slice(start, end) 本身就「不包含」end，不需要再 -1
 */
export function paginate(list, page, pageSize) {
  const start = (page - 1) * pageSize;
  return list.slice(start, start + pageSize);
}

/**
 * Bug 3：sort 会「原地修改」数组并返回同一个数组。
 * 先复制再排序：[...products].sort(...)，或者使用 ES2023 的 products.toSorted(...)
 * 类似会修改原数组的方法还有：reverse、splice、push、pop、shift、unshift、fill
 */
export function sortByPrice(products) {
  return [...products].sort((a, b) => a.price - b.price);
}

/**
 * Bug 4：user.coupons 是 undefined 时，读取 undefined.length 会抛出 TypeError。
 * 用可选链 ?. 安全地读取，再用 ?? 提供默认值。
 */
export function getCouponCount(user) {
  return user.coupons?.length ?? 0;
}
