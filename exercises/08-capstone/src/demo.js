/**
 * 演示脚本（已提供）：用假依赖跑一遍完整的下单流程，直观感受你写的代码
 *
 *   npm run demo              运行你的实现（exercises/）
 *   npm run demo:solution     运行参考答案（solutions/）
 */
import { createApp } from './index.js';
import { createInMemoryDb } from './infra/db.js';
import { createInventoryClient } from './infra/inventoryClient.js';
import { PaymentSdk } from './infra/paymentSdk.js';

const db = createInMemoryDb({
  products: [
    { sku: 'KB-01', name: '机械键盘', price: 39900 },
    { sku: 'MS-01', name: '无线鼠标', price: 12900 },
    { sku: 'PAD-01', name: '鼠标垫', price: 1990 },
  ],
});
const inventory = createInventoryClient({
  stock: { 'KB-01': 2, 'MS-01': 10, 'PAD-01': 100 },
  flaky: { 'MS-01': 1 }, // 鼠标库存服务第一次调用会失败，演示自动重试
  latency: 20,
});
const payment = new PaymentSdk({
  merchantId: 'DEMO',
  behavior: ({ amount }) => (amount > 100000 ? 'fail' : 'success'), // 超过 1000 元扣款失败
  latency: 50,
});
const sms = {
  async send(userId, text) {
    console.log(`    📱 短信 -> ${userId}：${text}`);
  },
};

const { orderService: svc, handle, bus } = createApp({ db, inventory, payment, sms, config: { paymentTimeout: 500 } });
bus.on('*', (event, order) => console.log(`    📣 事件 ${event}：${order.id}`));

const show = (title, res) => {
  const summary =
    res.status === 200
      ? { id: res.body.id, status: res.body.status, total: res.body.total }
      : res.body;
  console.log(`\n${res.status === 200 ? '✅' : '❌'} ${title} -> HTTP ${res.status}`, summary);
};

console.log('=== 迷你商城订单服务演示 ===');

let res = await handle(() =>
  svc.createOrder({ userId: 'alice', items: [{ sku: 'KB-01', qty: 1 }, { sku: 'MS-01', qty: 1 }] }),
);
show('alice 下单（键盘 + 鼠标）', res);
const aliceOrder = res.body;

show('alice 支付', await handle(() => svc.payOrder(aliceOrder.id)));
show('alice 重复支付', await handle(() => svc.payOrder(aliceOrder.id)));

show('bob 下单 5 个键盘（库存只剩 1）', await handle(() => svc.createOrder({ userId: 'bob', items: [{ sku: 'KB-01', qty: 5 }] })));
show('bob 提交非法参数', await handle(() => svc.createOrder({ userId: 'bob', items: [{ sku: 'PAD-01', qty: -1 }] })));

res = await handle(() => svc.createOrder({ userId: 'bob', items: [{ sku: 'MS-01', qty: 9 }] }));
show('bob 下单 9 个鼠标', res);
show('bob 支付（超过 1000 元，扣款失败）', await handle(() => svc.payOrder(res.body.id)));
show('bob 取消订单', await handle(() => svc.cancelOrder(res.body.id)));

console.log('\n📊 alice 的订单统计：', await svc.getUserStats('alice'));
console.log('📊 bob 的订单统计：', await svc.getUserStats('bob'));
console.log('🎁 alice 的积分：', await db.getPoints('alice'));
console.log('📦 剩余库存：', {
  'KB-01': await inventory.getStock('KB-01'),
  'MS-01': await inventory.getStock('MS-01'),
});
