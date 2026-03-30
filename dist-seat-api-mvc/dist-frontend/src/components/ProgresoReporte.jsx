export default function ProgresoReporte({ logs, estado, excelUrl, onCerrar }) {
  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "1rem",
      }}
    >
      <h3>🛠️ Progreso de validaciones</h3>
      <p>
        <strong>Estado:</strong> {estado}
      </p>

      {estado === "Cancelado" && (
        <p style={{ color: "orange", fontWeight: "bold" }}>
          ⚠️ El proceso fue cancelado por el usuario.
        </p>
      )}

      <ul
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          fontFamily: "monospace",
        }}
      >
        {logs.map((log, i) => (
          <li
            key={i}
            style={{
              color:
                log.type === "error"
                  ? "red"
                  : log.type === "warn"
                    ? "orange"
                    : "#fff",
            }}
          >
            <strong>{log.step ? `[${log.step}]` : ""}</strong> {log.message}
          </li>
        ))}
      </ul>

      {excelUrl && (
        <div style={{ marginTop: "1rem" }}>
          <a
            href={excelUrl}
            download
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "5px",
              marginRight: "10px",
            }}
          >
            📥 Descargar Reporte Excel
          </a>
        </div>
      )}

      {estado === "Finalizado" && !excelUrl && (
        <p style={{ color: "#ccc", marginTop: "1rem" }}>
          El proceso finalizó, pero no se generó un archivo Excel.
        </p>
      )}

      <button
        onClick={onCerrar}
        style={{
          marginTop: "1rem",
          padding: "8px 16px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {estado === "Cancelado"
          ? "🧹 Cerrar y limpiar"
          : "🧹 Limpiar visualización"}
      </button>
    </div>
  );
}
