-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "phone" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "confirmedAt" DATETIME,
    "confirmToken" TEXT NOT NULL,
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Registration_confirmToken_key" ON "Registration"("confirmToken");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_unsubscribeToken_key" ON "Registration"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "Registration_confirmedAt_idx" ON "Registration"("confirmedAt");

-- CreateIndex
CREATE INDEX "Registration_email_idx" ON "Registration"("email");

