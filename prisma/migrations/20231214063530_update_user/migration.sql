/*
  Warnings:

  - A unique constraint covering the columns `[user_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "user_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "User"("user_name");
