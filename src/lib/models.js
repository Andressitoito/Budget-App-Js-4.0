// lib/models.js
import mongoose from 'mongoose';
import dbConnect from './db';

// Import schemas
import categorySchema from '../models/categoryModel';
import organizationSchema from '../models/organizationModel';
import transactionSchema from '../models/transactionModel';
import userSchema from '../models/usersModel';
import incomingTransactionSchema from '../models/incomingTransaction';

// Register models
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const IncomingTransaction = mongoose.models.IncomingTransaction || mongoose.model('IncomingTransaction', incomingTransactionSchema);

// Export models
export { Category, Organization, Transaction, User, IncomingTransaction };

// Ensure DB connection
export async function initModels() {
  await dbConnect();
  return { Category, Organization, Transaction, User, IncomingTransaction };
}