/**
 * 练习 1-0：this 入门  ⭐
 *
 * 做这个练习之前，先读完本章 README 的「四条绑定规则」表格。
 * 每个任务只需要写 1~3 行代码。
 */

/**
 * 任务 1：对象方法中的 this
 * 完成 shop 的三个方法。在方法里用 this 访问 shop 自己的属性（不要直接写 shop.xxx）。
 */
export const shop = {
  name: '数码旗舰店',
  products: [],

  /** 把 product 加入 products 数组，并返回 this（这样就可以链式调用：shop.addProduct(a).addProduct(b)） */
  addProduct(product) {
    // TODO
  },

  /** 返回商品数量 */
  getProductCount() {
    // TODO
  },

  /**
   * 返回 `${店铺名}共有${商品数量}件商品`，例如 '数码旗舰店共有2件商品'
   * 注意：任务 2 会把这个方法「借」给别的店铺对象用，那些对象只有 name 和 products 两个属性
   */
  describe() {
    // TODO
  },
};

/**
 * 任务 2：借用方法（call）
 * 其它店铺对象也有 name 和 products 属性，但没有 describe 方法。
 * 用 call 调用 shop.describe，让它里面的 this 指向 otherShop，然后返回结果。
 */
export function describeOtherShop(otherShop) {
  // TODO
}

/**
 * 任务 3：bind 修复「方法作为回调时丢失 this」
 * 页面上会这样使用：button.onClick(counter.increment)
 * 此时 increment 被按钮调用，this 不再是 counter，于是 this.count 报错。
 * 在 constructor 中加「一行」代码修复它。
 */
export class ClickCounter {
  constructor() {
    this.count = 0;
    // TODO: 加一行代码
  }

  increment() {
    this.count++;
    return this.count;
  }
}

/**
 * 任务 4：箭头函数与 setTimeout
 * 商品加入购物车后，显示一个提示框，ms 毫秒后自动隐藏。
 * 在 setTimeout 的回调中把 this.visible 设为 false。
 * 提示：普通函数作为 setTimeout 的回调时，this 不是 Toast 实例；箭头函数没有自己的 this……
 */
export class Toast {
  constructor() {
    this.visible = false;
  }

  show(ms) {
    this.visible = true;
    // TODO: 写一个 setTimeout
  }
}
