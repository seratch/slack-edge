export async function parseRequestBody(
  requestHeaders: Headers,
  requestBody: string
): Promise<Record<string, any>> {
  const contentType = requestHeaders.get("content-type");
  if (
    contentType?.startsWith("application/json") ||
    requestBody.startsWith("{")
  ) {
    return JSON.parse(requestBody);
  }
  const params = new URLSearchParams(requestBody);
  if (params.has("payload")) {
    const payload = params.get("payload")!;
    return JSON.parse(payload);
  }
  const formBody: any = {};
  for (const k of params.keys()) {
    formBody[k] = params.get(k);
  }
  return formBody;
}
