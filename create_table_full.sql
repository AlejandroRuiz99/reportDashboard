-- Tabla completa con todas las columnas del CSV de WooCommerce
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Columnas básicas del pedido
  order_id TEXT,
  order_number TEXT,
  order_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  order_total NUMERIC(10, 2),
  order_subtotal NUMERIC(10, 2),
  order_currency TEXT DEFAULT 'EUR',
  order_key TEXT,
  
  -- Impuestos y descuentos
  shipping_total NUMERIC(10, 2),
  shipping_tax_total NUMERIC(10, 2),
  fee_total NUMERIC(10, 2),
  fee_tax_total NUMERIC(10, 2),
  tax_total NUMERIC(10, 2),
  cart_discount NUMERIC(10, 2),
  order_discount NUMERIC(10, 2),
  discount_total NUMERIC(10, 2),
  
  -- Métodos de pago y envío
  payment_method TEXT,
  payment_method_title TEXT,
  transaction_id TEXT,
  shipping_method TEXT,
  
  -- Cliente
  customer_id TEXT,
  customer_user TEXT,
  customer_email TEXT,
  customer_ip_address TEXT,
  customer_user_agent TEXT,
  customer_note TEXT,
  
  -- Facturación (Billing)
  billing_first_name TEXT,
  billing_last_name TEXT,
  billing_company TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  billing_address_1 TEXT,
  billing_address_2 TEXT,
  billing_postcode TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_country TEXT,
  
  -- Envío (Shipping)
  shipping_first_name TEXT,
  shipping_last_name TEXT,
  shipping_company TEXT,
  shipping_phone TEXT,
  shipping_address_1 TEXT,
  shipping_address_2 TEXT,
  shipping_postcode TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_country TEXT,
  
  -- Importación y extras
  wt_import_key TEXT,
  tax_items TEXT,
  shipping_items TEXT,
  fee_items TEXT,
  coupon_items TEXT,
  refund_items TEXT,
  order_notes TEXT,
  download_permissions TEXT,
  
  -- Atribución WooCommerce (UTM y tracking)
  "meta:_wc_order_attribution_device_type" TEXT,
  "meta:_wc_order_attribution_referrer" TEXT,
  "meta:_wc_order_attribution_session_count" TEXT,
  "meta:_wc_order_attribution_session_entry" TEXT,
  "meta:_wc_order_attribution_session_pages" TEXT,
  "meta:_wc_order_attribution_session_start_time" TEXT,
  "meta:_wc_order_attribution_source_type" TEXT,
  "meta:_wc_order_attribution_user_agent" TEXT,
  "meta:_wc_order_attribution_utm_source" TEXT,
  
  -- Line items
  line_item_1 TEXT,
  line_item_2 TEXT,
  line_item_3 TEXT,
  line_item_4 TEXT,
  
  -- Productos (Item 1)
  "Product Item 1 Name" TEXT,
  "Product Item 1 id" TEXT,
  "Product Item 1 SKU" TEXT,
  "Product Item 1 Quantity" INTEGER,
  "Product Item 1 Total" NUMERIC(10, 2),
  "Product Item 1 Subtotal" NUMERIC(10, 2),
  
  -- Productos (Item 2)
  "Product Item 2 Name" TEXT,
  "Product Item 2 id" TEXT,
  "Product Item 2 SKU" TEXT,
  "Product Item 2 Quantity" INTEGER,
  "Product Item 2 Total" NUMERIC(10, 2),
  "Product Item 2 Subtotal" NUMERIC(10, 2),
  
  -- Productos (Item 3)
  "Product Item 3 Name" TEXT,
  "Product Item 3 id" TEXT,
  "Product Item 3 SKU" TEXT,
  "Product Item 3 Quantity" INTEGER,
  "Product Item 3 Total" NUMERIC(10, 2),
  "Product Item 3 Subtotal" NUMERIC(10, 2),
  
  -- Productos (Item 4)
  "Product Item 4 Name" TEXT,
  "Product Item 4 id" TEXT,
  "Product Item 4 SKU" TEXT,
  "Product Item 4 Quantity" INTEGER,
  "Product Item 4 Total" NUMERIC(10, 2),
  "Product Item 4 Subtotal" NUMERIC(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_utm_source ON orders("meta:_wc_order_attribution_utm_source");
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_email);

-- Habilitar RLS y permitir lectura pública
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON orders FOR SELECT USING (true);
