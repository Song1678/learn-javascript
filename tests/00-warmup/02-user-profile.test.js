import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from '../_helpers.js';

const { formatPrice, normalizeUser, mergeOptions, pick, omit, updateQty, DEFAULT_AVATAR } = await load(
  '00-warmup/02-user-profile.js',
);

describe('1. formatPrice', () => {
  test('分转元', () => {
    assert.equal(formatPrice(1290), '¥12.90');
    assert.equal(formatPrice(39900), '¥399.00');
    assert.equal(formatPrice(5), '¥0.05');
    assert.equal(formatPrice(0), '¥0.00');
  });
});

describe('2. normalizeUser', () => {
  test('字段齐全', () => {
    const raw = { id: 1, nick_name: '小明', avatar_url: 'https://a.png', profile: { city: '杭州' } };
    assert.deepEqual(normalizeUser(raw), { id: 1, name: '小明', avatar: 'https://a.png', city: '杭州' });
  });

  test('缺少头像和 profile', () => {
    assert.deepEqual(normalizeUser({ id: 2, nick_name: '小红' }), {
      id: 2,
      name: '小红',
      avatar: DEFAULT_AVATAR,
      city: '未知',
    });
  });

  test('profile 存在但没有 city', () => {
    assert.equal(normalizeUser({ id: 3, nick_name: 'x', profile: {} }).city, '未知');
  });
});

describe('3. mergeOptions', () => {
  const defaults = { timeout: 3000, retries: 1, headers: { 'Content-Type': 'application/json' } };

  test('覆盖普通字段、合并 headers', () => {
    const result = mergeOptions(defaults, { timeout: 5000, headers: { Authorization: 'Bearer x' } });
    assert.deepEqual(result, {
      timeout: 5000,
      retries: 1,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer x' },
    });
  });

  test('options 不传 / 没有 headers', () => {
    assert.deepEqual(mergeOptions(defaults), defaults);
    assert.deepEqual(mergeOptions(defaults, { retries: 3 }).headers, defaults.headers);
  });

  test('不修改传入的对象', () => {
    const options = { headers: { Authorization: 'Bearer x' } };
    const result = mergeOptions(defaults, options);
    result.headers.X = '1';
    assert.deepEqual(defaults.headers, { 'Content-Type': 'application/json' });
    assert.deepEqual(options.headers, { Authorization: 'Bearer x' });
  });
});

describe('4~5. pick / omit', () => {
  const user = { id: 1, name: '小明', password: '123456', token: 'abc' };

  test('pick', () => {
    assert.deepEqual(pick(user, ['id', 'name']), { id: 1, name: '小明' });
    assert.deepEqual(pick(user, ['id', 'notExist']), { id: 1 });
  });

  test('omit', () => {
    assert.deepEqual(omit(user, ['password', 'token']), { id: 1, name: '小明' });
    assert.equal(user.password, '123456', '不能修改原对象');
  });
});

describe('6. updateQty', () => {
  const cart = {
    userId: 'u1',
    items: [
      { sku: 'A', qty: 1 },
      { sku: 'B', qty: 2 },
    ],
  };

  test('修改数量', () => {
    assert.deepEqual(updateQty(cart, 'B', 5), {
      userId: 'u1',
      items: [
        { sku: 'A', qty: 1 },
        { sku: 'B', qty: 5 },
      ],
    });
  });

  test('数量为 0 时移除商品', () => {
    assert.deepEqual(updateQty(cart, 'A', 0).items, [{ sku: 'B', qty: 2 }]);
  });

  test('返回新对象，不修改原购物车', () => {
    const next = updateQty(cart, 'B', 5);
    assert.notEqual(next, cart, '应返回新的购物车对象');
    assert.notEqual(next.items, cart.items, 'items 也应该是新数组');
    assert.equal(cart.items[1].qty, 2, '原购物车中的数量不应改变');
    assert.equal(next.items[0], cart.items[0], '没有修改的商品可以复用原对象');
  });
});
