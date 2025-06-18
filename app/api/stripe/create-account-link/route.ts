import { CreateStripeAccoutnLink } from "@/app/actions/getStripeActions";

export async function GET() {
  try {
    return await CreateStripeAccoutnLink();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
