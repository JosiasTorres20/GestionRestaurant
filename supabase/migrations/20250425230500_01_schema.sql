-- Crear tipos enumerados
CREATE TYPE user_role AS ENUM ('root_admin', 'restaurant_admin', 'kitchen');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');

-- Crear tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  address TEXT,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de categorías de menú
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de elementos de menú
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  status order_status DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de elementos de orden
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear triggers para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers a todas las tablas
CREATE TRIGGER update_restaurants_timestamp
BEFORE UPDATE ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_menu_categories_timestamp
BEFORE UPDATE ON menu_categories
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_menu_items_timestamp
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Crear políticas de seguridad RLS (Row Level Security)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política para root_admin: acceso completo a todas las tablas
CREATE POLICY root_admin_restaurants_policy ON restaurants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'root_admin'));

CREATE POLICY root_admin_users_policy ON users
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'root_admin'));

-- Política para restaurant_admin: acceso a su propio restaurante
CREATE POLICY restaurant_admin_restaurants_policy ON restaurants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'restaurant_admin' AND users.restaurant_id = restaurants.id));

-- Política para restaurant_admin: acceso a usuarios de su restaurante
CREATE POLICY restaurant_admin_users_policy ON users
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users admin WHERE admin.id = auth.uid() AND admin.role = 'restaurant_admin' AND admin.restaurant_id = users.restaurant_id));

-- Política para restaurant_admin: acceso a categorías de su restaurante
CREATE POLICY restaurant_admin_menu_categories_policy ON menu_categories
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND (users.role = 'restaurant_admin' OR users.role = 'kitchen') AND users.restaurant_id = menu_categories.restaurant_id));

-- Política para restaurant_admin: acceso a elementos de menú de su restaurante
CREATE POLICY restaurant_admin_menu_items_policy ON menu_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    JOIN menu_categories ON menu_categories.restaurant_id = users.restaurant_id
    WHERE users.id = auth.uid() 
    AND (users.role = 'restaurant_admin' OR users.role = 'kitchen')
    AND menu_items.category_id = menu_categories.id
  ));

-- Política para restaurant_admin: acceso a órdenes de su restaurante
CREATE POLICY restaurant_admin_orders_policy ON orders
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND (users.role = 'restaurant_admin' OR users.role = 'kitchen') AND users.restaurant_id = orders.restaurant_id));

-- Política para restaurant_admin: acceso a elementos de orden de su restaurante
CREATE POLICY restaurant_admin_order_items_policy ON order_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    JOIN orders ON orders.restaurant_id = users.restaurant_id
    WHERE users.id = auth.uid() 
    AND (users.role = 'restaurant_admin' OR users.role = 'kitchen')
    AND order_items.order_id = orders.id
  ));

-- Política para acceso público al menú
CREATE POLICY public_menu_categories_policy ON menu_categories
  FOR SELECT
  USING (true);

CREATE POLICY public_menu_items_policy ON menu_items
  FOR SELECT
  USING (true);

