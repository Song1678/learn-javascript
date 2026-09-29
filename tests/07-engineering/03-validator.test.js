import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, advancedDescribe } from '../_helpers.js';

const { v, SchemaError } = await load('07-engineering/03-validator.js');

const paths = (result) => result.issues.map((i) => i.path).sort();

advancedDescribe('基础类型', () => {
  test('string', () => {
    assert.deepEqual(v.string().safeParse('abc'), { success: true, data: 'abc' });
    assert.equal(v.string().safeParse(1).success, false);
    assert.equal(v.string().min(2).safeParse('a').success, false);
    assert.equal(v.string().max(2).safeParse('abc').success, false);
    assert.equal(v.string().pattern(/^\d+$/).safeParse('12a').success, false);
    assert.equal(v.string().min(1).max(3).pattern(/^\d+$/).safeParse('123').success, true);
  });

  test('number', () => {
    assert.equal(v.number().safeParse(1.5).success, true);
    assert.equal(v.number().safeParse('1').success, false);
    assert.equal(v.number().safeParse(NaN).success, false, 'NaN 视为类型错误');
    assert.equal(v.number().int().safeParse(1.5).success, false);
    assert.equal(v.number().positive().safeParse(0).success, false);
    assert.equal(v.number().min(1).max(10).safeParse(11).success, false);
  });

  test('boolean / enum', () => {
    assert.equal(v.boolean().safeParse(false).success, true);
    assert.equal(v.boolean().safeParse('false').success, false);
    assert.equal(v.enum(['alipay', 'wechat']).safeParse('wechat').success, true);
    assert.equal(v.enum(['alipay', 'wechat']).safeParse('paypal').success, false);
  });

  test('自定义错误信息', () => {
    const r = v.string().min(6, '密码至少 6 位').safeParse('123');
    assert.deepEqual(r.issues, [{ path: '', message: '密码至少 6 位' }]);
  });

  test('类型错误时只报告类型错误', () => {
    const r = v.string().min(3).pattern(/x/).safeParse(123);
    assert.equal(r.issues.length, 1);
  });

  test('多个规则不通过时全部报告', () => {
    const r = v.number().int().positive().safeParse(-1.5);
    assert.equal(r.issues.length, 2);
  });
});

advancedDescribe('optional / default / refine', () => {
  test('必填与可选', () => {
    assert.deepEqual(v.string().safeParse(undefined).issues, [{ path: '', message: '必填' }]);
    assert.deepEqual(v.string().min(3).optional().safeParse(undefined), { success: true, data: undefined });
    assert.equal(v.string().optional().safeParse(null).success, false, 'null 不等于 undefined');
  });

  test('default', () => {
    assert.equal(v.enum(['a', 'b']).default('a').parse(undefined), 'a');
    assert.equal(v.enum(['a', 'b']).default('a').parse('b'), 'b');
    let n = 0;
    const s = v.number().default(() => ++n);
    assert.equal(s.parse(undefined), 1);
    assert.equal(s.parse(undefined), 2);
  });

  test('refine', () => {
    const even = v.number().refine((x) => x % 2 === 0, '必须是偶数');
    assert.equal(even.safeParse(4).success, true);
    assert.deepEqual(even.safeParse(3).issues, [{ path: '', message: '必须是偶数' }]);
  });
});

advancedDescribe('不可变性', () => {
  test('链式方法返回新实例，不修改原 schema', () => {
    const base = v.string();
    const short = base.max(3);
    const optional = base.optional();
    assert.notEqual(base, short);
    assert.equal(base.safeParse('abcdef').success, true, 'base 不应受 max(3) 影响');
    assert.equal(short.safeParse('abcdef').success, false);
    assert.equal(base.safeParse(undefined).success, false, 'base 不应受 optional() 影响');
    assert.equal(optional.safeParse(undefined).success, true);
  });

  test('链式方法返回同类型的 schema，可以继续调用该类型特有的方法', () => {
    const s = v.number().optional().int().positive();
    assert.equal(s.safeParse(3).success, true);
    assert.equal(s.safeParse(-3).success, false);
  });
});

advancedDescribe('嵌套结构：下单请求', () => {
  const createOrderSchema = v.object({
    userId: v.string().min(1),
    items: v
      .array(
        v.object({
          sku: v.string().pattern(/^SKU\d+$/, 'SKU 格式错误'),
          qty: v.number().int().positive(),
        }),
      )
      .min(1, '至少购买一件商品'),
    remark: v.string().max(50).optional(),
    payMethod: v.enum(['alipay', 'wechat']).default('alipay'),
  });

  test('合法数据：应用默认值，丢弃未声明字段', () => {
    const data = createOrderSchema.parse({
      userId: 'u1',
      items: [{ sku: 'SKU1', qty: 2, price: 0.01 }],
      isAdmin: true,
    });
    assert.deepEqual(data, { userId: 'u1', items: [{ sku: 'SKU1', qty: 2 }], payMethod: 'alipay' });
    assert.ok(!('remark' in data), '未提供的可选字段不应出现在结果中');
  });

  test('报告所有错误及其路径', () => {
    const r = createOrderSchema.safeParse({
      userId: '',
      items: [
        { sku: 'SKU1', qty: 1 },
        { sku: 'bad', qty: 0 },
        { qty: 1.5 },
      ],
      payMethod: 'paypal',
    });
    assert.equal(r.success, false);
    assert.deepEqual(paths(r), ['items[1].qty', 'items[1].sku', 'items[2].qty', 'items[2].sku', 'payMethod', 'userId']);
    assert.equal(r.issues.find((i) => i.path === 'items[1].sku').message, 'SKU 格式错误');
    assert.equal(r.issues.find((i) => i.path === 'items[2].sku').message, '必填');
  });

  test('数组自身的规则', () => {
    const r = createOrderSchema.safeParse({ userId: 'u1', items: [] });
    assert.deepEqual(r.issues, [{ path: 'items', message: '至少购买一件商品' }]);
  });

  test('类型错误', () => {
    assert.deepEqual(paths(createOrderSchema.safeParse({ userId: 'u', items: 'x' })), ['items']);
    assert.deepEqual(paths(createOrderSchema.safeParse(null)), ['']);
    assert.deepEqual(paths(createOrderSchema.safeParse([])), ['']);
  });

  test('parse 失败抛出 SchemaError', () => {
    assert.throws(
      () => createOrderSchema.parse({ userId: 1, items: [] }),
      (err) => {
        assert.ok(err instanceof SchemaError);
        assert.ok(err instanceof Error);
        assert.equal(err.name, 'SchemaError');
        assert.equal(err.issues.length, 2);
        assert.equal(typeof err.message, 'string');
        return true;
      },
    );
  });

  test('对象级 refine：确认密码', () => {
    const register = v
      .object({ password: v.string().min(6), confirm: v.string() })
      .refine((o) => o.password === o.confirm, '两次输入的密码不一致');
    assert.equal(register.safeParse({ password: '123456', confirm: '123456' }).success, true);
    assert.deepEqual(register.safeParse({ password: '123456', confirm: '654321' }).issues, [
      { path: '', message: '两次输入的密码不一致' },
    ]);
    assert.deepEqual(
      paths(register.safeParse({ password: '1', confirm: '2' })),
      ['password'],
      '子字段有错误时，不再执行对象级 refine',
    );
  });
});
