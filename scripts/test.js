#!/usr/bin/env node
/**
 * 测试运行脚本（跨平台，Windows / macOS / Linux 通用）
 *
 * 用法：
 *   npm test                      运行全部练习的测试
 *   npm test -- 01                只运行第 01 章
 *   npm test -- 04/retry          只运行第 04 章中文件名包含 retry 的测试
 *   npm test -- 01 03             运行第 01 章和第 03 章
 *   npm test -- 01 --basic        基础模式：跳过「选做」练习和标记为 [进阶] 的测试，适合第一遍学习
 *   npm test -- 01/bind --basic   基础模式下单独运行某个选做练习（仍跳过 [进阶] 测试）
 *   npm test -- 01 --solution     用参考答案跑测试（验证答案 / 对照学习）
 *   npm run test:solution         用参考答案跑全部测试
 */
import { spawn } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = path.join(root, 'tests');

const args = process.argv.slice(2);
const useSolution = args.includes('--solution');
const basicMode = args.includes('--basic');
const filters = args.filter((a) => !a.startsWith('--'));

function collect(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return collect(full);
    return name.endsWith('.test.js') ? [full] : [];
  });
}

// 过滤规则：
//   "01"        -> 章节目录以 01 开头
//   "01/cart"   -> 章节目录以 01 开头，且文件名包含 cart
//   "cart"      -> 路径中任意位置包含 cart
function matches(rel, filter) {
  const [dir, file] = rel.split('/');
  const [chapter, name] = filter.split('/');
  if (name !== undefined || /^\d+$/.test(chapter)) {
    return dir.startsWith(chapter) && (name === undefined || file.includes(name));
  }
  return rel.includes(filter);
}

// 「选做」练习：基础模式下，只有在命令中明确写出文件名（如 01/bind）时才运行
const OPTIONAL = [
  '01-this/03-bind',
  '02-prototype/03-new-instanceof',
  '02-prototype/04-mixin',
  '03-closure/03-store',
  '04-promise/04-timeout-retry',
  '04-promise/05-my-promise',
  '05-async-await/02-concurrency',
  '05-async-await/03-request-dedupe',
  '05-async-await/04-latest-only',
  '06-generator/04-async-generator',
  '06-generator/05-co',
  '07-engineering/03-validator',
];
const isOptional = (rel) => OPTIONAL.some((o) => rel.startsWith(o));
const namesFile = filters.some((f) => f.includes('/'));
let skippedOptional = 0;

const files = collect(testsDir)
  .sort()
  .filter((file) => {
    if (filters.length === 0) return true;
    const rel = path.relative(testsDir, file).split(path.sep).join('/');
    return filters.some((f) => matches(rel, f));
  })
  .filter((file) => {
    const rel = path.relative(testsDir, file).split(path.sep).join('/');
    if (basicMode && !namesFile && isOptional(rel)) {
      skippedOptional++;
      return false;
    }
    return true;
  });

if (files.length === 0) {
  console.error(`没有找到匹配 "${filters.join(' ')}" 的测试文件`);
  process.exit(1);
}

console.log(`\n▶ 目标目录：${useSolution ? 'solutions/（参考答案）' : 'exercises/（你的代码）'}`);
console.log(`▶ 测试模式：${basicMode ? '基础模式（跳过选做练习和 [进阶] 测试）' : '完整模式'}`);
console.log(`▶ 测试文件：${files.length} 个${skippedOptional ? `（基础模式已跳过 ${skippedOptional} 个选做练习）` : ''}\n`);

const child = spawn(process.execPath, ['--test', '--test-timeout=5000', ...files], {
  stdio: 'inherit',
  env: { ...process.env, SOLUTION: useSolution ? '1' : '', BASIC: basicMode ? '1' : '' },
});
child.on('exit', (code) => process.exit(code ?? 1));
