-- Crear tabla para importar CSVs de WooCommerce
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT,
  order_date TIMESTAMP WITH TIME ZONE,
  order_total NUMERIC(10, 2),
  status TEXT,
  
  -- Producto
  product_name TEXT,
  
  -- UTM (colaboradoras)
  utm_source TEXT,
  source_type TEXT,
  
  -- Dispositivo y ubicación
  device_type TEXT,
  shipping_state TEXT,
  
  -- Pago
  payment_method TEXT,
  customer_email TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_utm_source ON orders(utm_source);

-- Permitir lectura
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON orders FOR SELECT USING (true);
