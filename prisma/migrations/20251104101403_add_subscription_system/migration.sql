-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "lastFreeReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "subscriptionType" TEXT NOT NULL DEFAULT 'free',
    "subscriptionEndDate" DATETIME,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "monthlyQuota" INTEGER NOT NULL DEFAULT 200,
    "monthlyUsed" INTEGER NOT NULL DEFAULT 0,
    "lastMonthlyReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "credits", "email", "emailVerified", "id", "image", "lastFreeReset", "name", "totalCreditsUsed", "updatedAt") SELECT "createdAt", "credits", "email", "emailVerified", "id", "image", "lastFreeReset", "name", "totalCreditsUsed", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
