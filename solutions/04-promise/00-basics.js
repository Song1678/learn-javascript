/**
 * 练习 4-0 参考答案：Promise 入门
 */

export function delay(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export function loadConfig(readFile, path) {
  return new Promise((resolve, reject) => {
    readFile(path, (err, content) => {
      if (err) {
        reject(err);
        return; // 别忘了 return，否则会继续执行下面的代码
      }
      try {
        resolve(JSON.parse(content));
      } catch (parseError) {
        // 文件内容不是合法 JSON 时，JSON.parse 会抛错，也应该让 Promise 失败
        reject(parseError);
      }
    });
  });
}

export function getUserDiscount(api, userId) {
  // 在 then 回调里 return 一个 Promise，整个链条会等它完成，结果传给下一个 then（这里直接作为最终结果）
  return api.getUser(userId).then((user) => api.getDiscount(user.level));
}

export function getNickname(api, userId) {
  return api
    .getUser(userId)
    .then((user) => user.name)
    .catch(() => '游客');
}

export function loadHomePage(api) {
  return Promise.all([api.getBanners(), api.getProducts()]).then(([banners, products]) => ({
    banners,
    products,
  }));
}
