import { NextResponse } from "next/server";
import { stripe } from "@/app/libs/stripe";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";



export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.error();

    const body = await request.json();
    const { listingId, startDate, endDate, totalPrice } = body;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: true,
      },
    });

    if (!listing || !listing.user.connectedAccountId) {
      return NextResponse.json({ error: "Listing or connected account not found" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: listing.price * 100,
            product_data: {
              name: listing.title,
              description: listing.description,
              images: [listing.imageSrc],
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(listing.price * 100 * 0.1), // 10% fee
        transfer_data: {
          destination: listing.user.connectedAccountId,
        },
      },
      metadata: {
        listingId: listingId,
        userId: currentUser.id,
        startDate: startDate,
        endDate: endDate,
        totalPrice: totalPrice,
      },
      success_url: process.env.NODE_ENV === "development"
        ? "http://localhost:3000//payment/success"
        : "https://yourdomain.com/payment/success",
      cancel_url: process.env.NODE_ENV === "development"
        ? "http://localhost:3000//payment/cancle"
        : "https://yourdomain.com/payment/cancel",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
