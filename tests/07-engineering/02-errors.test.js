import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from '../_helpers.js';

const { AppError, ValidationError, NotFoundError, ConflictError, toHttpResponse, assertFound } = await load(
  '07-engineering/02-errors.js',
);

describe('AppError', () => {
  test('基本属性与默认值', () => {
    const err = new AppError('出错了');
    assert.ok(err instanceof Error);
    assert.equal(err.name, 'AppError');
    assert.equal(err.message, '出错了');
    assert.equal(err.code, 'INTERNAL_ERROR');
    assert.equal(err.status, 500);
    assert.equal(err.details, undefined);
    assert.ok(err.stack.includes('出错了'), '应当有堆栈信息');
  });

  test('自定义 code / status / details / cause', () => {
    const dbError = new Error('ER_DUP_ENTRY: Duplicate entry');
    const err = new AppError('创建用户失败', {
      code: 'USER_CREATE_FAILED',
      status: 502,
      details: { field: 'email' },
      cause: dbError,
    });
    assert.equal(err.code, 'USER_CREATE_FAILED');
    assert.equal(err.status, 502);
    assert.deepEqual(err.details, { field: 'email' });
    assert.equal(err.cause, dbError);
  });

  test('toJSON 便于日志输出', () => {
    const err = new AppError('x', { code: 'C', details: { a: 1 } });
    assert.deepEqual(JSON.parse(JSON.stringify(err)), { name: 'AppError', code: 'C', message: 'x', details: { a: 1 } });
  });

  test('任意子类的 name 自动正确', () => {
    class PaymentError extends AppError {}
    assert.equal(new PaymentError('支付失败').name, 'PaymentError');
  });
});

describe('子类', () => {
  test('ValidationError', () => {
    const err = new ValidationError('参数错误', [{ path: 'qty', message: '必须为正整数' }]);
    assert.ok(err instanceof ValidationError && err instanceof AppError && err instanceof Error);
    assert.equal(err.name, 'ValidationError');
    assert.equal(err.status, 400);
    assert.equal(err.code, 'VALIDATION_FAILED');
    assert.deepEqual(err.details, [{ path: 'qty', message: '必须为正整数' }]);
  });

  test('NotFoundError', () => {
    const err = new NotFoundError('订单', 'SO123');
    assert.ok(err instanceof AppError);
    assert.equal(err.name, 'NotFoundError');
    assert.equal(err.message, '订单 SO123 不存在');
    assert.equal(err.status, 404);
    assert.equal(err.code, 'NOT_FOUND');
    assert.deepEqual(err.details, { resource: '订单', id: 'SO123' });
    assert.ok(err.stack);
  });

  test('ConflictError', () => {
    const err = new ConflictError('订单状态不允许支付', { status: 'CANCELLED' });
    assert.equal(err.name, 'ConflictError');
    assert.equal(err.status, 409);
    assert.equal(err.code, 'CONFLICT');
    assert.deepEqual(err.details, { status: 'CANCELLED' });
  });
});

describe('toHttpResponse', () => {
  test('AppError 转换为对应的响应', () => {
    assert.deepEqual(toHttpResponse(new NotFoundError('商品', 7)), {
      status: 404,
      body: { code: 'NOT_FOUND', message: '商品 7 不存在', details: { resource: '商品', id: 7 } },
    });
  });

  test('未知错误不泄露内部信息', () => {
    const expected = {
      status: 500,
      body: { code: 'INTERNAL_ERROR', message: '服务器内部错误', details: undefined },
    };
    assert.deepEqual(toHttpResponse(new Error("SELECT * FROM users WHERE password='...'")), expected);
    assert.deepEqual(toHttpResponse(new TypeError('x is undefined')), expected);
    assert.deepEqual(toHttpResponse('字符串错误'), expected);
    assert.deepEqual(toHttpResponse(undefined), expected);
  });
});

describe('assertFound', () => {
  test('有值时原样返回', () => {
    const order = { id: 1 };
    assert.equal(assertFound(order, '订单', 1), order);
    assert.equal(assertFound(0, '计数', 1), 0, '0 / 空字符串 / false 都是合法的值');
    assert.equal(assertFound('', 'x', 1), '');
  });

  test('null / undefined 时抛出 NotFoundError', () => {
    assert.throws(() => assertFound(null, '订单', 'SO1'), NotFoundError);
    assert.throws(() => assertFound(undefined, '订单', 'SO1'), { message: '订单 SO1 不存在' });
  });
});
