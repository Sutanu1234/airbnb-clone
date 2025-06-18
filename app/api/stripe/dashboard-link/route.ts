import { GetStripeDashboardLink } from "@/app/actions/getStripeActions";

export async function GET() {
  try {
    return await GetStripeDashboardLink();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
