/*
  Warnings:

  - You are about to drop the column `stockSybol` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stockSymbol` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'EXECUTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "stockSybol",
ADD COLUMN     "executedAt" TIMESTAMP(3),
ADD COLUMN     "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "stockSymbol" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 10000;

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stockSymbol" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "averagePrice" DOUBLE PRECISION NOT NULL,
    "totalInvested" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "profitLoss" DOUBLE PRECISION,
    "profitLossPerc" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_userId_stockSymbol_key" ON "Portfolio"("userId", "stockSymbol");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
