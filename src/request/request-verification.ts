export async function verifySlackRequest(
  signingSecret: string,
  requsetHeaders: Headers,
  requestBody: string
) {
  const timestampHeader = requsetHeaders.get("x-slack-request-timestamp");
  if (!timestampHeader) {
    console.log("x-slack-request-timestamp header is missing!");
    return false;
  }
  const fiveMinutesAgoSeconds = Math.floor(Date.now() / 1000) - 60 * 5;
  if (Number.parseInt(timestampHeader) < fiveMinutesAgoSeconds) {
    return false;
  }

  const signatureHeader = requsetHeaders.get("x-slack-signature");
  if (!timestampHeader || !signatureHeader) {
    console.log("x-slack-signature header is missing!");
    return false;
  }

  const textEncoder = new TextEncoder();
  return await crypto.subtle.verify(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(signingSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    ),
    fromHexStringToBytes(signatureHeader.substring(3)),
    textEncoder.encode(`v0:${timestampHeader}:${requestBody}`)
  );
}

function fromHexStringToBytes(hexString: string) {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let idx = 0; idx < hexString.length; idx += 2) {
    bytes[idx / 2] = parseInt(hexString.substring(idx, idx + 2), 16);
  }
  return bytes.buffer;
}
