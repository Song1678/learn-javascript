/**
 * 练习 3-1 参考答案：防抖 debounce / 节流 throttle
 *
 * 关键点：timer、lastArgs、lastThis 这些状态保存在闭包中，
 * 每次调用 debounce() 都会创建一套新的状态，因此多个防抖函数互不干扰。
 */
export function debounce(fn, wait) {
  let timer = null;
  let lastArgs;
  let lastThis;

  function invoke() {
    const args = lastArgs;
    const ctx = lastThis;
    timer = null;
    lastArgs = lastThis = undefined;
    return fn.apply(ctx, args);
  }

  // 注意：这里必须用普通函数而不是箭头函数，才能拿到调用者传入的 this
  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    clearTimeout(timer);
    timer = setTimeout(invoke, wait);
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    lastArgs = lastThis = undefined;
  };

  debounced.flush = () => {
    if (timer === null) return undefined;
    clearTimeout(timer);
    return invoke();
  };

  return debounced;
}

export function throttle(fn, wait) {
  let timer = null;
  let pendingArgs = null;
  let pendingThis;

  function startWindow() {
    timer = setTimeout(() => {
      timer = null;
      if (pendingArgs) {
        const args = pendingArgs;
        const ctx = pendingThis;
        pendingArgs = pendingThis = null;
        fn.apply(ctx, args);
        startWindow(); // 结尾补的这次执行，同样开启一个新的窗口期
      }
    }, wait);
  }

  function throttled(...args) {
    if (timer === null) {
      fn.apply(this, args);
      startWindow();
    } else {
      pendingArgs = args;
      pendingThis = this;
    }
  }

  throttled.cancel = () => {
    clearTimeout(timer);
    timer = null;
    pendingArgs = pendingThis = null;
  };

  return throttled;
}
