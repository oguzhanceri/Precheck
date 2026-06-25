-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "scopeType" TEXT,
    "crawlDepth" TEXT,
    "selectedDevices" TEXT,
    "selectedModules" TEXT,
    "selectedPages" TEXT,
    "overallScore" INTEGER,
    "performanceScore" INTEGER,
    "seoScore" INTEGER,
    "accessibilityScore" INTEGER,
    "uxScore" INTEGER,
    "securityScore" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'orange',
    "solution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Finding_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "average" TEXT NOT NULL,
    "trend" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "width" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vital_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "score" INTEGER,
    "critical" INTEGER NOT NULL DEFAULT 0,
    "warning" INTEGER NOT NULL DEFAULT 0,
    "lastChecked" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageResult_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
