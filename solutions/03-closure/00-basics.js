/**
 * 练习 3-0 参考答案：闭包入门
 */

export function createCounter(initial = 0) {
  let count = initial; // 这个变量只有下面三个函数能访问到
  return {
    increment: () => ++count,
    decrement: () => (count > 0 ? --count : count),
    get: () => count,
  };
}

export function createTaxCalculator(rate) {
  // 返回的函数记住了 rate
  return (price) => Math.round(price * (1 + rate) * 100) / 100;
}

export function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

/**
 * var 声明的变量是「函数级」作用域，整个函数只有一个 i，循环结束时 i 已经是 4。
 * let 声明的变量是「块级」作用域，for 循环的每一轮都会创建一个新的 i，每个箭头函数记住各自那一轮的 i。
 */
export function createProductLabels() {
  const labels = [];
  for (let i = 1; i <= 3; i++) {
    labels.push(() => `第${i}个商品`);
  }
  return labels;
}
