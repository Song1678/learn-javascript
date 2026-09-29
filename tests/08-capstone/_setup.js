/**
 * 综合项目测试的公共搭建代码：用可控的假依赖组装出一个完整的应用
 */
import { load } from '../_helpers.js';

const { createApp } = await load('08-capstone/src/index.js');
const { createInMemoryDb } = await load('08-capstone/src/infra/db.js');
const { createInventoryClient } = await load('08-capstone/src/infra/inventoryClient.js');
const { PaymentSdk } = await load('08-capstone/src/infra/paymentSdk.js');

export const PRODUCTS = [
  { sku: 'SKU1', name: '机械键盘', price: 39900 },
  { sku: 'SKU2', name: '无线鼠标', price: 12900 },
  { sku: 'SKU3', name: '鼠标垫', price: 1990 },
  { sku: 'SKU4', name: '显示器', price: 129900 },
  { sku: 'SKU5', name: '耳机', price: 59900 },
  { sku: 'SKU6', name: '摄像头', price: 19900 },
];

export function setup({ stock = {}, flaky, latencyBySku, behavior, config = {}, smsFailTimes = 0 } = {}) {
  const db = createInMemoryDb({ products: PRODUCTS });
  const inventory = createInventoryClient({
    stock: { SKU1: 10, SKU2: 5, SKU3: 100, SKU4: 3, SKU5: 8, SKU6: 8, ...stock },
    flaky,
    latencyBySku,
  });
  const payment = new PaymentSdk({ merchantId: 'M001', behavior });
  const sms = {
    sent: [],
    failTimes: smsFailTimes,
    async send(userId, text) {
      if (this.failTimes > 0) {
        this.failTimes--;
        throw new Error('短信网关异常');
      }
      this.sent.push({ userId, text });
    },
  };
  const logger = {
    errors: [],
    error(msg) {
      this.errors.push(msg instanceof Error ? msg.message : String(msg));
    },
  };
  const app = createApp({
    db,
    inventory,
    payment,
    sms,
    logger,
    config: { paymentTimeout: 50, retryDelay: 1, ...config },
  });
  return { app, svc: app.orderService, db, inventory, payment, sms, logger };
}
