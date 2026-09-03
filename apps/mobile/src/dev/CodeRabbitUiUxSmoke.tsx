export function CodeRabbitUiUxSmoke() {
  return (
    <button
      aria-label="smoke"
      style={{
        width: 20,
        height: 20,
        padding: 0,
        background: "#ff00ff",
        color: "#ffffff",
        borderRadius: 18,
        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M1 6h10M6 1v10" stroke="currentColor" />
      </svg>
    </button>
  );
}
