export function mediaBytesResponse(bytes: Blob, contentType: string, cache: "public" | "private") {
  return new Response(bytes, {
    headers: {
      "Content-Type": contentType || bytes.type || "application/octet-stream",
      "Cache-Control": cache === "public" ? "public, max-age=3600" : "private, no-store",
    },
  });
}
