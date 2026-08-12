import { NextResponse } from "next/server";
import crypto from "node:crypto";

type LineSource =
  | { type: "user"; userId: string }
  | { type: "group"; groupId: string }
  | { type: "room"; roomId: string };

type LineEvent = {
  type: string;
  replyToken?: string;
  source: LineSource;
};

function verifySignature(body: string, signature: string | null) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret || !signature) return false;

  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");

  return hash === signature;
}

async function replyMessage(replyToken: string, text: string) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

function describeSource(source: LineSource): string {
  switch (source.type) {
    case "group":
      return `このグループのID:\n${source.groupId}`;
    case "room":
      return `このルームのID:\n${source.roomId}`;
    case "user":
      return `あなたのユーザーID:\n${source.userId}`;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifySignature(body, signature)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const { events } = JSON.parse(body) as { events: LineEvent[] };

  for (const event of events) {
    if (!event.replyToken) continue;
    await replyMessage(event.replyToken, describeSource(event.source));
  }

  return NextResponse.json({ ok: true });
}
