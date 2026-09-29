/**
 * 练习 5-4 参考答案：只保留最后一次请求
 */

const createAbortError = () => new DOMException('请求已被取消', 'AbortError');

export function abortable(promise, signal) {
  if (signal.aborted) return Promise.reject(createAbortError());
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(createAbortError());
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

export function latestOnly(asyncFn) {
  let current = null; // 当前进行中调用的 AbortController

  function latest(...args) {
    current?.abort();
    const controller = new AbortController();
    current = controller;

    // Promise.resolve().then 保证 asyncFn 同步抛错也变成 rejected Promise
    const task = Promise.resolve().then(() => asyncFn.apply(this, [...args, controller.signal]));

    // abortable 保证：即使 asyncFn 忽略 signal，被取代后调用方也拿不到旧结果
    return abortable(task, controller.signal).finally(() => {
      if (current === controller) current = null;
    });
  }

  latest.abort = () => {
    current?.abort();
    current = null;
  };

  return latest;
}
