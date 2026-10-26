const apiUrl = new URL(process.env.API_ORIGIN || "https://example.com")

if (!process.env.API_ORIGIN || apiUrl.protocol !== "https:" || apiUrl.pathname !== "/" || apiUrl.search || apiUrl.hash) {
  throw new Error("API_ORIGIN must be the HTTPS origin of the Render service")
}

export const config = {
  rewrites: [
    { source: "/api/:path*", destination: `${apiUrl.origin}/api/:path*` },
    { source: "/(.*)", destination: "/index.html" }
  ]
}
