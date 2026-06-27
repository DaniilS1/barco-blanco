import { NextResponse } from "next/server";
import { POST as sendEmailPOST } from "@/app/api/send_email/route";
import { headers } from "next/headers";

// Public-facing order endpoint — no token required from client.
// The token is injected server-side before delegating to send_email.
export async function POST(request: Request) {
    const requestHeaders = await headers();
    const ip = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? "unknown";
    const token = process.env.ORDER_API_TOKEN ?? "";

    if (!token) {
        console.error(`[${new Date().toISOString()}] ORDER_API_TOKEN not set`);
        return NextResponse.json({ error: "Service misconfigured" }, { status: 500 });
    }

    // Clone body and forward with the internal token attached
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const internalRequest = new Request(request.url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Order-Token": token,
            "x-forwarded-for": ip,
        },
        body: JSON.stringify(body),
    });

    return sendEmailPOST(internalRequest);
}
