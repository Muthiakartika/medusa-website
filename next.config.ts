import type { NextConfig } from "next";
import { REDIRECTS } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  /*
    The old site is WordPress, so every URL with any history behind it ends in
    a slash - and Next resolves the trailing-slash normalisation before it
    consults the redirect table. Without this, /valeting/ would 308 to
    /valeting and only then to /car-valeting/: a two-hop chain on the exact
    form of the URL these redirects exist to catch.
  */
  trailingSlash: true,

  async redirects() {
    return REDIRECTS.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
