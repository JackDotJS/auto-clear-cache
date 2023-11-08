const canNotify = await browser.permissions.contains({ permissions: [ `notifications` ] });

if (canNotify) {
  browser.notifications.create({
    type: `basic`,
    title: `Auto Clear Cache`,
    message: `bg.js test`
  });
}