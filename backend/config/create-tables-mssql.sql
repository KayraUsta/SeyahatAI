-- Zai Database Tables for SeyahatAI
-- SQL Server Compatible

-- Check and drop tables if they exist (for clean recreation)
IF OBJECT_ID('dbo.PasswordResets', 'U') IS NOT NULL DROP TABLE dbo.PasswordResets;
IF OBJECT_ID('dbo.TodoItems', 'U') IS NOT NULL DROP TABLE dbo.TodoItems;
IF OBJECT_ID('dbo.TodoLists', 'U') IS NOT NULL DROP TABLE dbo.TodoLists;
IF OBJECT_ID('dbo.Expenses', 'U') IS NOT NULL DROP TABLE dbo.Expenses;
IF OBJECT_ID('dbo.Budgets', 'U') IS NOT NULL DROP TABLE dbo.Budgets;
IF OBJECT_ID('dbo.Plans', 'U') IS NOT NULL DROP TABLE dbo.Plans;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- Users Table
CREATE TABLE dbo.Users (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Plans Table
CREATE TABLE dbo.Plans (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    userId NVARCHAR(36) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    query NVARCHAR(MAX) NOT NULL,
    plan NVARCHAR(MAX) NOT NULL,
    isFavorite BIT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Plans_Users FOREIGN KEY (userId) REFERENCES dbo.Users(id) ON DELETE CASCADE
);
GO

-- Budgets Table
CREATE TABLE dbo.Budgets (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    userId NVARCHAR(36) NOT NULL,
    travelName NVARCHAR(255) NOT NULL,
    totalBudget DECIMAL(18,2) NOT NULL,
    currency NVARCHAR(3) NOT NULL DEFAULT 'TRY',
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Budgets_Users FOREIGN KEY (userId) REFERENCES dbo.Users(id) ON DELETE CASCADE
);
GO

-- Expenses Table
CREATE TABLE dbo.Expenses (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    budgetId NVARCHAR(36) NOT NULL,
    description NVARCHAR(255) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    category NVARCHAR(50) NOT NULL DEFAULT 'Diğer',
    date DATETIME2 NOT NULL DEFAULT GETDATE(),
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Expenses_Budgets FOREIGN KEY (budgetId) REFERENCES dbo.Budgets(id) ON DELETE CASCADE
);
GO

-- TodoLists Table
CREATE TABLE dbo.TodoLists (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    userId NVARCHAR(36) NOT NULL,
    travelName NVARCHAR(255) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_TodoLists_Users FOREIGN KEY (userId) REFERENCES dbo.Users(id) ON DELETE CASCADE
);
GO

-- TodoItems Table
CREATE TABLE dbo.TodoItems (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    listId NVARCHAR(36) NOT NULL,
    text NVARCHAR(500) NOT NULL,
    completed BIT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_TodoItems_TodoLists FOREIGN KEY (listId) REFERENCES dbo.TodoLists(id) ON DELETE CASCADE
);
GO

-- PasswordResets Table
CREATE TABLE dbo.PasswordResets (
    id NVARCHAR(36) NOT NULL DEFAULT NEWID() PRIMARY KEY,
    userId NVARCHAR(36) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    resetToken NVARCHAR(6) NOT NULL,
    expiresAt DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PasswordResets_Users FOREIGN KEY (userId) REFERENCES dbo.Users(id) ON DELETE CASCADE
);
GO

-- Indexes for performance
CREATE INDEX IX_Plans_UserId ON dbo.Plans(userId);
CREATE INDEX IX_Budgets_UserId ON dbo.Budgets(userId);
CREATE INDEX IX_Expenses_BudgetId ON dbo.Expenses(budgetId);
CREATE INDEX IX_TodoLists_UserId ON dbo.TodoLists(userId);
CREATE INDEX IX_TodoItems_ListId ON dbo.TodoItems(listId);
CREATE INDEX IX_PasswordResets_Email ON dbo.PasswordResets(email);
CREATE INDEX IX_PasswordResets_Token ON dbo.PasswordResets(resetToken);
GO

-- Insert sample data (optional)
-- You can uncomment this section for testing
/*
-- Sample User (password: '123456' hashed)
INSERT INTO dbo.Users (name, email, password) VALUES 
('Test User', 'test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Sample Plan
INSERT INTO dbo.Plans (userId, title, query, plan) VALUES 
((SELECT TOP 1 id FROM dbo.Users), 'Test Plan', 'Istanbul trip', 'Visit Hagia Sophia, Grand Bazaar...');

-- Sample Budget
INSERT INTO dbo.Budgets (userId, travelName, totalBudget, currency) VALUES 
((SELECT TOP 1 id FROM dbo.Users), 'Istanbul Trip', 5000.00, 'TRY');

-- Sample TodoList
INSERT INTO dbo.TodoLists (userId, travelName) VALUES 
((SELECT TOP 1 id FROM dbo.Users), 'Istanbul Trip');
*/
GO

PRINT '✅ All tables created successfully for Zai database!';
PRINT '📊 Tables created: Users, Plans, Budgets, Expenses, TodoLists, TodoItems, PasswordResets';
PRINT '🔗 All foreign key constraints established';
PRINT '📈 Performance indexes created';
