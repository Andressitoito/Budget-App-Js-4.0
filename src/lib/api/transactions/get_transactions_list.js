import Transaction from '../../models';

export const get_transactions_list = async (organization_id) => {
  try {
    let transactions = await Transaction.find({ organization_id }).lean();
    transactions = transactions.reverse();

    // Convert ObjectIds to strings to avoid serialization issues
    return transactions.map(transaction => ({
      ...transaction,
      _id: transaction._id.toString(),
      category_id: transaction.category_id.toString(),
      organization_id: transaction.organization_id.toString(),
    }));
  } catch (error) {
    throw new Error(error);
  }
};