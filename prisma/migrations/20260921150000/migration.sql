CREATE OR REPLACE FUNCTION post_trigger_update_tsvector() RETURNS trigger AS $$
BEGIN
    NEW."searchVector" :=
        setweight(to_tsvector('portuguese', coalesce(NEW."title", '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(NEW."excerpt", '')), 'B') ||
        setweight(to_tsvector('portuguese', coalesce(NEW."content", '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_tsvector_update_trigger
BEFORE INSERT OR UPDATE ON "posts"
FOR EACH ROW EXECUTE FUNCTION post_trigger_update_tsvector();
