-- Recreate Plans table with different column names to avoid SQL keyword conflicts

-- Drop existing Plans table
IF OBJECT_ID('dbo.Plans', 'U') IS NOT NULL DROP TABLE dbo.Plans;
GO

-- Create new Plans table with safe column names
CREATE TABLE dbo.Plans (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    userId NVARCHAR(36) NOT NULL,
    planTitle NVARCHAR(255) NOT NULL,        -- Changed from 'title'
    searchQuery NVARCHAR(MAX) NOT NULL,      -- Changed from 'query'
    travelPlan NVARCHAR(MAX) NOT NULL,       -- Changed from 'planContent'
    isFavorite BIT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Plans_Users FOREIGN KEY (userId) REFERENCES dbo.Users(id) ON DELETE CASCADE
);
GO

-- Create index
CREATE INDEX IX_Plans_UserId ON dbo.Plans(userId);
GO

PRINT '✅ Plans table recreated with safe column names!';
PRINT '🔄 Column changes:';
PRINT('   - title → planTitle');
PRINT('   - query → searchQuery');
PRINT('   - planContent → travelPlan');
