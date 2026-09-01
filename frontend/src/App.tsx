import { useEffect, useState } from "react";
import "./App.css";

interface Monitor {
  id: number;
  name: string;
  url: string;
  status: string;
  status_code: number | null;
  response_time: number | null;
}

function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMonitors = async () => {
    try {
      const response = await fetch("http://localhost:3000/monitors");
      const data = await response.json();

      setMonitors(data.monitors || []);
    } catch (error) {
      console.error("Erro ao carregar monitores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitors();

    const interval = setInterval(loadMonitors, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>DevPulse</h1>
          <p>Monitoramento em tempo real</p>
        </div>

        <button onClick={loadMonitors}>Atualizar</button>
      </header>

      <main>
        <div className="summary">
          <div className="summary-card">
            <span>Total</span>
            <strong>{monitors.length}</strong>
          </div>

          <div className="summary-card">
            <span>Online</span>
            <strong>
              {monitors.filter((monitor) => monitor.status === "up").length}
            </strong>
          </div>

          <div className="summary-card">
            <span>Offline</span>
            <strong>
              {monitors.filter((monitor) => monitor.status !== "up").length}
            </strong>
          </div>
        </div>

        <section className="monitors">
          <div className="section-header">
            <h2>Monitores</h2>
            <span>
              {loading ? "Carregando..." : `${monitors.length} monitor(es)`}
            </span>
          </div>

          {monitors.length === 0 && !loading ? (
            <div className="empty">
              <h3>Nenhum monitor cadastrado</h3>
              <p>Adicione um monitor pela API para aparecer aqui.</p>
            </div>
          ) : (
            <div className="monitor-list">
              {monitors.map((monitor) => (
                <div className="monitor-card" key={monitor.id}>
                  <div className="monitor-info">
                    <div className="status-dot"></div>

                    <div>
                      <h3>{monitor.name}</h3>
                      <p>{monitor.url}</p>
                    </div>
                  </div>

                  <div className="monitor-data">
                    <div>
                      <span>Status</span>
                      <strong
                        className={
                          monitor.status === "up" ? "online" : "offline"
                        }
                      >
                        {monitor.status}
                      </strong>
                    </div>

                    <div>
                      <span>HTTP</span>
                      <strong>{monitor.status_code ?? "-"}</strong>
                    </div>

                    <div>
                      <span>Resposta</span>
                      <strong>
                        {monitor.response_time != null
                          ? `${monitor.response_time} ms`
                          : "-"}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;