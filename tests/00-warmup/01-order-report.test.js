/**
 * 这是你看到的第一个测试文件，花两分钟读一读它的结构：
 *   - describe(名称, 函数)：把相关的测试分成一组
 *   - test(名称, 函数)：一个测试用例
 *   - assert.equal(实际值, 期望值)：断言两者相等，不相等则测试失败
 *   - assert.deepEqual(实际值, 期望值)：断言两个对象/数组的「内容」相等
 * 测试失败时，终端会显示 actual（你的结果）和 expected（期望结果），对比它们就能找到问题。
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, codeOf } from '../_helpers.js';

const report = await load('00-warmup/01-order-report.js');
const { findOrder, getPaidOrders, orderTotal, totalRevenue, getOrderIds, countByStatus, topProducts } = report;

const orders = [
  {
    id: 'SO001',
    userId: 'u1',
    status: 'PAID',
    items: [
      { sku: 'KB-01', name: '机械键盘', price: 399, qty: 1 },
      { sku: 'PAD-01', name: '鼠标垫', price: 20, qty: 3 },
    ],
  },
  {
    id: 'SO002',
    userId: 'u2',
    status: 'PENDING',
    items: [{ sku: 'MS-01', name: '无线鼠标', price: 129, qty: 2 }],
  },
  {
    id: 'SO003',
    userId: 'u1',
    status: 'PAID',
    items: [
      { sku: 'MS-01', name: '无线鼠标', price: 129, qty: 2 },
      { sku: 'PAD-01', name: '鼠标垫', price: 20, qty: 5 },
    ],
  },
  {
    id: 'SO004',
    userId: 'u3',
    status: 'CANCELLED',
    items: [{ sku: 'KB-01', name: '机械键盘', price: 399, qty: 10 }],
  },
];

describe('订单报表', () => {
  test('1. findOrder：找得到', () => {
    assert.equal(findOrder(orders, 'SO003'), orders[2]);
  });

  test('1. findOrder：找不到时返回 null', () => {
    assert.equal(findOrder(orders, 'SO999'), null);
  });

  test('2. getPaidOrders', () => {
    assert.deepEqual(
      getPaidOrders(orders).map((o) => o.id),
      ['SO001', 'SO003'],
    );
  });

  test('3. orderTotal', () => {
    assert.equal(orderTotal(orders[0]), 399 + 20 * 3);
    assert.equal(orderTotal({ items: [] }), 0, '没有商品的订单金额为 0');
  });

  test('4. totalRevenue：只统计已付款订单', () => {
    assert.equal(totalRevenue(orders), 459 + 358);
    assert.equal(totalRevenue([]), 0);
  });

  test('5. getOrderIds', () => {
    assert.deepEqual(getOrderIds(orders), ['SO001', 'SO002', 'SO003', 'SO004']);
  });

  test('6. countByStatus', () => {
    assert.deepEqual(countByStatus(orders), { PAID: 2, PENDING: 1, CANCELLED: 1 });
    assert.deepEqual(countByStatus([]), {});
  });

  test('7. topProducts：按销量降序，只统计已付款订单', () => {
    assert.deepEqual(topProducts(orders, 2), [
      { sku: 'PAD-01', name: '鼠标垫', qty: 8 },
      { sku: 'MS-01', name: '无线鼠标', qty: 2 },
    ]);
    assert.equal(topProducts(orders, 10).length, 3, 'n 大于商品种类数时，返回全部');
  });

  test('不修改传入的数据', () => {
    const before = JSON.stringify(orders);
    Object.values(report).forEach((fn) => {
      try {
        fn(orders, 3);
      } catch {
        // 这里只关心数据有没有被修改
      }
    });
    assert.equal(JSON.stringify(orders), before);
  });

  test('没有使用 for / while 循环', () => {
    for (const fn of Object.values(report)) {
      assert.doesNotMatch(codeOf(fn), /\b(for|while)\s*\(/, `${fn.name} 中使用了循环，试试数组方法`);
    }
  });
});
