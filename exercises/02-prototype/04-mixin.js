/**
 * 练习 2-4：实现 mixin —— 为多个模型复用能力  ⭐⭐⭐ 选做
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 后台管理系统中有 User、Order、Product 等模型类，它们各自有不同的父类，
 * 但都需要一些「横向」的通用能力：
 *   - Timestamps：记录创建/更新时间，提供 touch() 方法和 age 只读属性（getter）
 *   - Serializable：提供 toJSON()，只输出 static fields 中声明的字段
 * JS 只支持单继承，所以团队决定用 mixin（混入）来组合这些能力。
 *
 * 同事写了第一版：
 *
 *   function mixin(Base, ...mixins) {
 *     class Mixed extends Base {}
 *     mixins.forEach(m => Object.assign(Mixed.prototype, m));
 *     return Mixed;
 *   }
 *
 * 结果发现 getter 失效了：age 在「定义类时」就被求值成了一个固定值（甚至直接报错）。
 * 原因是 Object.assign 会「读取」源对象属性的值再「写入」目标，getter 被调用了，而不是被复制。
 *
 * 【任务】实现正确的 mixin(Base, ...mixins)：
 *  1. 返回一个继承自 Base 的新类（不修改 Base 本身）
 *  2. 把每个 mixin 对象的「所有自有属性」按「属性描述符」原样复制到新类的原型上
 *     —— getter/setter 保持为访问器；Symbol 作为 key 的属性也要复制；不可枚举属性也要复制
 *  3. 后面的 mixin 覆盖前面的同名属性
 *  4. 新类的 name 为 `${Base.name}With${mixin 个数}Mixins`，方便调试（提示：Object.defineProperty 修改函数 name）
 *
 * 并补全下面的 Timestamps、Serializable 两个 mixin。
 * 提示：Reflect.ownKeys / Object.getOwnPropertyDescriptors / Object.defineProperties
 */

export function mixin(Base, ...mixins) {
  // TODO
  throw new Error('TODO: 实现 mixin');
}

export const Timestamps = {
  /** 更新 updatedAt 为当前时间（Date.now()），并返回 this 以支持链式调用 */
  touch() {
    // TODO
  },
  /** 只读属性：距离 createdAt 过去了多少毫秒（Date.now() - this.createdAt） */
  get age() {
    // TODO
    return undefined;
  },
};

export const Serializable = {
  /**
   * 只输出类的静态属性 fields 中声明的字段，例如：
   *   class User { static fields = ['id', 'name'] }
   *   JSON.stringify(user) => '{"id":1,"name":"Tom"}'
   * 提示：实例如何访问到自己的类？（this.constructor）
   */
  toJSON() {
    // TODO
  },
};
