/**
 * 练习 6-1：预测生成器的行为  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
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
    answer: '?',
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
    answer: '?',
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
    answer: '?',
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
    answer: '?',
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
    answer: '?',
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
    answer: '?',
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
    answer: '?',
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
    answer: '?',
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
    answer: '?',
  },
];
