/**
 * 练习 6-3 参考答案：惰性数据处理管道
 */

export function* lines(text) {
  let start = 0;
  while (start < text.length) {
    let end = text.indexOf('\n', start);
    if (end === -1) end = text.length;
    yield text.slice(start, end);
    start = end + 1;
  }
}

export function map(fn) {
  return function* (iterable) {
    let i = 0;
    for (const item of iterable) yield fn(item, i++);
  };
}

export function filter(predicate) {
  return function* (iterable) {
    let i = 0;
    for (const item of iterable) {
      if (predicate(item, i++)) yield item;
    }
  };
}

export function limit(n) {
  return function* (iterable) {
    if (n <= 0) return;
    let count = 0;
    for (const item of iterable) {
      yield item;
      // 取够后立刻 return（会触发上游迭代器的 return()），不要再多拉一次
      if (++count >= n) return;
    }
  };
}

export function chunk(size) {
  return function* (iterable) {
    let batch = [];
    for (const item of iterable) {
      batch.push(item);
      if (batch.length === size) {
        yield batch;
        batch = [];
      }
    }
    if (batch.length > 0) yield batch;
  };
}

export function pipe(source, ...operators) {
  return operators.reduce((acc, op) => op(acc), source);
}

export function parseLogLine(line) {
  const [time, method, path, cost, status] = line.trim().split(/\s+/);
  return { time, method, path, cost: parseInt(cost, 10), status: Number(status) };
}
