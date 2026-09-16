(function(){
  const FIXED_VAPID_PUBLIC_KEY = "BKU4bunUhkGcz5yUGNcORegKvXc7nSHW9A7ke0_HGCPNgxrbh4oqlbYtehNKOzi4iifJwtkX2_6UxGYbc0Z66Ks";

  async function improvedRegisterPush(){
    try {
      if (!window.isSecureContext) throw new Error('Dearly must be opened over HTTPS.');
      if (!("serviceWorker" in navigator)) throw new Error('This iPhone does not support Service Workers.');
      if (!("PushManager" in window)) throw new Error('Push notifications are not available here.');
      if (!("Notification" in window)) throw new Error('Notifications are not available here.');

      const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
      if (!standalone) throw new Error('Open Dearly from the Home Screen app, not Safari.');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Notifications are not allowed. Check iPhone Settings → Notifications → Dearly.');

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(FIXED_VAPID_PUBLIC_KEY)
        });
      }

      if (!state.deviceId) state.deviceId = crypto.randomUUID();

      const payload = {
        device_id: state.deviceId,
        wife_name: state.name,
        phone: state.phone,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Detroit',
        reminder_times: (state.times || []).slice(0, Number(state.reminderCount) || 3),
        reminders_enabled: state.remindersEnabled,
        push_subscription: sub.toJSON()
      };

      const r = await fetch(`${SUPABASE_URL}/rest/v1/dearly_devices?on_conflict=device_id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (!r.ok) {
        let detail = '';
        try { detail = await r.text(); } catch {}
        throw new Error(`Supabase returned ${r.status}${detail ? ': ' + detail : '.'}`);
      }

      save();
      const status = document.getElementById('pushStatus');
      if (status) status.textContent = '✓ This iPhone is registered for background push notifications.';
      toast('Background notifications are connected ❤️');
    } catch (err) {
      console.error('Dearly push registration failed:', err);
      const message = err && err.message ? err.message : String(err);
      const status = document.getElementById('pushStatus');
      if (status) status.textContent = '❌ ' + message;
      toast(message.length > 100 ? message.slice(0, 97) + '…' : message);
    }
  }

  function hook(){
    const buttons = [document.getElementById('notificationBtn'), document.getElementById('requestNotifications')].filter(Boolean);
    buttons.forEach(btn => btn.addEventListener('click', function(e){
      e.stopImmediatePropagation();
      improvedRegisterPush();
    }, true));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook);
  else hook();
})();
