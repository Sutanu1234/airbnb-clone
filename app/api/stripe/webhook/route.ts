// app/api/stripe/webhook/route.ts
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
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return new Response("Webhook Error", { status: 400 });
  }

  // ✅ Payment success
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    try {
      await prisma.reservation.create({
        data: {
          listingId: session.metadata.listingId,
          userId: session.metadata.userId,
          startDate: new Date(session.metadata.startDate),
          endDate: new Date(session.metadata.endDate),
          totalPrice: parseInt(session.metadata.totalPrice),
        },
      });
      console.log("✅ Reservation created");
    } catch (err) {
      console.error("❌ Failed to create reservation:", err);
    }
  }

  return new Response(null, { status: 200 });
}
