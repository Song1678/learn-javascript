#!/usr/bin/env node
/**
 * 维护者工具：从 solutions/ 下的「预测输出」题目生成 exercises/ 版本
 * （把 answer 替换为 '?'，去掉 💡 解析注释）。
 * 用法：node scripts/make-quiz.js solutions/01-this/01-predict.js
 */
import { readFileSync, writeFileSync } from 'node:fs';

for (const file of process.argv.slice(2)) {
  const out = readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => !/^\s*\/\/ (💡|   )/.test(line))
    .map((line) => line.replace(/^(\s*)answer: .*,$/, "$1answer: '?',"))
    .join('\n');
  writeFileSync(file.replace(/^solutions/, 'exercises'), out);
  console.log('generated', file.replace(/^solutions/, 'exercises'));
}
