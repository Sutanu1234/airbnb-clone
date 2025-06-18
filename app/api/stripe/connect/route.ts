// app/api/stripe/connect/route.ts
import { stripe } from "@/app/libs/stripe";
import prisma from "@/app/libs/prismadb";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "account.updated") {
    const account = event.data.object;

    await prisma.user.updateMany({
      where: { connectedAccountId: account.id },
      data: {
        stripeConnectedLinked:
          account.capabilities?.transfers === "active" ||
          account.charges_enabled === true,
      },
    });
  }

  return new Response("ok", { status: 200 });
}
