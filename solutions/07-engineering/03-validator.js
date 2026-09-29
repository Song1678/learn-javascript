/**
 * 练习 7-3 参考答案：迷你 Schema 校验库
 *
 * 设计要点：
 *   - 基类 Schema 实现通用能力（optional / default / refine / parse / safeParse），子类只负责「类型检查」
 *     —— 这是「模板方法」模式：基类定义流程骨架，子类重写其中的某一步（_parseType）
 *   - 每个链式方法都返回「新」实例（不可变），通过 _clone 复制。
 *     _clone 用 Object.create(Object.getPrototypeOf(this)) 保证副本和原对象是同一个子类（原型链知识）
 */

export class SchemaError extends Error {
  constructor(issues) {
    super(issues.map((i) => `${i.path || '(root)'}: ${i.message}`).join('; '));
    this.name = 'SchemaError';
    this.issues = issues;
  }
}

export class Schema {
  constructor() {
    this._checks = []; // { fn, message }
    this._optional = false;
    this._default = undefined;
  }

  _clone() {
    const copy = Object.create(Object.getPrototypeOf(this));
    Object.assign(copy, this);
    copy._checks = [...this._checks];
    return copy;
  }

  /** 复制自身、修改副本、返回副本 */
  _with(mutate) {
    const copy = this._clone();
    mutate(copy);
    return copy;
  }

  optional() {
    return this._with((s) => {
      s._optional = true;
    });
  }

  default(value) {
    return this._with((s) => {
      s._optional = true;
      s._default = value;
    });
  }

  refine(fn, message = '校验未通过') {
    return this._with((s) => {
      s._checks.push({ fn, message });
    });
  }

  /** 子类重写：检查类型，返回（可能经过转换的）值；出错时向 issues push 并返回任意值 */
  _parseType(value, path, issues) {
    return value;
  }

  _run(value, path, issues) {
    if (value === undefined && this._default !== undefined) {
      value = typeof this._default === 'function' ? this._default() : this._default;
    }
    if (value === undefined) {
      if (!this._optional) issues.push({ path, message: '必填' });
      return undefined;
    }
    const before = issues.length;
    const parsed = this._parseType(value, path, issues);
    if (issues.length > before) return parsed; // 类型/子元素有错误时，不再执行后续校验
    for (const { fn, message } of this._checks) {
      if (!fn(parsed)) issues.push({ path, message });
    }
    return parsed;
  }

  safeParse(value) {
    const issues = [];
    const data = this._run(value, '', issues);
    return issues.length ? { success: false, issues } : { success: true, data };
  }

  parse(value) {
    const result = this.safeParse(value);
    if (!result.success) throw new SchemaError(result.issues);
    return result.data;
  }
}

class StringSchema extends Schema {
  _parseType(value, path, issues) {
    if (typeof value !== 'string') issues.push({ path, message: `期望字符串，实际为 ${typeof value}` });
    return value;
  }
  min(n, message = `长度不能少于 ${n}`) {
    return this.refine((v) => v.length >= n, message);
  }
  max(n, message = `长度不能超过 ${n}`) {
    return this.refine((v) => v.length <= n, message);
  }
  pattern(regex, message = '格式不正确') {
    return this.refine((v) => regex.test(v), message);
  }
}

class NumberSchema extends Schema {
  _parseType(value, path, issues) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      issues.push({ path, message: `期望数字，实际为 ${typeof value}` });
    }
    return value;
  }
  int(message = '必须是整数') {
    return this.refine((v) => Number.isInteger(v), message);
  }
  min(n, message = `不能小于 ${n}`) {
    return this.refine((v) => v >= n, message);
  }
  max(n, message = `不能大于 ${n}`) {
    return this.refine((v) => v <= n, message);
  }
  positive(message = '必须大于 0') {
    return this.refine((v) => v > 0, message);
  }
}

class BooleanSchema extends Schema {
  _parseType(value, path, issues) {
    if (typeof value !== 'boolean') issues.push({ path, message: `期望布尔值，实际为 ${typeof value}` });
    return value;
  }
}

class EnumSchema extends Schema {
  constructor(values) {
    super();
    this._values = values;
  }
  _parseType(value, path, issues) {
    if (!this._values.includes(value)) issues.push({ path, message: `必须是 ${this._values.join(' / ')} 之一` });
    return value;
  }
}

class ArraySchema extends Schema {
  constructor(item) {
    super();
    this._item = item;
  }
  _parseType(value, path, issues) {
    if (!Array.isArray(value)) {
      issues.push({ path, message: '期望数组' });
      return value;
    }
    return value.map((el, i) => this._item._run(el, `${path}[${i}]`, issues));
  }
  min(n, message = `至少包含 ${n} 项`) {
    return this.refine((v) => v.length >= n, message);
  }
  max(n, message = `最多包含 ${n} 项`) {
    return this.refine((v) => v.length <= n, message);
  }
}

class ObjectSchema extends Schema {
  constructor(shape) {
    super();
    this._shape = shape;
  }
  _parseType(value, path, issues) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      issues.push({ path, message: '期望对象' });
      return value;
    }
    const result = {};
    for (const [key, schema] of Object.entries(this._shape)) {
      const parsed = schema._run(value[key], path ? `${path}.${key}` : key, issues);
      if (parsed !== undefined) result[key] = parsed; // 未声明的字段被丢弃
    }
    return result;
  }
}

export const v = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  enum: (values) => new EnumSchema(values),
  array: (item) => new ArraySchema(item),
  object: (shape) => new ObjectSchema(shape),
};
