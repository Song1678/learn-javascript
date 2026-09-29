/**
 * 练习 7-3（挑战题）：实现一个迷你 Schema 校验库（类似 zod / yup）  🏆 选做
 *
 * 【业务背景】
 * 下单接口收到的请求体需要严格校验。之前的代码是一长串 if：
 *
 *   if (!body.userId || typeof body.userId !== 'string') throw ...
 *   if (!Array.isArray(body.items) || body.items.length === 0) throw ...
 *   for (const item of body.items) { if (!Number.isInteger(item.qty) || item.qty <= 0) throw ... }
 *   ...
 *
 * 又长又容易漏，而且只能报告第一个错误。团队希望用声明式的写法：
 *
 *   const createOrderSchema = v.object({
 *     userId: v.string().min(1),
 *     items: v.array(v.object({
 *       sku: v.string().pattern(/^SKU\d+$/, 'SKU 格式错误'),
 *       qty: v.number().int().positive(),
 *     })).min(1, '至少购买一件商品'),
 *     remark: v.string().max(50).optional(),
 *     payMethod: v.enum(['alipay', 'wechat']).default('alipay'),
 *   });
 *
 *   const body = createOrderSchema.parse(req.body);   // 失败抛出 SchemaError，包含所有错误
 *   const result = createOrderSchema.safeParse(req.body); // 不抛错：{ success, data } 或 { success, issues }
 *
 * 【这道题练习的 JS 能力】
 *   - 链式调用（每个方法返回 schema 对象）与 this
 *   - 类继承 + 模板方法模式：基类定义流程，子类重写「类型检查」这一步
 *   - 不可变性：base.min(3) 必须返回「新的」schema，不能修改 base（否则复用 schema 时互相污染）
 *   - 递归：对象、数组嵌套校验，并拼出错误路径 'items[0].qty'
 *
 * 【规格】
 *   issue 格式：{ path: string, message: string }
 *     path 规则：根为 ''；对象属性 'a'、'a.b'；数组元素 'items[0]'、'items[0].qty'
 *
 *   通用（所有 schema）：
 *     optional()        允许 undefined（值为 undefined 时跳过所有校验）
 *     default(value)    值为 undefined 时使用默认值（value 为函数时调用它取值），隐含 optional
 *     refine(fn, msg)   自定义校验：fn(value) 返回 false 时报告 msg
 *     parse(value) / safeParse(value)
 *     值为 undefined 且不是 optional → issue：'必填'
 *     类型不符时只报告类型错误，不再执行 min/max/refine 等校验
 *
 *   v.string()   .min(n, msg?) .max(n, msg?) .pattern(regex, msg?)
 *   v.number()   .int(msg?) .min(n, msg?) .max(n, msg?) .positive(msg?)       NaN 视为类型错误
 *   v.boolean()
 *   v.enum(values)
 *   v.array(itemSchema)   .min(n, msg?) .max(n, msg?)  逐项校验，报告所有元素的错误
 *   v.object(shape)       逐字段校验；输出中「丢弃」未在 shape 中声明的字段（防止多余字段写入数据库）
 *                         值为 undefined 的可选字段，输出中不包含该 key
 *   数组、对象存在子元素错误时，不再执行它自身的 min/max/refine
 *
 *   SchemaError extends Error：name 为 'SchemaError'，issues 属性为全部 issue 数组
 *
 * 提示：
 *   - 让每个 schema 有一个内部方法 _run(value, path, issues)，递归时把 path 和 issues 传下去
 *   - 实现 _clone()：Object.create(Object.getPrototypeOf(this)) + 复制属性（数组要复制一份新的）
 *   - min/max/positive/int/pattern 都可以基于 refine 实现
 */

export class SchemaError extends Error {
  // TODO
}

export class Schema {
  // TODO: optional / default / refine / parse / safeParse / _run / _clone ...
}

// TODO: StringSchema / NumberSchema / BooleanSchema / EnumSchema / ArraySchema / ObjectSchema

export const v = {
  string: () => {
    throw new Error('TODO');
  },
  number: () => {
    throw new Error('TODO');
  },
  boolean: () => {
    throw new Error('TODO');
  },
  enum: (values) => {
    throw new Error('TODO');
  },
  array: (item) => {
    throw new Error('TODO');
  },
  object: (shape) => {
    throw new Error('TODO');
  },
};
