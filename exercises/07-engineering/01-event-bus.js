/**
 * 练习 7-1：事件总线（发布-订阅）
 *
 * 【业务背景】
 * 订单支付成功后，需要：发短信、加积分、通知仓库发货、推送给数据分析平台……
 * 如果都写在 payOrder() 里，订单模块会依赖一大堆其它模块，每加一个需求都要改订单代码。
 * 用事件总线解耦：订单模块只负责 emit('order.paid', order)，其它模块各自订阅。
 *
 * 特别注意线上事故教训：
 *   - 某次短信服务的监听器抛了异常，导致后面的「通知仓库发货」监听器没有执行 → 用户付了钱没发货！
 *     所以：一个监听器出错，不能影响其它监听器，错误要交给统一的 onError 处理
 *   - 某个 once 监听器在执行时又 emit 了同一个事件，导致无限递归
 *
 * 【要求】
 *   const bus = new EventBus({ onError: (err, { event, handler }) => logger.error(err) });
 *
 *   on(event, handler)     订阅，返回「取消订阅」函数；同一个 handler 重复订阅同一事件，只算一次
 *   once(event, handler)   只触发一次；返回取消订阅函数；也可以用 off(event, handler) 通过原 handler 取消
 *   off(event, handler)    取消订阅；不传 handler 则取消该事件的全部订阅
 *   emit(event, ...args)   同步按订阅顺序调用监听器，返回是否有监听器（boolean）
 *                          - 监听器的 this 为 bus 实例
 *                          - 监听器抛错时，调用 onError(err, { event, handler })，然后继续执行后面的监听器
 *                            （没有配置 onError 时，用 console.error 输出）
 *                          - emit 过程中新增/删除订阅，不影响本次 emit（快照）
 *                          - 通配符：订阅 '*' 的监听器会收到所有事件，参数为 (event, ...args)，在普通监听器之后调用
 *   emitAsync(event, ...args)  异步版本：并发调用所有监听器（包括 '*'），等待全部完成（无论成败）；
 *                          返回 Promise<{ ok: number, failed: number }>；失败的同样交给 onError
 *   listenerCount(event)   某事件的监听器数量（不包括 '*'）
 */
export class EventBus {
  constructor({ onError } = {}) {
    // TODO
  }

  on(event, handler) {
    // TODO
  }

  once(event, handler) {
    // TODO
  }

  off(event, handler) {
    // TODO
  }

  emit(event, ...args) {
    // TODO
  }

  async emitAsync(event, ...args) {
    // TODO
  }

  listenerCount(event) {
    // TODO
  }
}
