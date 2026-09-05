/*
  Warnings:

  - The `type` column on the `ledger` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `expires_at` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('CREDITED', 'WITHDRAW', 'RESERVED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('PRE_AUTH', 'FULL_AUTH');

-- AlterTable
ALTER TABLE "ledger" DROP COLUMN "type",
ADD COLUMN     "type" "LedgerType" NOT NULL DEFAULT 'RESERVED';

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "SessionType" NOT NULL DEFAULT 'PRE_AUTH',
ALTER COLUMN "revoked_at" DROP NOT NULL;

-- DropEnum
DROP TYPE "Type";
