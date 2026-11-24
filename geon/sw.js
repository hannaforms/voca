// 윤건이 단어장 목록 + apps 폴더의 앱을 오프라인에서도 열 수 있게 저장
// 새 앱을 추가하면 APP_FILES에 한 줄 넣고 CACHE 숫자를 올리세요.
const CACHE = 'geon-hub-v3';
const APP_FILES = [
  './apps/all.html',
  './apps/nov19-test.html',
  './apps/oct.html',
  './apps/sep-mid.html',
  './apps/sep-early-2.html',
  './apps/sep-early-1.html',
  './apps/verbs.html'
];
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', ...APP_FILES];

self.addEventListener('install', e => {
  // cache:'reload' — 브라우저에 남아 있던 옛 파일이 아니라 서버의 최신 파일을 저장
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ASSETS.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))
  ));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// 리다이렉트된 응답은 Safari가 화면 이동에 쓰지 못하므로 깨끗한 응답으로 다시 만듦
function clean(res) {
  if (!res.redirected) return res;
  return res.blob().then(body => new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers }));
}

// 인터넷이 되면 항상 서버에 최신 버전을 확인(GitHub Pages의 10분 캐시 무시), 안 되면 저장본
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  const net = sameOrigin
    ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(clean)
    : fetch(req);
  e.respondWith(
    net.then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
