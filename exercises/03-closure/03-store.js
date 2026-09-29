/**
 * 练习 3-3：实现一个迷你状态管理库（Redux 核心）
 *
 * 【业务背景】
 * 商城后台页面越来越复杂：购物车数量显示在顶部导航、侧边栏、结算页三个地方，
 * 任何一处修改，其它地方都要同步更新。团队决定引入「单一数据源 + 订阅通知」的模式，
 * 为了弄懂原理，先自己实现一个极简版本。
 *
 * 【用法】
 *   const store = createStore(cartReducer, { count: 0 });
 *   const unsubscribe = store.subscribe(() => render(store.getState()));
 *   store.dispatch({ type: 'cart/add', payload: 2 });
 *   unsubscribe();
 *
 * 【要求】createStore(reducer, preloadedState) 返回 { getState, dispatch, subscribe }：
 *  1. state 必须是私有的：只能通过 getState() 读取，外部无法直接替换（闭包）
 *  2. 创建时自动 dispatch 一次 { type: '@@INIT' }，让 reducer 有机会返回初始 state
 *     （即 preloadedState 为 undefined 时，reducer 的默认参数生效）
 *  3. dispatch(action)：
 *       - action 必须是带字符串 type 的普通对象，否则抛出 TypeError
 *       - 调用 reducer(state, action) 得到新 state，然后按订阅顺序通知所有 listener
 *       - 返回 action
 *       - 在 reducer 执行过程中调用 dispatch，抛出 Error（reducer 必须是纯函数）
 *  4. subscribe(listener) 返回 unsubscribe 函数：
 *       - 多次调用 unsubscribe 是安全的
 *       - 在通知过程中新增/取消订阅，不影响「本轮」通知的 listener 列表（快照）
 *
 * 【附加题】实现中间件 applyMiddleware(...middlewares)，用法：
 *   const store = createStore(reducer, undefined, applyMiddleware(logger, thunk));
 *
 *   中间件的签名（三层柯里化，这是闭包的经典应用）：
 *     const logger = ({ getState, dispatch }) => (next) => (action) => {
 *       console.log('before', getState());
 *       const result = next(action);
 *       console.log('after', getState());
 *       return result;
 *     };
 *
 *   createStore 的第三个参数 enhancer 存在时，应返回 enhancer(createStore)(reducer, preloadedState)。
 *   applyMiddleware 返回的 enhancer 需要：
 *     - 创建原始 store
 *     - 把中间件从右到左组合起来包装原始的 dispatch
 *     - 中间件拿到的 dispatch 应该是「包装后的」dispatch（这样 thunk 里 dispatch 的 action 也会经过所有中间件）
 */
export function createStore(reducer, preloadedState, enhancer) {
  // TODO
  throw new Error('TODO: 实现 createStore');
}

export function applyMiddleware(...middlewares) {
  // TODO（附加题）
  throw new Error('TODO: 实现 applyMiddleware');
}
