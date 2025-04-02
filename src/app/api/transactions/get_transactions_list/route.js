import dbConnect from '../../../../lib/db';
import { get_transactions_list } from '../../../../lib/api/transactions/get_transactions_list';

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const organization_id = searchParams.get('organization_id');

    if (!organization_id) {
      return new Response(JSON.stringify({ message: 'organization_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transactions = await get_transactions_list(organization_id);

    return new Response(JSON.stringify({ message: 'Transactions retrieved', transactions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('invalid or inexistent') ? 422 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
