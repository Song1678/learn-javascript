/**
 * 练习 7-1 参考答案：事件总线
 *
 * 设计要点：
 *   - 用 Map<event, Array<{ handler, original, once }>> 存储；数组保证顺序
 *   - once 的包装：记录 original，便于 off(event, originalHandler)
 *   - once 在「调用前」就移除，避免监听器内部再次 emit 同一事件时重复触发
 */
export class EventBus {
  #listeners = new Map();
  #onError;

  constructor({ onError } = {}) {
    this.#onError = onError ?? ((err, { event }) => console.error(`[EventBus] "${event}" 监听器出错：`, err));
  }

  #add(event, handler, once) {
    if (typeof handler !== 'function') throw new TypeError('handler 必须是函数');
    const list = this.#listeners.get(event) ?? [];
    if (!list.some((l) => l.original === handler)) {
      list.push({ original: handler, once });
      this.#listeners.set(event, list);
    }
    return () => this.off(event, handler);
  }

  on(event, handler) {
    return this.#add(event, handler, false);
  }

  once(event, handler) {
    return this.#add(event, handler, true);
  }

  off(event, handler) {
    if (handler === undefined) {
      this.#listeners.delete(event);
      return;
    }
    const list = this.#listeners.get(event);
    if (!list) return;
    const rest = list.filter((l) => l.original !== handler);
    if (rest.length) this.#listeners.set(event, rest);
    else this.#listeners.delete(event);
  }

  /** 取出本次需要调用的监听器快照，并提前移除 once 监听器 */
  #collect(event) {
    const pick = (name, toArgs) =>
      (this.#listeners.get(name) ?? []).map((l) => ({ ...l, source: name, toArgs }));
    const all = [
      ...pick(event, (args) => args),
      // '*' 监听器额外收到事件名；emit('*') 本身不重复触发
      ...(event === '*' ? [] : pick('*', (args) => [event, ...args])),
    ];
    for (const l of all) {
      if (l.once) this.off(l.source, l.original);
    }
    return all;
  }

  #report(err, event, handler) {
    try {
      this.#onError(err, { event, handler });
    } catch {
      // onError 自身出错时不再处理，避免影响主流程
    }
  }

  emit(event, ...args) {
    const listeners = this.#collect(event);
    for (const l of listeners) {
      try {
        l.original.apply(this, l.toArgs(args));
      } catch (err) {
        this.#report(err, event, l.original);
      }
    }
    return listeners.length > 0;
  }

  async emitAsync(event, ...args) {
    const listeners = this.#collect(event);
    const results = await Promise.allSettled(
      listeners.map((l) => Promise.resolve().then(() => l.original.apply(this, l.toArgs(args)))),
    );
    let failed = 0;
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        failed++;
        this.#report(r.reason, event, listeners[i].original);
      }
    });
    return { ok: results.length - failed, failed };
  }

  listenerCount(event) {
    return this.#listeners.get(event)?.length ?? 0;
  }
}
