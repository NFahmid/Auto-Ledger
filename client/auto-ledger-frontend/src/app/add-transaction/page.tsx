"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const accountTypes = {
  asset: ['Cash', 'Accounts Receivable', 'Inventory', 'Supplies', 'Equipment'],
  liability: ['Accounts Payable', 'Loans Payable', 'Unearned Revenue'],
  capital: ["Owner's Capital", "Owner's Drawing", 'Revenue', 'Cost of Goods Sold', 'Depreciation Expense', 'Expense'],
};

// The new, comprehensive rulebook for valid transactions
const transactionRules = {
  // ASSET DEBITS
  'Cash': { credit: ["Accounts Receivable", "Revenue", "Loans Payable", "Owner's Capital", "Unearned Revenue"] },
  'Accounts Receivable': { credit: ["Revenue"] },
  'Inventory': { credit: ["Cash", "Accounts Payable"] },
  'Supplies': { credit: ["Cash", "Accounts Payable"] },
  'Equipment': { credit: ["Cash", "Loans Payable", "Owner's Capital"] },

  // LIABILITY DEBITS
  'Accounts Payable': { credit: ["Cash"] },
  'Loans Payable': { credit: ["Cash"] },
  'Unearned Revenue': { credit: ["Revenue"] }, // When the service is finally delivered

  // EQUITY DEBITS
  "Owner's Drawing": { credit: ["Cash", "Supplies", "Inventory"] },
  'Expense': { credit: ["Cash", "Accounts Payable"] },
  'Cost of Goods Sold': { credit: ["Inventory"] }, // Paired with a sale
  'Depreciation Expense': { credit: ["Equipment"] }, // Represents reduction in asset value
};

type AccountInfo = {
  mainCategory: string;
  subCategory: string;
};

const AddTransactionPage = () => {
  const [debitAccount, setDebitAccount] = useState<AccountInfo | null>(null);
  const [creditAccount, setCreditAccount] = useState<AccountInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const [availableCreditAccounts, setAvailableCreditAccounts] = useState<string[]>([]);
  const [availableDebitAccounts, setAvailableDebitAccounts] = useState<string[]>([]);

  const findMainCategory = (subCategory: string): string | undefined => {
    for (const main in accountTypes) {
      if ((accountTypes as any)[main].includes(subCategory)) {
        return main;
      }
    }
    return undefined;
  };
  
  // Effect to update available CREDIT accounts when DEBIT account changes
  useEffect(() => {
    if (debitAccount?.subCategory) {
      const allowedCredits = transactionRules[debitAccount.subCategory as keyof typeof transactionRules]?.credit || [];
      setAvailableCreditAccounts(allowedCredits);
      if (creditAccount?.subCategory && !allowedCredits.includes(creditAccount.subCategory)) {
        setCreditAccount(null); // Reset credit if it becomes invalid
      }
    } else {
      setAvailableCreditAccounts(Object.values(accountTypes).flat());
    }
  }, [debitAccount]);

  // Effect to update available DEBIT accounts when CREDIT account changes
  useEffect(() => {
    if (creditAccount?.subCategory) {
      const allowedDebits = Object.entries(transactionRules)
        .filter(([_, value]) => value.credit.includes(creditAccount.subCategory))
        .map(([key]) => key);
      setAvailableDebitAccounts(allowedDebits);
      if (debitAccount?.subCategory && !allowedDebits.includes(debitAccount.subCategory)) {
        setDebitAccount(null); // Reset debit if it becomes invalid
      }
    } else {
      setAvailableDebitAccounts(Object.keys(transactionRules));
    }
  }, [creditAccount]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!debitAccount || !creditAccount || !debitAccount.subCategory || !creditAccount.subCategory || !amount || !description) {
      setError('Please fill out all fields, including selecting valid debit and credit accounts.');
      return;
    }

    if (debitAccount.subCategory === creditAccount.subCategory) {
      setError('Debit and Credit accounts cannot be the same.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/login');
          return;
      }

      await api.post('/ledger/transaction', {
        date,
        description,
        amount: parseFloat(amount),
        debit: {
            mainCategory: debitAccount.mainCategory,
            subCategory: debitAccount.subCategory,
        },
        credit: {
            mainCategory: creditAccount.mainCategory,
            subCategory: creditAccount.subCategory,
        }
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('Transaction added successfully!');
      // Optionally reset form
      setDebitAccount(null);
      setCreditAccount(null);
      setAmount('');
      setDescription('');
      setTimeout(() => router.push('/dashboard'), 1500);

    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while adding the transaction.');
      console.error(err);
    }
  };

  const handleDebitSubChange = (sub: string) => {
    if (sub) {
        const main = findMainCategory(sub);
        if(main) setDebitAccount({ mainCategory: main, subCategory: sub });
    } else {
        setDebitAccount(null);
    }
  };

  const handleCreditSubChange = (sub: string) => {
    if (sub) {
        const main = findMainCategory(sub);
        if(main) setCreditAccount({ mainCategory: main, subCategory: sub });
    } else {
        setCreditAccount(null);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="flex flex-col items-center pt-10">
            <h1 className="text-4xl font-bold mb-8">Add New Transaction</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
                {error && <p className="text-red-500 bg-red-900/20 p-3 rounded-md mb-4">{error}</p>}
                {success && <p className="text-green-500 bg-green-900/20 p-3 rounded-md mb-4">{success}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Debit Section */}
                <div className="bg-gray-700 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-red-400">Debit (Dr)</h2>
                    <label htmlFor="debit-sub" className="block text-sm font-medium mb-2">Account</label>
                    <select
                        id="debit-sub"
                        className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => handleDebitSubChange(e.target.value)}
                        value={debitAccount?.subCategory || ''}
                    >
                        <option value="">Select Account</option>
                        {availableDebitAccounts.map(sub => (
                            <option key={`debit-${sub}`} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>

                {/* Credit Section */}
                <div className="bg-gray-700 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-green-400">Credit (Cr)</h2>
                    <label htmlFor="credit-sub" className="block text-sm font-medium mb-2">Account</label>
                    <select
                        id="credit-sub"
                        className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => handleCreditSubChange(e.target.value)}
                        value={creditAccount?.subCategory || ''}
                        disabled={!debitAccount?.subCategory}
                    >
                        <option value="">Select Account</option>
                        {availableCreditAccounts.map(sub => (
                            <option key={`credit-${sub}`} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-2">Date</label>
                        <input
                            type="date"
                            id="date"
                            className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                        <input
                        type="text"
                        id="description"
                        className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Sale of services to Client X"
                        required
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="amount" className="block text-sm font-medium mb-2">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                    />
                </div>
                
                <button 
                    type="submit"
                    className="w-full p-4 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={!debitAccount?.subCategory || !creditAccount?.subCategory || !amount}
                >
                    Add Transaction
                </button>
            </form>
        </div>
    </div>
  );
};

export default AddTransactionPage; 