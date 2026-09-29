/**
 * 练习 3-3 参考答案：迷你 Redux
 */
export function createStore(reducer, preloadedState, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer, preloadedState);
  }

  // 以下变量都活在闭包里，外部只能通过返回的三个函数间接访问
  let state = preloadedState;
  let listeners = [];
  let isDispatching = false;

  function getState() {
    return state;
  }

  function dispatch(action) {
    if (action === null || typeof action !== 'object' || Array.isArray(action)) {
      throw new TypeError('action 必须是普通对象');
    }
    if (typeof action.type !== 'string') {
      throw new TypeError('action.type 必须是字符串');
    }
    if (isDispatching) {
      throw new Error('reducer 执行期间不能 dispatch');
    }
    try {
      isDispatching = true;
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }
    // 快照：通知过程中 subscribe/unsubscribe 会生成新数组，不影响当前这一轮遍历
    const snapshot = listeners;
    for (const listener of snapshot) listener();
    return action;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('listener 必须是函数');
    listeners = [...listeners, listener];
    let subscribed = true;
    return function unsubscribe() {
      if (!subscribed) return;
      subscribed = false;
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  dispatch({ type: '@@INIT' });

  return { getState, dispatch, subscribe };
}

export function applyMiddleware(...middlewares) {
  return (createStoreFn) => (reducer, preloadedState) => {
    const store = createStoreFn(reducer, preloadedState);

    // 先占位：构造中间件链的过程中不允许 dispatch
    let dispatch = () => {
      throw new Error('正在构造中间件，暂时不能 dispatch');
    };
    const api = {
      getState: store.getState,
      // 通过闭包引用「最终的」dispatch 变量，而不是此刻的值
      dispatch: (action) => dispatch(action),
    };
    const chain = middlewares.map((mw) => mw(api));
    // compose(f, g, h)(x) === f(g(h(x)))：从右往左包装
    dispatch = chain.reduceRight((next, mw) => mw(next), store.dispatch);

    return { ...store, dispatch };
  };
}
