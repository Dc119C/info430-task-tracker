-- List all tasks, ordered first by open status and then by due date.
SELECT task_id, title, due_date, is_completed
FROM dbo.tasks
ORDER BY is_completed ASC, due_date ASC, task_id ASC;

-- Add a task. Replace the parameter values before running in VS Code.
DECLARE @title NVARCHAR(100) = N'Study for the INFO 430 quiz';
DECLARE @dueDate DATE = '2026-12-01';

INSERT INTO dbo.tasks (title, due_date, is_completed)
VALUES (@title, @dueDate, 0);

-- Mark one task as completed. Replace @taskId.
DECLARE @taskId INT = 1;
DECLARE @completed BIT = 1;

UPDATE dbo.tasks
SET is_completed = @completed
WHERE task_id = @taskId;
