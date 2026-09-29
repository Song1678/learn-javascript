/**
 * 练习 6-1：预测生成器的行为
 *
 * 规则同前：先不运行，把 run() 的返回值填入 answer；会抛错则填错误类型名。
 */
export const quiz = [
  {
    id: 1,
    title: '展开运算符与 return 值',
    run() {
      function* steps() {
        yield '下单';
        yield '支付';
        return '完成';
      }
      return [...steps()].join(',');
    },
    answer: '下单,支付',
    // 💡 for...of / 展开运算符 / Array.from 在 done: true 时停止，并「丢弃」return 的值。
  },
  {
    id: 2,
    title: '手动调用 next',
    run() {
      function* steps() {
        yield '下单';
        yield '支付';
        return '完成';
      }
      const it = steps();
      it.next();
      it.next();
      const r3 = it.next();
      const r4 = it.next();
      return `${r3.value}-${r3.done}|${r4.value}-${r4.done}`;
    },
    answer: '完成-true|undefined-true',
    // 💡 return 的值只会在第一次 done: true 时出现一次，之后永远是 { value: undefined, done: true }。
  },
  {
    id: 3,
    title: '生成器函数调用时不会执行函数体',
    run() {
      const log = [];
      function* g() {
        log.push('start');
        yield 1;
      }
      const it = g();
      log.push('created');
      it.next();
      return log.join(',');
    },
    answer: 'created,start',
    // 💡 调用生成器函数只是创建迭代器对象，函数体一行都不执行，直到第一次 next()。这就是「惰性」。
  },
  {
    id: 4,
    title: 'next(value) 双向通信',
    run() {
      function* calc() {
        const x = yield 'x?';
        const y = yield x * 2;
        return x + y;
      }
      const it = calc();
      const a = it.next('被忽略').value;
      const b = it.next(5).value;
      const c = it.next(1).value;
      return [a, b, c].join(',');
    },
    answer: 'x?,10,6',
    // 💡 next(v) 的 v 会成为「上一个 yield 表达式」的值。第一次 next 前没有暂停中的 yield，所以参数被忽略。
  },
  {
    id: 5,
    title: 'yield* 委托与返回值',
    run() {
      function* inner() {
        yield 'a';
        return 'inner-result';
      }
      function* outer() {
        const r = yield* inner();
        yield r;
      }
      return [...outer()].join(',');
    },
    answer: 'a,inner-result',
    // 💡 yield* 表达式的值，就是被委托生成器的 return 值。
  },
  {
    id: 6,
    title: '提前 break 会触发 finally',
    run() {
      const log = [];
      function* readLines() {
        try {
          yield 'line1';
          yield 'line2';
        } finally {
          log.push('close-file');
        }
      }
      for (const line of readLines()) {
        log.push(line);
        break;
      }
      return log.join(',');
    },
    answer: 'line1,close-file',
    // 💡 for...of 提前退出（break / return / throw）时会调用迭代器的 return()，生成器的 finally 得以执行。
    //    这就是用生成器管理资源（文件句柄、数据库游标）的基础。
  },
  {
    id: 7,
    title: '生成器对象只能遍历一次',
    run() {
      function* g() {
        yield 1;
        yield 2;
      }
      const it = g();
      const first = [...it].length;
      const second = [...it].length;
      return `${first},${second}`;
    },
    answer: '2,0',
    // 💡 生成器对象既是迭代器又是可迭代对象，它的 [Symbol.iterator]() 返回自身，消费完就没了。
    //    需要多次遍历时，应该让「类」实现 [Symbol.iterator]，每次返回一个新的生成器。
  },
  {
    id: 8,
    title: 'throw() 注入错误',
    run() {
      function* g() {
        try {
          yield 1;
        } catch (e) {
          yield `caught:${e}`;
        }
        yield 3;
      }
      const it = g();
      const a = it.next().value;
      const b = it.throw('网络错误').value;
      const c = it.next().value;
      return [a, b, c].join(',');
    },
    answer: '1,caught:网络错误,3',
    // 💡 it.throw(e) 相当于在暂停的 yield 处抛出 e，生成器内部可以 try/catch。co / async 就是利用这点把 reject 变成 throw。
  },
  {
    id: 9,
    title: '无限生成器 + 解构',
    run() {
      function* naturals() {
        let n = 1;
        while (true) yield n++;
      }
      const [a, b, , d] = naturals();
      return [a, b, d].join(',');
    },
    answer: '1,2,4',
    // 💡 数组解构也使用迭代器协议，而且只取需要的个数，所以对无限生成器是安全的；但 [...naturals()] 会死循环。
  },
];
