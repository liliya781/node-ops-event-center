import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

const app = express()
const port = 8090

app.use(cors())
app.use(express.json())

const db = new Database('./ops-events.db')

function initDb() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS ops_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service TEXT NOT NULL,
      level TEXT NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      owner TEXT NOT NULL,
      event_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run()

  const count = db.prepare('SELECT COUNT(*) AS c FROM ops_event').get().c
  if (count === 0) {
    const stmt = db.prepare(`
      INSERT INTO ops_event (service, level, status, title, owner, event_date, created_at)
      VALUES (@service, @level, @status, @title, @owner, @event_date, datetime('now'))
    `)
    const seed = [
      { service: 'judge-core', level: 'high', status: 'open', title: '评测节点超时', owner: 'alice', event_date: '2026-03-20' },
      { service: 'api-gateway', level: 'medium', status: 'resolved', title: '网关限流误触发', owner: 'bob', event_date: '2026-03-19' },
      { service: 'worker', level: 'low', status: 'open', title: '日志堆积告警', owner: 'chen', event_date: '2026-03-18' },
      { service: 'judge-core', level: 'critical', status: 'in_progress', title: '任务积压', owner: 'alice', event_date: '2026-03-21' }
    ]
    seed.forEach((row) => stmt.run(row))
  }
}

function listEvents(req, res) {
  const { service = '', status = '' } = req.query
  let sql = 'SELECT * FROM ops_event WHERE 1=1'
  const args = []
  if (service) {
    sql += ' AND service = ?'
    args.push(service)
  }
  if (status) {
    sql += ' AND status = ?'
    args.push(status)
  }
  sql += ' ORDER BY event_date DESC, id DESC'
  const rows = db.prepare(sql).all(...args)
  res.json({ success: true, data: rows })
}

function createEvent(req, res) {
  const { service, level, status, title, owner, event_date } = req.body
  if (!service || !level || !status || !title || !owner || !event_date) {
    return res.status(400).json({ success: false, message: 'missing required fields' })
  }
  const result = db.prepare(`
    INSERT INTO ops_event (service, level, status, title, owner, event_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(service, level, status, title, owner, event_date)

  const row = db.prepare('SELECT * FROM ops_event WHERE id = ?').get(result.lastInsertRowid)
  res.json({ success: true, data: row })
}

function updateStatus(req, res) {
  const { id } = req.params
  const { status } = req.body
  if (!status) {
    return res.status(400).json({ success: false, message: 'status is required' })
  }
  db.prepare('UPDATE ops_event SET status = ? WHERE id = ?').run(status, id)
  const row = db.prepare('SELECT * FROM ops_event WHERE id = ?').get(id)
  res.json({ success: true, data: row })
}

function deleteEvent(req, res) {
  const { id } = req.params
  const result = db.prepare('DELETE FROM ops_event WHERE id = ?').run(id)
  res.json({ success: result.changes > 0, data: result.changes > 0 })
}

function levelStats(req, res) {
  const rows = db.prepare(`
    SELECT level AS name, COUNT(*) AS value
    FROM ops_event
    GROUP BY level
  `).all()
  res.json({ success: true, data: rows })
}

function serviceStats(req, res) {
  const rows = db.prepare(`
    SELECT service AS name, COUNT(*) AS value
    FROM ops_event
    GROUP BY service
    ORDER BY value DESC
  `).all()
  res.json({ success: true, data: rows })
}

function dailyTrend(req, res) {
  const rows = db.prepare(`
    SELECT event_date AS day,
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
    FROM ops_event
    GROUP BY event_date
    ORDER BY day
  `).all()
  res.json({ success: true, data: rows })
}

initDb()

app.get('/api/events', listEvents)
app.post('/api/events', createEvent)
app.patch('/api/events/:id/status', updateStatus)
app.delete('/api/events/:id', deleteEvent)
app.get('/api/stats/level', levelStats)
app.get('/api/stats/service', serviceStats)
app.get('/api/stats/day', dailyTrend)

app.listen(port, () => {
  console.log(`node-ops-event-center backend running at http://localhost:${port}`)
})
