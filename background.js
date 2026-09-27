const DEFAULT_WAIT = 30000, MAX_WAIT = 120000;

async function states() {
  if (chrome.storage.session) return chrome.storage.session.get({ activeAds: {} });
  return chrome.storage.local.get({ activeAds: {} });
}
async function save(activeAds) {
  if (chrome.storage.session) return chrome.storage.session.set({ activeAds });
  return chrome.storage.local.set({ activeAds });
}
async function getTab(id) {
  try { return await chrome.tabs.get(id); } catch (_) { return null; }
}
function durationMs(name) {
  const s = decodeURIComponent(String(name || ""));
  let n = null;
  const patterns = [
    /(?:^|[_-])(\d{1,3})(?:SEC|SECONDS?)(?:[A-Z]|_|$)/i,
    /(?:^|[_-])(\d{1,3})(?:s)(?:[A-Z]|_|$)/i,
    /(?:ENG|HIN|ENGLISH|HINDI)[_-]?(\d{1,3})(?:$|[_-])/i,
    /[_-](\d{1,3})$/
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) { n = +m[1]; if (n >= 2 && n <= 180) break; n = null; }
  }
  return n ? Math.min(MAX_WAIT, n * 1000) : DEFAULT_WAIT;
}
async function unmute(tabId) {
  const a = (await states()).activeAds;
  const s = a[String(tabId)];
  if (!s) return;
  try {
    const tab = await getTab(tabId);
    if (tab && s.changedMute && tab.mutedInfo?.muted)
      await chrome.tabs.update(tabId, { muted: false });
  } catch (_) {}
  delete a[String(tabId)];
  await save(a);
}
chrome.alarms.onAlarm.addListener(async alarm => {
  if (!alarm.name.startsWith("jhs-unmute:")) return;
  await unmute(Number(alarm.name.split(":")[1]));
});
chrome.webRequest.onBeforeRequest.addListener(async d => {
  if (d.tabId < 0) return;
  let u; try { u = new URL(d.url); } catch (_) { return; }
  if (!/\/v1\/events\/track\/ct_impression(?:\/|$)/i.test(u.pathname)) return;
  const name = u.searchParams.get("adName") || "";
  const wait = durationMs(name);
  const a = (await states()).activeAds;
  if (a[String(d.tabId)]) {
    await chrome.alarms.clear("jhs-unmute:" + d.tabId);
    await unmute(d.tabId);
  }
  const tab = await getTab(d.tabId); if (!tab) return;
  const changedMute = !tab.mutedInfo?.muted;
  if (changedMute) try { await chrome.tabs.update(d.tabId, { muted: true }); } catch (_) {}
  a[String(d.tabId)] = { changedMute, name, wait, signalAt: Date.now() };
  await save(a);
  await chrome.alarms.create("jhs-unmute:" + d.tabId, { delayInMinutes: wait / 60000 });
}, { urls: ["*://bifrost-api.hotstar.com/v1/events/track/ct_impression*"] });
chrome.tabs.onRemoved.addListener(async id => {
  await chrome.alarms.clear("jhs-unmute:" + id);
  const a = (await states()).activeAds; delete a[String(id)]; await save(a);
});
chrome.tabs.onUpdated.addListener(async (id, change) => {
  if (change.status === "loading") {
    await chrome.alarms.clear("jhs-unmute:" + id);
    const a = (await states()).activeAds; delete a[String(id)]; await save(a);
  }
});
