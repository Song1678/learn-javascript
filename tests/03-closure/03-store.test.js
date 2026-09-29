import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, advancedDescribe, advancedTest } from '../_helpers.js';

const { createStore, applyMiddleware } = await load('03-closure/03-store.js');

function cartReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'cart/add':
      return { ...state, count: state.count + action.payload };
    case 'cart/clear':
      return { ...state, count: 0 };
    default:
      return state;
  }
}

describe('createStore', () => {
  test('初始化时使用 reducer 的默认 state', () => {
    const store = createStore(cartReducer);
    assert.deepEqual(store.getState(), { count: 0 });
  });

  test('preloadedState 优先', () => {
    const store = createStore(cartReducer, { count: 5 });
    assert.deepEqual(store.getState(), { count: 5 });
  });

  test('dispatch 更新 state 并返回 action', () => {
    const store = createStore(cartReducer);
    const action = { type: 'cart/add', payload: 2 };
    assert.equal(store.dispatch(action), action);
    store.dispatch({ type: 'cart/add', payload: 3 });
    assert.equal(store.getState().count, 5);
  });

  test('state 是私有的', () => {
    const store = createStore(cartReducer);
    assert.deepEqual(Object.keys(store).sort(), ['dispatch', 'getState', 'subscribe']);
  });

  test('非法 action 抛出 TypeError', () => {
    const store = createStore(cartReducer);
    assert.throws(() => store.dispatch(null), TypeError);
    assert.throws(() => store.dispatch('cart/add'), TypeError);
    assert.throws(() => store.dispatch({}), TypeError);
    assert.throws(() => store.dispatch(() => {}), TypeError);
  });

  advancedTest('reducer 中 dispatch 会抛错，且之后 store 仍可正常使用', () => {
    let store;
    const bad = (state = 0, action) => {
      if (action.type === 'bad') store.dispatch({ type: 'other' });
      return state + 1;
    };
    store = createStore(bad);
    assert.throws(() => store.dispatch({ type: 'bad' }), Error);
    assert.doesNotThrow(() => store.dispatch({ type: 'ok' }));
  });

  test('subscribe 按顺序通知，unsubscribe 可重复调用', () => {
    const store = createStore(cartReducer);
    const log = [];
    const un1 = store.subscribe(() => log.push(`nav:${store.getState().count}`));
    store.subscribe(() => log.push(`sidebar:${store.getState().count}`));
    store.dispatch({ type: 'cart/add', payload: 1 });
    un1();
    un1();
    store.dispatch({ type: 'cart/add', payload: 1 });
    assert.deepEqual(log, ['nav:1', 'sidebar:1', 'sidebar:2']);
  });

  advancedTest('通知过程中订阅/取消订阅不影响本轮通知', () => {
    const store = createStore(cartReducer);
    const log = [];
    let unB;
    store.subscribe(() => {
      log.push('A');
      unB(); // 取消 B，但本轮 B 仍应被通知
      store.subscribe(() => log.push('C')); // 新增 C，本轮不应被通知
    });
    unB = store.subscribe(() => log.push('B'));
    store.dispatch({ type: 'cart/add', payload: 1 });
    assert.deepEqual(log, ['A', 'B']);
  });
});

advancedDescribe('applyMiddleware（附加题）', () => {
  const thunk = ({ dispatch, getState }) => (next) => (action) =>
    typeof action === 'function' ? action(dispatch, getState) : next(action);

  test('中间件按顺序执行，能拿到 getState', () => {
    const log = [];
    const logger = ({ getState }) => (next) => (action) => {
      log.push(`before:${getState().count}`);
      const result = next(action);
      log.push(`after:${getState().count}`);
      return result;
    };
    const tag = (name) => () => (next) => (action) => {
      log.push(name);
      return next(action);
    };
    const store = createStore(cartReducer, undefined, applyMiddleware(tag('first'), logger, tag('last')));
    store.dispatch({ type: 'cart/add', payload: 3 });
    assert.deepEqual(log, ['first', 'before:0', 'last', 'after:3']);
    assert.equal(store.getState().count, 3);
  });

  test('thunk：dispatch 函数，且内部 dispatch 的 action 也经过所有中间件', async () => {
    const seen = [];
    const spy = () => (next) => (action) => {
      if (typeof action === 'object') seen.push(action.type);
      return next(action);
    };
    const store = createStore(cartReducer, undefined, applyMiddleware(thunk, spy));
    const addLater = (n) => async (dispatch) => {
      await Promise.resolve();
      dispatch({ type: 'cart/add', payload: n });
      return 'done';
    };
    assert.equal(await store.dispatch(addLater(4)), 'done');
    assert.equal(store.getState().count, 4);
    assert.deepEqual(seen, ['cart/add']);
  });
});
