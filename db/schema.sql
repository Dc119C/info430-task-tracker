IF OBJECT_ID('dbo.tasks', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tasks (
        task_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        title NVARCHAR(100) NOT NULL,
        due_date DATE NOT NULL,
        is_completed BIT NOT NULL CONSTRAINT DF_tasks_completed DEFAULT (0)
    );
END;
