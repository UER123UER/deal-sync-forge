import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // vite-react-ssg options. Pre-render only public marketing routes; the
  // authenticated app stays client-rendered (data depends on a logged-in user).
  ssgOptions: {
    script: "async",
    formatting: "none",
    mock: true,
    crittersOptions: false,
    beastiesOptions: false,
    includedRoutes(paths: string[]) {
      // vite-react-ssg yields child paths without a leading "/" — normalize first.
      const normalize = (p: string) => (p.startsWith("/") ? p : `/${p}`);
      const publicRoutes = new Set([
        "/",
        "/why-us",
        "/case-studies",
        "/auth",
        "/signup",
      ]);
      return paths
        .map(normalize)
        .filter((p) => publicRoutes.has(p) || p.startsWith("/case-studies/"));
    },
  },
}));
