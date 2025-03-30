// lib/api/transactions/create_transaction.js
import Transaction from '../../../models/transactionModel';
import dbConnect from '../../db';

export const createTransaction = async (transaction) => {
  const { category_id, organization_id, username, item, price, status } = transaction;

  await dbConnect();

  try {
    const transactionToSave = new Transaction({
      category_id,
      organization_id,
      username,
      item,
      price,
      status: status || 'completed',
      date: Date.now(),
    });
    const savedTransaction = await transactionToSave.save();

    const io = global.io;
    if (io) {
      io.to(organization_id).emit('newTransaction', savedTransaction.toObject()); // Ensure plain object
    }

    return savedTransaction;
  } catch (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }
};