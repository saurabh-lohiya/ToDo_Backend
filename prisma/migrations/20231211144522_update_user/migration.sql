-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "start_date" DROP DEFAULT,
ALTER COLUMN "end_date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accept_privacy_policy" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT;
