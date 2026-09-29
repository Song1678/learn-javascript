# 第 07 章 提示

> 卡住时**只展开一级**，看完马上回去写代码。

## 练习 7-0：工程实践入门

<details><summary>提示</summary>

```js
class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} ${id} 不存在`);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}
```
createEmitter：`const listeners = {}`；on 时 `(listeners[event] ??= []).push(handler)`；emit 时 `(listeners[event] ?? []).forEach((h) => h(...args))`。
</details>

## 练习 7-1：事件总线

<details><summary>提示 1：数据结构</summary>

`#listeners = new Map()`，key 是事件名，value 是数组 `[{ handler, once }]`。
on：检查是否已存在同一 handler，不存在就 push；返回 `() => this.off(event, handler)`。
</details>

<details><summary>提示 2：emit 的错误隔离</summary>

```js
const list = [...(this.#listeners.get(event) ?? [])];  // 先复制一份快照
for (const l of list) {
  if (l.once) this.off(event, l.handler);             // 调用前先移除
  try {
    l.handler.apply(this, args);
  } catch (err) {
    this.#onError(err, { event, handler: l.handler });
  }
}
return list.length > 0;
```
</details>

<details><summary>提示 3：[进阶] emitAsync</summary>

把每个监听器包装成 `Promise.resolve().then(() => handler.apply(this, args))`（同步抛错也会变成 rejected），然后 `await Promise.allSettled(...)`，统计 fulfilled/rejected 的数量。
</details>

## 练习 7-2：错误体系

<details><summary>提示</summary>

```js
class AppError extends Error {
  constructor(message, { code = 'INTERNAL_ERROR', status = 500, details, cause } = {}) {
    super(message, { cause });
    this.name = new.target.name;   // new.target 是实际被 new 的那个类
    // ...
  }
}
class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} ${id} 不存在`, { code: 'NOT_FOUND', status: 404, details: { resource, id } });
  }
}
```
toHttpResponse：`if (err instanceof AppError) { ... }`，否则返回固定的 500 响应。
</details>

## 练习 7-3：🏆 Schema 校验

<details><summary>提示 1：先只做 v.string()</summary>

```js
class Schema {
  constructor() { this._checks = []; }
  _parseType(value, path, issues) { return value; }  // 子类重写
  _run(value, path, issues) { /* 必填检查 → 类型检查 → 依次执行 _checks */ }
  safeParse(value) {
    const issues = [];
    const data = this._run(value, '', issues);
    return issues.length ? { success: false, issues } : { success: true, data };
  }
}
class StringSchema extends Schema {
  _parseType(value, path, issues) {
    if (typeof value !== 'string') issues.push({ path, message: '期望字符串' });
    return value;
  }
}
```
</details>

<details><summary>提示 2：链式调用 + 不可变</summary>

```js
_clone() {
  const copy = Object.create(Object.getPrototypeOf(this));   // 同一个子类
  Object.assign(copy, this);
  copy._checks = [...this._checks];                          // 数组要复制新的
  return copy;
}
refine(fn, message) {
  const copy = this._clone();
  copy._checks.push({ fn, message });
  return copy;
}
min(n, message) { return this.refine((v) => v.length >= n, message); }
```
</details>

<details><summary>提示 3：对象与数组</summary>

ObjectSchema 的 `_parseType`：遍历 shape，对每个字段调用 `schema._run(value[key], path ? `${path}.${key}` : key, issues)`；ArraySchema 对每个元素调用 `item._run(el, `${path}[${i}]`, issues)`。
</details>
