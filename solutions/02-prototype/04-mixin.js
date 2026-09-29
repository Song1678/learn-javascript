/**
 * 练习 2-4 参考答案：实现 mixin
 */

export function mixin(Base, ...mixins) {
  class Mixed extends Base {}
  for (const m of mixins) {
    // getOwnPropertyDescriptors 拿到的是「描述符」，不会触发 getter；
    // 它内部使用 ownKeys，Symbol 与不可枚举属性都包含在内
    Object.defineProperties(Mixed.prototype, Object.getOwnPropertyDescriptors(m));
  }
  Object.defineProperty(Mixed, 'name', { value: `${Base.name}With${mixins.length}Mixins` });
  return Mixed;
}

export const Timestamps = {
  touch() {
    this.updatedAt = Date.now();
    return this;
  },
  get age() {
    return Date.now() - this.createdAt;
  },
};

export const Serializable = {
  toJSON() {
    const fields = this.constructor.fields ?? Object.keys(this);
    return Object.fromEntries(fields.map((key) => [key, this[key]]));
  },
};
