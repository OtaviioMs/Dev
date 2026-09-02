-- ============================================
-- DevPulse - Database Schema
-- ============================================

-- Tabela de monitores
CREATE TABLE IF NOT EXISTS monitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    status_code INTEGER,
    response_time INTEGER
);

-- Tabela de histórico
CREATE TABLE IF NOT EXISTS monitor_history (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    status_code INTEGER,
    response_time INTEGER,
    checked_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE
);

-- Índice para acelerar consultas do histórico
CREATE INDEX IF NOT EXISTS idx_monitor_history_monitor_id
    ON monitor_history(monitor_id);

CREATE INDEX IF NOT EXISTS idx_monitor_history_checked_at
    ON monitor_history(checked_at);