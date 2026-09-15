-- AlterTable
ALTER TABLE "products" ADD COLUMN "searchVector" tsvector;

-- CreateIndex
CREATE INDEX "Products_searchVector_idx" ON "products" USING GIN ("searchVector");

CREATE OR REPLACE FUNCTION product_trigger_update_tsvector() RETURNS trigger AS $$
BEGIN
    NEW."searchVector" :=
        setweight(to_tsvector('portuguese', coalesce(NEW."name", '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(NEW."description", '')), 'B');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_tsvector_update_trigger
BEFORE INSERT OR UPDATE ON "products"
FOR EACH ROW EXECUTE FUNCTION product_trigger_update_tsvector();
