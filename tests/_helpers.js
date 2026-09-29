/**
 * 测试辅助工具（学习者无需修改）
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { test, describe } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 加载练习模块：默认加载 exercises/ 下你的代码，
 * 设置 SOLUTION=1（npm test -- --solution）时加载 solutions/ 下的参考答案。
 */
export function load(relPath) {
  const base = process.env.SOLUTION === '1' ? 'solutions' : 'exercises';
  return import(pathToFileURL(path.join(root, base, relPath)).href);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 判定「预测输出」类题目：
 * 执行题目中的 run()，把真实结果与你填写的 answer 比较。
 * 为了不直接泄露答案，答错时只提示题号和你的答案。
 */
export function checkQuiz(quiz) {
  for (const q of quiz) {
    test(`第 ${q.id} 题：${q.title}`, async () => {
      assert.notEqual(q.answer, '?', `第 ${q.id} 题还没作答（answer 仍是 '?'）`);
      let actual;
      try {
        const { run } = q; // 注意：刻意脱离 q 调用，run 内部的 this 为 undefined
        actual = await run();
      } catch (err) {
        actual = err.name;
      }
      if (!Object.is(actual, q.answer) && String(actual) === String(q.answer)) {
        assert.fail(`第 ${q.id} 题的值对了，但类型不对：你填的是 ${typeof q.answer}，再想想返回值是什么类型`);
      }
      assert.ok(
        Object.is(actual, q.answer),
        `第 ${q.id} 题答错了，你的答案是 ${JSON.stringify(q.answer)}。再想想，想不通可以 console.log 或对照 solutions/`,
      );
    });
  }
}

/** 记录并发数的工具：包装一个异步函数，统计同时在执行的最大数量 */
export function trackConcurrency(fn) {
  let running = 0;
  const stats = { max: 0, calls: 0 };
  const wrapped = async (...args) => {
    running++;
    stats.calls++;
    stats.max = Math.max(stats.max, running);
    try {
      return await fn(...args);
    } finally {
      running--;
    }
  };
  return { fn: wrapped, stats };
}

/** 获取函数源码，并去掉注释和字符串字面量（用于检查「是否使用了某语法」） */
export function codeOf(fn) {
  return fn
    .toString()
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, '""');
}

/**
 * 进阶用例：使用 --basic（基础模式）运行时会被跳过。
 * 第一遍学习时用基础模式，先把核心要求做对；回头再去掉 --basic 挑战完整要求。
 */
const BASIC = process.env.BASIC === '1';
const SKIP_REASON = '基础模式下跳过（去掉 --basic 即可挑战）';

export function advancedTest(name, fn) {
  return test(`[进阶] ${name}`, { skip: BASIC && SKIP_REASON }, fn);
}

export function advancedDescribe(name, fn) {
  return describe(`[进阶] ${name}`, { skip: BASIC && SKIP_REASON }, fn);
}
