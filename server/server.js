require('dotenv').config();
const path = require('path');
const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'web')));

const config = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: { encrypt: true, trustServerCertificate: true }
};

let pool;
async function getPool() {
  if (!pool) pool = await sql.connect(config);
  return pool;
}

app.get('/api/tasks', async (req, res) => {
  try {
    const db = await getPool();
    const result = await db.request().query(`
      SELECT task_id, title, due_date,
             CAST(is_completed AS bit) AS is_completed
      FROM dbo.tasks
      ORDER BY is_completed ASC, due_date ASC, task_id ASC
    `);
    res.json(result.recordset.map(task => ({
      ...task,
      is_completed: Boolean(task.is_completed)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Could not load tasks.' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const dueDate = typeof req.body.dueDate === 'string' ? req.body.dueDate : '';
  if (!title || title.length > 100 || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return res.status(400).json({ error: 'A task title and valid due date are required.' });
  }

  try {
    const db = await getPool();
    const result = await db.request()
      .input('title', sql.NVarChar(100), title)
      .input('dueDate', sql.Date, dueDate)
      .query(`
        INSERT INTO dbo.tasks (title, due_date, is_completed)
        OUTPUT INSERTED.task_id, INSERTED.title, INSERTED.due_date,
               CAST(INSERTED.is_completed AS bit) AS is_completed
        VALUES (@title, @dueDate, 0)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: 'Could not add the task.' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || typeof req.body.completed !== 'boolean') {
    return res.status(400).json({ error: 'A valid task id and completion state are required.' });
  }

  try {
    const db = await getPool();
    const result = await db.request()
      .input('id', sql.Int, id)
      .input('completed', sql.Bit, req.body.completed)
      .query(`
        UPDATE dbo.tasks
        SET is_completed = @completed
        OUTPUT INSERTED.task_id, INSERTED.title, INSERTED.due_date,
               CAST(INSERTED.is_completed AS bit) AS is_completed
        WHERE task_id = @id
      `);
    if (!result.recordset.length) return res.status(404).json({ error: 'Task not found.' });
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: 'Could not update the task.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Task Tracker running at http://localhost:${port}`));
