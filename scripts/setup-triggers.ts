import { createClient } from "@supabase/supabase-js"

async function setupTriggers() {
  // Crear cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de entorno de Supabase")
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("🚀 Configurando triggers...")

  try {
    // Crear función para actualizar timestamp
    await supabase.query(`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Crear triggers para cada tabla
    const tables = ["restaurants", "users", "menu_categories", "menu_items", "orders"]

    for (const table of tables) {
      await supabase.query(`
        DROP TRIGGER IF EXISTS update_${table}_timestamp ON ${table};
        CREATE TRIGGER update_${table}_timestamp
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
      `)

      console.log(`- Trigger creado para tabla ${table}`)
    }

    console.log("✅ Triggers configurados correctamente")
  } catch (error) {
    console.error("❌ Error al configurar triggers:", error)
    throw error
  }
}

// Ejecutar la función
setupTriggers()
