import { stripe } from "../libs/stripe";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { NextResponse } from "next/server";

/**
 * Generates a Stripe onboarding link for users who already have a Stripe account ID saved.
 */
export async function CreateStripeAccoutnLink() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Avoid creating again if already exists
  if (user.connectedAccountId) {
    return NextResponse.json({ message: "Already connected" });
  }

  const account = await stripe.accounts.create({
    type: "express",
    email: user.email!,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { connectedAccountId: account.id },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/billing"
        : "https://marshal-ui-yt.vercel.app/billing",
    return_url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : `https://marshal-ui-yt.vercel.app/return/${account.id}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

/**
 * Generates a login link to view the Stripe Express Dashboard for connected users.
 */
export async function GetStripeDashboardLink() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: { connectedAccountId: true },
  });

  if (!data?.connectedAccountId || data.connectedAccountId.trim() === "") {
    throw new Error("No Stripe connected account found");
  }

  const loginLink = await stripe.accounts.createLoginLink(
    data.connectedAccountId
  );

  return new Response(JSON.stringify({ url: loginLink.url }));
}
