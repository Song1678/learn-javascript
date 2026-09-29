/**
 * 练习 6-4 参考答案：异步生成器
 */

export async function* paginate(fetchPage) {
  let cursor = null;
  do {
    const { items, nextCursor } = await fetchPage(cursor);
    // yield* 可以委托给同步可迭代对象；消费方 break 时，生成器在此处的 yield 结束，不会再进入下一轮循环
    yield* items;
    cursor = nextCursor;
  } while (cursor !== null && cursor !== undefined);
}

export async function* batchAsync(asyncIterable, size) {
  let batch = [];
  for await (const item of asyncIterable) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) yield batch;
}

export async function exportAllOrders(fetchPage, writer, { batchSize = 500 } = {}) {
  let total = 0;
  try {
    for await (const batch of batchAsync(paginate(fetchPage), batchSize)) {
      await writer.write(batch);
      total += batch.length;
    }
  } finally {
    // 成功或失败都要释放资源（关闭文件句柄）
    await writer.close();
  }
  return total;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function* poll(check, { interval, until, maxAttempts = Infinity }) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await check();
    yield result;
    if (until(result)) return;
    if (attempt < maxAttempts) await sleep(interval);
  }
  throw new Error('轮询超时');
}
