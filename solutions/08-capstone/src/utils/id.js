/**
 * 订单号生成器（与第 06 章练习 6-2 相同的思路）
 * 格式：前缀 + yyyyMMdd + 6 位当日流水号，例如 SO20260929000001
 */
const pad = (n, width) => String(n).padStart(width, '0');
const formatDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}`;

export function* orderNoGenerator({ prefix = 'SO', now = () => new Date() } = {}) {
  let seq = 0;
  let lastDate = null;
  while (true) {
    const date = formatDate(now());
    if (date !== lastDate) {
      lastDate = date;
      seq = 0;
    }
    yield `${prefix}${date}${pad(++seq, 6)}`;
  }
}

/** 把生成器包装成一个普通函数，方便注入：const nextId = createIdFactory(); nextId() */
export function createIdFactory(options) {
  const it = orderNoGenerator(options);
  return () => it.next().value;
}
