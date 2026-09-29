/**
 * 练习 2-2：用「构造函数 + 原型」实现商品模型继承（禁止使用 class）  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 你接手了一个老项目（运行在不支持 class 的老旧 WebView 中，构建链又不能引入 Babel），
 * 需要在其中新增商品模型。商城有三类商品：
 *   - Product         普通商品
 *   - DiscountProduct 折扣商品（继承 Product）：价格 = 原价 × 折扣
 *   - DigitalProduct  数字商品（继承 Product）：虚拟发货，永远免运费
 *
 * 【要求】
 *  1. 禁止使用 class / extends 关键字（测试会检查源码），用 ES5 方式实现继承。
 *  2. 方法必须定义在原型上（所有实例共享），实例自身只保存数据。
 *  3. 子类原型不能通过 `new Product()` 创建（那会在子类原型上留下 id/name 等垃圾属性，
 *     并且会执行父类构造函数里的副作用）。提示：Object.create。
 *  4. 子类原型的 constructor 要指回子类自身。
 *  5. 子类要复用父类构造函数的初始化逻辑，而不是复制粘贴。
 *
 * 【数据结构】
 *   new Product({ id, name, price })
 *   new DiscountProduct({ id, name, price, discount })   // discount 范围 (0, 1]，如 0.8 表示八折
 *   new DigitalProduct({ id, name, price, downloadUrl })
 *
 * 【方法】
 *   getPrice()        实际售价。Product：price；DiscountProduct：price * discount，四舍五入保留两位小数
 *   getShippingFee()  运费。Product：实际售价 >= 99 免运费，否则 10；DigitalProduct：永远 0
 *   describe()        展示文案：`${name} ¥${实际售价保留两位小数}`，例如 '机械键盘 ¥399.00'
 *                     只在 Product.prototype 上定义一次，子类不重写，但要能体现子类的实际售价（多态）
 *
 * 另外：DiscountProduct 的 discount 不在 (0, 1] 范围内时，构造函数抛出 RangeError。
 */

export function Product(options) {
  // TODO
}

// TODO: Product.prototype.getPrice / getShippingFee / describe

export function DiscountProduct(options) {
  // TODO
}

// TODO: 建立 DiscountProduct 与 Product 的继承关系，并重写 getPrice

export function DigitalProduct(options) {
  // TODO
}

// TODO: 建立 DigitalProduct 与 Product 的继承关系，并重写 getShippingFee
