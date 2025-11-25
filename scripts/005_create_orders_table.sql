-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  fulfillment_status VARCHAR(30) NOT NULL DEFAULT 'payment_completed' CHECK (fulfillment_status IN ('payment_completed', 'preparing', 'ready_for_pickup', 'picked_up', 'converted_to_floor_sale')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('card', 'kakao_pay', 'naver_pay', 'bank_transfer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON public.orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = orders.customer_id
      AND customers.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = orders.customer_id
      AND customers.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = orders.customer_id
      AND customers.auth_user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- Removed incorrect admin policies that compared UUID to TEXT
-- Service role (used by admin actions) can already access all data

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  date_part TEXT;
  sequence_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get the next sequence number for today
  SELECT LPAD((COUNT(*) + 1)::TEXT, 3, '0') INTO sequence_part
  FROM public.orders
  WHERE order_number LIKE 'ORD' || date_part || '%';
  
  new_order_number := 'ORD' || date_part || sequence_part;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Trigger to update product current_orders when order is created/updated
CREATE OR REPLACE FUNCTION update_product_current_orders()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment current_orders when new order is created
    UPDATE public.products
    SET current_orders = current_orders + NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust current_orders if quantity changed
    IF OLD.quantity != NEW.quantity THEN
      UPDATE public.products
      SET current_orders = current_orders - OLD.quantity + NEW.quantity
      WHERE id = NEW.product_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement current_orders when order is deleted
    UPDATE public.products
    SET current_orders = current_orders - OLD.quantity
    WHERE id = OLD.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_current_orders
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_product_current_orders();
