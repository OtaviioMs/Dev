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

interface MonitorHistory {
  monitorId: number;
  status: string;
  statusCode: number | null;
  responseTime: number | null;
  checkedAt: string;
}

function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonitor, setSelectedMonitor] =
    useState<Monitor | null>(null);

  const [history, setHistory] = useState<MonitorHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // =========================
  // CARREGAR MONITORES
  // =========================

  const loadMonitors = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/monitors"
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar monitores");
      }

      const data = await response.json();

      setMonitors(data.monitors || []);
    } catch (error) {
      console.error(
        "Erro ao carregar monitores:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CARREGAR HISTÓRICO
  // =========================

  const loadHistory = async (monitorId: number) => {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        `http://localhost:3000/monitors/${monitorId}/history`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar histórico");
      }

      const data = await response.json();

      setHistory(data);
    } catch (error) {
      console.error(
        "Erro ao carregar histórico:",
        error
      );

      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================
  // INICIALIZAÇÃO
  // =========================

  useEffect(() => {
    loadMonitors();

    const interval = setInterval(
      loadMonitors,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  // =========================
  // RESUMO
  // =========================

  const online = monitors.filter(
    (monitor) => monitor.status === "up"
  ).length;

  const offline = monitors.length - online;

  // =========================
  // TELA DE DETALHES
  // =========================

  if (selectedMonitor) {
    return (
      <div className="app">
        <main>
          <section className="details">

            <button
              className="back-button"
              onClick={() => {
                setSelectedMonitor(null);
                setHistory([]);
              }}
            >
              ← Voltar para monitores
            </button>

            {/* CABEÇALHO */}

            <div className="details-header">

              <div>
                <div className="details-title">

                  <span
                    className={`status-dot ${
                      selectedMonitor.status === "up"
                        ? "status-online"
                        : "status-offline"
                    }`}
                  />

                  <h2>
                    {selectedMonitor.name}
                  </h2>

                </div>

                <a
                  href={selectedMonitor.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedMonitor.url}
                </a>
              </div>

              <span
                className={`status-badge ${
                  selectedMonitor.status === "up"
                    ? "badge-online"
                    : "badge-offline"
                }`}
              >
                <span className="badge-dot" />

                {selectedMonitor.status === "up"
                  ? "Online"
                  : "Offline"}
              </span>

            </div>

            {/* RESUMO */}

            <div className="details-summary">

              <div className="details-card">
                <span>Status HTTP</span>

                <strong>
                  {selectedMonitor.status_code ?? "-"}
                </strong>
              </div>

              <div className="details-card">
                <span>Tempo de resposta</span>

                <strong>
                  {selectedMonitor.response_time != null
                    ? `${selectedMonitor.response_time} ms`
                    : "-"}
                </strong>
              </div>

              <div className="details-card">
                <span>Verificações</span>

                <strong>
                  {history.length}
                </strong>
              </div>

            </div>

            {/* HISTÓRICO */}

            <div className="history-section">

              <div className="section-header">

                <div>
                  <h2>Histórico</h2>

                  <p>
                    Últimas verificações realizadas
                  </p>
                </div>

              </div>

              {historyLoading ? (
                <div className="empty">
                  <h3>
                    Carregando histórico...
                  </h3>
                </div>
              ) : history.length === 0 ? (
                <div className="empty">
                  <h3>
                    Nenhum histórico encontrado
                  </h3>
                </div>
              ) : (
                <div className="history-list">

                  {history
                    .slice()
                    .reverse()
                    .map((item, index) => {

                      const isOnline =
                        item.status === "up";

                      return (
                        <div
                          className="history-row"
                          key={`${item.checkedAt}-${index}`}
                        >

                          <div className="history-status">

                            <span
                              className={`status-dot ${
                                isOnline
                                  ? "status-online"
                                  : "status-offline"
                              }`}
                            />

                            <strong>
                              {isOnline
                                ? "Online"
                                : "Offline"}
                            </strong>

                          </div>

                          <div>
                            <span>HTTP</span>

                            <strong>
                              {item.statusCode ?? "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Resposta</span>

                            <strong>
                              {item.responseTime != null
                                ? `${item.responseTime} ms`
                                : "-"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Verificado em
                            </span>

                            <strong>
                              {new Date(
                                item.checkedAt
                              ).toLocaleString(
                                "pt-BR"
                              )}
                            </strong>
                          </div>

                        </div>
                      );
                    })}

                </div>
              )}

            </div>

          </section>
        </main>
      </div>
    );
  }

  // =========================
  // DASHBOARD PRINCIPAL
  // =========================

  return (
    <div className="app">

      <header className="header">

        <div>

          <div className="logo">
            <span className="logo-icon">
              ●
            </span>

            <h1>DevPulse</h1>
          </div>

          <p>
            Monitoramento de APIs e serviços em tempo real
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={loadMonitors}
          disabled={loading}
        >
          <span>↻</span>

          {loading
            ? "Atualizando..."
            : "Atualizar"}
        </button>

      </header>

      <main>

        {/* RESUMO */}

        <section className="summary">

          <div className="summary-card">

            <div className="summary-top">
              <span>
                Total de monitores
              </span>

              <div className="summary-icon">
                ◉
              </div>
            </div>

            <strong>
              {monitors.length}
            </strong>

            <small>
              Monitores cadastrados
            </small>

          </div>

          <div className="summary-card online-card">

            <div className="summary-top">
              <span>Online</span>

              <div className="summary-icon">
                ✓
              </div>
            </div>

            <strong>
              {online}
            </strong>

            <small>
              Serviços funcionando
            </small>

          </div>

          <div className="summary-card offline-card">

            <div className="summary-top">
              <span>Offline</span>

              <div className="summary-icon">
                !
              </div>
            </div>

            <strong>
              {offline}
            </strong>

            <small>
              Serviços indisponíveis
            </small>

          </div>

        </section>

        {/* MONITORES */}

        <section className="monitors">

          <div className="section-header">

            <div>
              <h2>Monitores</h2>

              <p>
                Acompanhe o status dos seus serviços
              </p>
            </div>

            <span className="monitor-count">

              {loading
                ? "Carregando..."
                : `${monitors.length} monitor${
                    monitors.length === 1
                      ? ""
                      : "es"
                  }`}

            </span>

          </div>

          {monitors.length === 0 &&
          !loading ? (

            <div className="empty">

              <div className="empty-icon">
                ◌
              </div>

              <h3>
                Nenhum monitor cadastrado
              </h3>

              <p>
                Adicione um monitor pela API
                para começar o monitoramento.
              </p>

            </div>

          ) : (

            <div className="monitor-list">

              {monitors.map((monitor) => {

                const isOnline =
                  monitor.status === "up";

                return (
                  <div
                    className="monitor-card"
                    key={monitor.id}
                    onClick={() => {
                      setSelectedMonitor(
                        monitor
                      );

                      loadHistory(
                        monitor.id
                      );
                    }}
                  >

                    <div className="monitor-main">

                      <div
                        className={`status-dot ${
                          isOnline
                            ? "status-online"
                            : "status-offline"
                        }`}
                      />

                      <div className="monitor-info">

                        <h3>
                          {monitor.name}
                        </h3>

                        <a
                          href={monitor.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          {monitor.url}
                        </a>

                      </div>

                    </div>

                    <div className="monitor-status">

                      <span
                        className={`status-badge ${
                          isOnline
                            ? "badge-online"
                            : "badge-offline"
                        }`}
                      >

                        <span className="badge-dot" />

                        {isOnline
                          ? "Online"
                          : "Offline"}

                      </span>

                    </div>

                    <div className="monitor-data">

                      <div>
                        <span>HTTP</span>

                        <strong>
                          {monitor.status_code ??
                            "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Resposta</span>

                        <strong>
                          {monitor.response_time !=
                          null
                            ? `${monitor.response_time} ms`
                            : "-"}
                        </strong>
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

      <footer>

        <span>
          ● Sistema ativo
        </span>

        <span>
          Atualização automática a cada
          5 segundos
        </span>

      </footer>

    </div>
  );
}

export default App;