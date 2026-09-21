-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "user_id" TYPE UUID USING "user_id"::uuid;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
