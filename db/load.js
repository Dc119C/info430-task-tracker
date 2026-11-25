require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

(async () => {
  try {
    const pool = await sql.connect({
      server: process.env.DB_SERVER,
      port: Number(process.env.DB_PORT || 1433),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      options: { encrypt: true, trustServerCertificate: true }
    });

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.request().query(schema);

    await pool.request().query('DELETE FROM dbo.tasks;');

    const tasks = [
      ['Complete INFO 430 task tracker', '2026-11-24'], ['Read database normalization notes', '2026-11-25'],
      ['Study SQL joins', '2026-11-26'], ['Submit weekly reflection', '2026-11-27'], ['Review Entity Relationship models', '2026-11-28'],
      ['Practice SQL Server queries', '2026-11-29'], ['Finish group project outline', '2026-11-30'], ['Prepare for quiz', '2026-12-01'],
      ['Update project README', '2026-12-02'], ['Create sample data', '2026-12-03'], ['Check database parameters', '2026-12-04'],
      ['Test browser interface', '2026-12-05'], ['Fix API validation', '2026-12-06'], ['Review task due dates', '2026-12-07'],
      ['Meet with project partner', '2026-12-08'], ['Organize final presentation', '2026-12-09'], ['Write final report', '2026-12-10'],
      ['Run final connection check', '2026-12-11'], ['Export project screenshot', '2026-12-12'], ['Submit INFO 430 project', '2026-12-13']
    ];

    for (let index = 0; index < tasks.length; index++) {
      await pool.request()
        .input('title', sql.NVarChar(100), tasks[index][0])
        .input('dueDate', sql.Date, tasks[index][1])
        .input('completed', sql.Bit, index < 4)
        .query('INSERT INTO dbo.tasks (title, due_date, is_completed) VALUES (@title, @dueDate, @completed);');
    }

    console.log(`OK: loaded ${tasks.length} sample tasks into ${process.env.DB_NAME}.`);
    await pool.close();
  } catch (error) {
    console.log('FAILED: ' + error.message);
    process.exitCode = 1;
  }
})();
