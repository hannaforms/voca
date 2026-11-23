// 단어장 목록 + apps 폴더의 앱을 오프라인에서도 열 수 있게 저장
// 새 앱을 추가하면 APP_FILES에 한 줄 넣고 CACHE 숫자를 올리세요.
const CACHE = 'voca-hub-v2';
const APP_FILES = [
  './apps/day51-52.html',
  './apps/day49-50.html',
  './apps/day41-44.html',
  './apps/gujo-1.html',
  './apps/dokhae-1102.html',
  './apps/renewable.html',
  './apps/root-unit19.html',
  './apps/root-unit18.html',
  './apps/suffix-unit16.html'
];
const ASSETS = ['./', './index.html', './manifest.json', './icon.png', ...APP_FILES];

self.addEventListener('install', e => {
  // 하나가 실패해도 나머지는 저장되도록 개별 저장
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// 인터넷이 되면 항상 최신 버전, 안 되면 저장본
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
