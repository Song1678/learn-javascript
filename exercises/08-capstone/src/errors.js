/**
 * 业务错误体系（已提供，与第 07 章练习 7-2 的参考答案相同）
 */

export class AppError extends Error {
  constructor(message, { code = 'INTERNAL_ERROR', status = 500, details, cause } = {}) {
    // 把 cause 交给原生 Error，它会成为不可枚举的 cause 属性，Node 打印错误时会一并显示
    super(message, cause === undefined ? undefined : { cause });
    // new.target 是实际被 new 的类，因此 new NotFoundError() 时 name 自动为 'NotFoundError'
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }

  toJSON() {
    return { name: this.name, code: this.code, message: this.message, details: this.details };
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, { code: 'VALIDATION_FAILED', status: 400, details });
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} ${id} 不存在`, { code: 'NOT_FOUND', status: 404, details: { resource, id } });
  }
}

export class ConflictError extends AppError {
  constructor(message, details) {
    super(message, { code: 'CONFLICT', status: 409, details });
  }
}

export function toHttpResponse(err) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: { code: err.code, message: err.message, details: err.details },
    };
  }
  // 未知错误：记录日志（真实项目中），但对外只返回通用信息
  return {
    status: 500,
    body: { code: 'INTERNAL_ERROR', message: '服务器内部错误', details: undefined },
  };
}

export function assertFound(value, resource, id) {
  if (value === null || value === undefined) throw new NotFoundError(resource, id);
  return value;
}
