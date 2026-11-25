CREATE UNIQUE INDEX ledger_reserve_closed_uq
  ON ledger (reserve_id) WHERE type IN ('REFUNDED','WITHDRAW');