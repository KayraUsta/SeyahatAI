-- Fix Plans table - 'plan' is a reserved keyword in SQL Server
-- Drop and recreate with proper column name

IF OBJECT_ID('dbo.Plans', 'U') IS NOT NULL DROP TABLE dbo.Plans;
GO

-- Plans Table with fixed column names
CREATE TABLE dbo.Plans (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    userId NVARCHAR(36) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    query NVARCHAR(MAX) NOT NULL,
    planContent NVARCHAR(MAX) NOT NULL, -- Changed from 'plan' to 'planContent'
    isFavorite BIT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Plans_Users FOREIGN KEY (userId) REFERENCES dbo.Users(id) ON DELETE CASCADE
);
GO

-- Create index
CREATE INDEX IX_Plans_UserId ON dbo.Plans(userId);
GO

PRINT '✅ Plans table created successfully with fixed column names!';
PRINT '🔄 Column "plan" renamed to "planContent" to avoid SQL keyword conflict';
