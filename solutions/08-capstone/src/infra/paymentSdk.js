/**
 * 第三方支付 SDK（已提供，无需修改）
 *
 * 一个「老式」SDK：
 *   - 使用错误优先回调，不支持 Promise
 *   - 方法内部依赖 this（this.merchantId、this.#log），直接把方法取出来调用会报错
 *   - 在某些情况下会「永远不回调」（网关卡死），所以调用方必须自己做超时控制
 */
export class PaymentSdk {
  #log = [];

  /**
   * @param {object} options
   * @param {string} options.merchantId
   * @param {(order: { orderId, amount }) => 'success' | 'fail' | 'hang'} [options.behavior]  模拟网关的行为
   * @param {number} [options.latency=3]
   */
  constructor({ merchantId, behavior = () => 'success', latency = 3 }) {
    this.merchantId = merchantId;
    this.behavior = behavior;
    this.latency = latency;
  }

  /**
   * 扣款
   * @param {{ orderId: string, amount: number }} params  amount 单位：分
   * @param {(err: Error | null, result?: { transactionId: string }) => void} callback
   */
  charge(params, callback) {
    if (!this.merchantId) {
      throw new Error('PaymentSdk: merchantId 未初始化（this 丢失了？）');
    }
    this.#log.push(params.orderId);
    const outcome = this.behavior(params);
    if (outcome === 'hang') return; // 永远不回调
    setTimeout(() => {
      if (outcome === 'fail') {
        const err = new Error('余额不足');
        err.code = 'INSUFFICIENT_BALANCE';
        callback(err);
      } else {
        callback(null, { transactionId: `TX-${this.merchantId}-${params.orderId}` });
      }
    }, this.latency);
  }

  /** 被扣款过的订单号列表（测试辅助：检查是否重复扣款） */
  get chargedOrders() {
    return [...this.#log];
  }
}
