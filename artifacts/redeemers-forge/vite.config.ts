import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT || 3000);
  const host = env.HOST || "0.0.0.0";
  
  const base = mode === "production" ? "/Redeemers-Forge/" : (env.BASE_PATH || env.BASE_URL || "/");

  return {
    base,
    plugins: [
      {
        name: "force-nested-node-modules",
        async resolveId(source) {
          if (source === "react" || source.startsWith("react/")) {
            try {
              const resolved = await this.resolve(source, path.resolve(__dirname, "package.json"), { skipSelf: true });
              return resolved ?? null;
            } catch {
              return null;
            }
          }
          return null;
        }
      },
      react(), 
      tailwindcss({ optimize: false })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@assets": path.resolve(__dirname, "..", "..", "attached_assets"),
        "@tanstack/react-query": path.resolve(__dirname, "node_modules", "@tanstack", "react-query"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(__dirname, "../../"), 
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      assetsDir: "assets",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "../../index.html"),
        },
      },
    },
    server: { port, strictPort: false, host, allowedHosts: true, fs: { strict: false } },
    preview: { port, host, allowedHosts: true },
  };
});
