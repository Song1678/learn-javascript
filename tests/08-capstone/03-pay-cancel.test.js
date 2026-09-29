import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, advancedTest } from '../_helpers.js';
import { setup } from './_setup.js';

const { ConflictError, NotFoundError } = await load('08-capstone/src/errors.js');

async function createSampleOrder(svc, userId = 'u1') {
  return svc.createOrder({ userId, items: [{ sku: 'SKU1', qty: 1 }, { sku: 'SKU3', qty: 1 }] }); // 41890 分
}

describe('支付 payOrder', () => {
  test('支付成功：状态、交易号、短信、积分', async () => {
    const { svc, sms, db } = setup();
    const order = await createSampleOrder(svc);
    const paid = await svc.payOrder(order.id);
    assert.equal(paid.status, 'PAID');
    assert.equal(paid.transactionId, `TX-M001-${order.id}`);
    assert.equal(typeof paid.paidAt, 'number');
    assert.equal((await svc.getOrder(order.id)).status, 'PAID', '状态已持久化');
    assert.deepEqual(sms.sent, [{ userId: 'u1', text: `您的订单 ${order.id} 已支付成功，金额 ¥418.90` }]);
    assert.equal(await db.getPoints('u1'), 418, '每 1 元积 1 分，不足 1 元不计');
  });

  test('订单不存在：404', async () => {
    const { svc, app } = setup();
    await assert.rejects(svc.payOrder('SO_NOT_EXIST'), NotFoundError);
    assert.equal((await app.handle(() => svc.payOrder('x'))).status, 404);
  });

  test('已支付的订单不能重复支付：409，且不会重复扣款', async () => {
    const { svc, payment } = setup();
    const order = await createSampleOrder(svc);
    await svc.payOrder(order.id);
    await assert.rejects(svc.payOrder(order.id), ConflictError);
    assert.deepEqual(payment.chargedOrders, [order.id]);
  });

  advancedTest('并发重复提交（用户连点两次）：只扣款一次', async () => {
    const { svc, payment } = setup();
    const order = await createSampleOrder(svc);
    const results = await Promise.allSettled([svc.payOrder(order.id), svc.payOrder(order.id)]);
    const ok = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');
    assert.equal(ok.length, 1);
    assert.equal(failed.length, 1);
    assert.ok(failed[0].reason instanceof ConflictError);
    assert.deepEqual(payment.chargedOrders, [order.id], '只能扣款一次');
  });

  test('支付失败：402 PAYMENT_FAILED，订单仍为待支付，可以再次支付', async () => {
    let outcome = 'fail';
    const { svc, app } = setup({ behavior: () => outcome });
    const order = await createSampleOrder(svc);
    const res = await app.handle(() => svc.payOrder(order.id));
    assert.equal(res.status, 402);
    assert.equal(res.body.code, 'PAYMENT_FAILED');
    assert.equal((await svc.getOrder(order.id)).status, 'PENDING');
    outcome = 'success';
    assert.equal((await svc.payOrder(order.id)).status, 'PAID');
  });

  test('支付网关无响应：按配置超时，504 PAYMENT_TIMEOUT，之后可重新支付', async () => {
    let outcome = 'hang';
    const { svc, app } = setup({ behavior: () => outcome, config: { paymentTimeout: 30 } });
    const order = await createSampleOrder(svc);
    const start = Date.now();
    const res = await app.handle(() => svc.payOrder(order.id));
    assert.ok(Date.now() - start < 200, '应在超时时间后返回');
    assert.equal(res.status, 504);
    assert.equal(res.body.code, 'PAYMENT_TIMEOUT');
    assert.equal((await svc.getOrder(order.id)).status, 'PENDING');
    outcome = 'success';
    assert.equal((await svc.payOrder(order.id)).status, 'PAID', '超时后「支付中」的锁要释放');
  });

  test('短信发送失败不影响支付结果和积分；错误被记录', async () => {
    const { svc, db, logger, sms } = setup({ smsFailTimes: 100 });
    const order = await createSampleOrder(svc);
    const paid = await svc.payOrder(order.id);
    assert.equal(paid.status, 'PAID');
    assert.equal(await db.getPoints('u1'), 418);
    assert.equal(sms.sent.length, 0);
    assert.ok(
      logger.errors.some((e) => e.includes('短信网关异常')),
      `应记录短信发送的错误，实际日志：${JSON.stringify(logger.errors)}`,
    );
  });

  advancedTest('短信偶发失败会自动重试', async () => {
    const { svc, sms } = setup({ smsFailTimes: 1 });
    const order = await createSampleOrder(svc);
    await svc.payOrder(order.id);
    assert.equal(sms.sent.length, 1);
  });
});

describe('取消 cancelOrder', () => {
  test('取消待支付订单：释放库存、更新状态、发送短信', async () => {
    const { svc, inventory, sms } = setup();
    const order = await createSampleOrder(svc);
    assert.equal(await inventory.getStock('SKU1'), 9);
    const cancelled = await svc.cancelOrder(order.id);
    assert.equal(cancelled.status, 'CANCELLED');
    assert.equal(await inventory.getStock('SKU1'), 10);
    assert.equal(await inventory.getStock('SKU3'), 100);
    assert.equal(inventory.activeReservations, 0);
    assert.deepEqual(sms.sent, [{ userId: 'u1', text: `您的订单 ${order.id} 已取消` }]);
  });

  test('已支付 / 已取消的订单不能取消：409', async () => {
    const { svc, app } = setup();
    const a = await createSampleOrder(svc);
    await svc.payOrder(a.id);
    assert.equal((await app.handle(() => svc.cancelOrder(a.id))).status, 409);
    const b = await createSampleOrder(svc);
    await svc.cancelOrder(b.id);
    await assert.rejects(svc.cancelOrder(b.id), ConflictError);
  });

  test('已取消的订单不能支付', async () => {
    const { svc, payment } = setup();
    const order = await createSampleOrder(svc);
    await svc.cancelOrder(order.id);
    await assert.rejects(svc.payOrder(order.id), ConflictError);
    assert.deepEqual(payment.chargedOrders, []);
  });

  advancedTest('支付进行中不能取消', async () => {
    const { svc } = setup({ config: { paymentTimeout: 1000 } });
    const order = await createSampleOrder(svc);
    const paying = svc.payOrder(order.id);
    await sleep(2); // 让支付流程先开始
    await assert.rejects(svc.cancelOrder(order.id), ConflictError);
    assert.equal((await paying).status, 'PAID');
  });
});
