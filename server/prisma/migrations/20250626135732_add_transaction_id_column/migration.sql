/*
  Warnings:

  - You are about to drop the column `mainCategory` on the `ledgerentry` table. All the data in the column will be lost.
  - You are about to drop the column `subCategory` on the `ledgerentry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ledgerentry` DROP COLUMN `mainCategory`,
    DROP COLUMN `subCategory`,
    ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `transactionId` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Budget` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `amount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `LedgerEntry_transactionId_idx` ON `LedgerEntry`(`transactionId`);

-- AddForeignKey
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budget` ADD CONSTRAINT `Budget_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budget` ADD CONSTRAINT `Budget_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
