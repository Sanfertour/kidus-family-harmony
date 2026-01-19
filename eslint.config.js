import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "supabase/functions"] }, // Añadimos ignores para funciones de Supabase si usas Deno
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      
      // 1. CÓDIGO LIMPIO: No permitimos variables sin usar, excepto las que empiezan por _
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_", 
        "varsIgnorePattern": "^_" 
      }],

      // 2. SEGURIDAD DE TIPOS: Evitamos el uso de 'any' para no perder el tipado de Supabase
      "@typescript-eslint/no-explicit-any": "warn",

      // 3. SINCRONIZACIÓN ÉLITE: Exhaustive-deps DEBE ser warn. 
      // Si olvidas una dependencia en un useEffect que llama a Supabase, 
      // los datos del Nido no se actualizarán.
      "react-hooks/exhaustive-deps": "warn",

      // 4. EVITAR IMPORTS CIRCULARES (Opcional pero recomendado)
      "no-console": ["warn", { allow: ["warn", "error"] }], // Mantenemos la consola limpia de logs basura
    },
  },
);
