-- Tabla optimizada con solo los campos que usa el dashboard
CREATE TABLE orders_v2 (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        TEXT        UNIQUE NOT NULL,
  order_date      TIMESTAMPTZ,
  status          TEXT,
  order_total     NUMERIC(10,2),
  product_name    TEXT,
  product_quantity INTEGER     DEFAULT 1,
  utm_source      TEXT,
  source_type     TEXT,
  device_type     TEXT,
  customer_user   TEXT,
  shipping_state  TEXT,
  shipping_country TEXT       DEFAULT 'ES',
  payment_method  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Migrar datos existentes desde la tabla vieja
INSERT INTO orders_v2 (
  order_id, order_date, status, order_total,
  product_name, product_quantity,
  utm_source, source_type, device_type,
  customer_user, shipping_state, shipping_country, payment_method
)
SELECT
  order_id,
  order_date,
  status,
  order_total,
  "Product Item 1 Name",
  COALESCE("Product Item 1 Quantity", 1),
  "meta:_wc_order_attribution_utm_source",
  "meta:_wc_order_attribution_source_type",
  "meta:_wc_order_attribution_device_type",
  customer_user,
  shipping_state,
  shipping_country,
  payment_method_title
FROM orders
WHERE order_id IS NOT NULL
ON CONFLICT (order_id) DO NOTHING;

-- Indices para rendimiento
CREATE INDEX idx_v2_order_date    ON orders_v2(order_date);
CREATE INDEX idx_v2_status        ON orders_v2(status);
CREATE INDEX idx_v2_utm_source    ON orders_v2(utm_source);

-- RLS: lectura publica, escritura solo desde servidor
ALTER TABLE orders_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read"   ON orders_v2 FOR SELECT USING (true);
CREATE POLICY "Allow server insert" ON orders_v2 FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow server update" ON orders_v2 FOR UPDATE USING (true);

-- Una vez verificado que todo funciona, ejecutar:
-- DROP TABLE orders;
-- ALTER TABLE orders_v2 RENAME TO orders;
