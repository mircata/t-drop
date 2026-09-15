/* Extra link in Payload's own /admin sidebar, registered via admin.components.afterNavLinks
   in payload.config.ts. Points at our own /admin-tools/deliveries page (outside Payload's
   generated (payload) route group), which needs no importmap entry to also change. */
export function DeliveriesNavLink() {
  return (
    <div style={{ padding: "8px 24px" }}>
      <a href="/admin-tools/deliveries" style={{ color: "var(--theme-text, #333)", fontWeight: 600, textDecoration: "none" }}>
        📦 Доставки
      </a>
    </div>
  );
}
