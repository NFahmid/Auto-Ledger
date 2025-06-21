/*
  Warnings:

  - The primary key for the `ledgerentry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `ledgerentry` table. All the data in the column will be lost.
  - Added the required column `mainCategory` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategory` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ledgerentry` DROP PRIMARY KEY,
    DROP COLUMN `category`,
    ADD COLUMN `mainCategory` VARCHAR(191) NOT NULL DEFAULT 'asset',
    ADD COLUMN `subCategory` VARCHAR(191) NOT NULL DEFAULT 'cash',
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

