import { createTransaction } from '../../../lib/api/transactions/create_transaction';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
		console.log("route hit", req.body);
    const savedTransaction = await createTransaction(req.body);
    res.status(201).json({ message: 'Transaction created', transaction: savedTransaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}