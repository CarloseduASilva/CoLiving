'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus, DollarSign, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    payer: { id: string; name: string };
    splits: { user: { id: string; name: string }; amount: number }[];
}

interface Balance {
    userId: string;
    user: { id: string; name: string };
    amount: number;
}

interface Debt {
    from: { id: string; name: string };
    to: { id: string; name: string };
    amount: number;
}

export default function GroupPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<any>(null);
    const [balances, setBalances] = useState<Balance[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'charts'>('expenses');
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Add Expense Form State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [payerId, setPayerId] = useState('');
    const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    useEffect(() => {
        fetchGroup();
        fetchBalances();
    }, [groupId]);

    const fetchGroup = async () => {
        try {
            const response = await api.get(`/groups/${groupId}`);
            setGroup(response.data);
            if (response.data.members.length > 0) {
                setPayerId(response.data.members[0].userId);
                setSelectedMembers(response.data.members.map((m: any) => m.userId));
            }
        } catch (error) {
            console.error('Failed to fetch group', error);
        }
    };

    const fetchBalances = async () => {
        try {
            const response = await api.get(`/groups/${groupId}/balances`);
            setBalances(response.data.balances);
            setDebts(response.data.debts);
        } catch (error) {
            console.error('Failed to fetch balances', error);
        }
    };

    const addExpense = async () => {
        try {
            const amountNum = parseFloat(amount);
            const splits = selectedMembers.map((userId) => ({
                userId,
                amount: amountNum / selectedMembers.length,
            }));

            await api.post('/expenses', {
                title,
                amount: amountNum,
                category,
                payerId,
                groupId,
                splits,
            });

            setShowAddExpense(false);
            setTitle('');
            setAmount('');
            fetchGroup();
            fetchBalances();
        } catch (error) {
            console.error('Failed to add expense', error);
        }
    };

    const getCategoryData = () => {
        if (!group?.expenses) return [];
        const categoryMap: { [key: string]: number } = {};
        group.expenses.forEach((exp: Expense) => {
            categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    };

    const getMemberSpendingData = () => {
        if (!group?.expenses) return [];
        const memberMap: { [key: string]: number } = {};
        group.expenses.forEach((exp: Expense) => {
            memberMap[exp.payer.name] = (memberMap[exp.payer.name] || 0) + exp.amount;
        });
        return Object.entries(memberMap).map(([name, amount]) => ({ name, amount }));
    };

    const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

    if (!group) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-white/80 mb-4 transition">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{group.name}</h1>
                            <p className="text-white/80 mt-1">Invite Code: <span className="font-mono bg-white/20 px-2 py-1 rounded">{group.inviteCode}</span></p>
                        </div>
                        <button
                            onClick={() => setShowAddExpense(true)}
                            className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-white/90 transition font-semibold shadow-lg"
                        >
                            <Plus size={18} />
                            Add Expense
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="text-white" size={24} />
                            <span className="text-white/80 text-sm">Total Spent</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            ${group.expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="text-white" size={24} />
                            <span className="text-white/80 text-sm">Expenses</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{group.expenses.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-white" size={24} />
                            <span className="text-white/80 text-sm">Members</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{group.members.length}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'expenses'
                            ? 'bg-white text-purple-600 shadow-lg'
                            : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('balances')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'balances'
                            ? 'bg-white text-purple-600 shadow-lg'
                            : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                    >
                        Balances
                    </button>
                    <button
                        onClick={() => setActiveTab('charts')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'charts'
                            ? 'bg-white text-purple-600 shadow-lg'
                            : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                    >
                        Charts
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'expenses' && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-4">Recent Expenses</h2>
                        <div className="space-y-3">
                            {group.expenses.map((expense: Expense) => (
                                <div key={expense.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{expense.title}</h3>
                                            <p className="text-white/70 text-sm">Paid by {expense.payer.name}</p>
                                            <p className="text-white/60 text-xs mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-xl">${expense.amount.toFixed(2)}</p>
                                            <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded mt-1">
                                                {expense.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {group.expenses.length === 0 && (
                                <p className="text-white/70 text-center py-8">No expenses yet. Add one to get started!</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'balances' && (
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">Member Balances</h2>
                            <div className="space-y-3">
                                {balances.map((balance) => (
                                    <div key={balance.userId} className="flex justify-between items-center bg-white/10 rounded-lg p-4 border border-white/20">
                                        <span className="text-white font-medium">{balance.user.name}</span>
                                        <span
                                            className={`font-bold text-lg ${balance.amount > 0 ? 'text-green-300' : balance.amount < 0 ? 'text-red-300' : 'text-white'
                                                }`}
                                        >
                                            {balance.amount > 0 ? '+' : ''}${balance.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">Simplified Debts</h2>
                            <div className="space-y-3">
                                {debts.map((debt, idx) => (
                                    <div key={idx} className="bg-white/10 rounded-lg p-4 border border-white/20">
                                        <p className="text-white">
                                            <span className="font-semibold">{debt.from.name}</span> owes{' '}
                                            <span className="font-semibold">{debt.to.name}</span>{' '}
                                            <span className="font-bold text-yellow-300">${debt.amount.toFixed(2)}</span>
                                        </p>
                                    </div>
                                ))}
                                {debts.length === 0 && (
                                    <p className="text-white/70 text-center py-8">All settled up! 🎉</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'charts' && (
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">Expenses by Category</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={getCategoryData()}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {getCategoryData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">Spending by Member</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={getMemberSpendingData()}>
                                    <XAxis dataKey="name" stroke="#fff" />
                                    <YAxis stroke="#fff" />
                                    <Tooltip />
                                    <Bar dataKey="amount" fill="#8B5CF6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            {showAddExpense && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl my-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Expense</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., Groceries"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="Food">Food</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Paid by</label>
                                <select
                                    value={payerId}
                                    onChange={(e) => setPayerId(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {group.members.map((member: any) => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Split between</label>
                                <div className="space-y-2">
                                    {group.members.map((member: any) => (
                                        <label key={member.userId} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(member.userId)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedMembers([...selectedMembers, member.userId]);
                                                    } else {
                                                        setSelectedMembers(selectedMembers.filter((id) => id !== member.userId));
                                                    }
                                                }}
                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                                            />
                                            <span className="text-gray-700">{member.user.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddExpense(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addExpense}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
