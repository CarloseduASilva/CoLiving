const prisma = require('../prisma');

const createExpense = async (req, res) => {
    try {
        const { title, amount, category, payerId, groupId, splits, date } = req.body;
        const userId = req.userId; // The user creating the expense

        // Basic validation
        if (!splits || splits.length === 0) {
            return res.status(400).json({ message: 'Splits are required' });
        }

        const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
        // Allow small floating point difference
        if (Math.abs(totalSplitAmount - amount) > 0.01) {
            return res.status(400).json({ message: 'Split amounts do not match total amount' });
        }

        // Verify membership
        const member = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
        });

        if (!member) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const expense = await prisma.expense.create({
            data: {
                title,
                amount,
                category,
                date: date ? new Date(date) : undefined,
                payerId,
                groupId,
                splits: {
                    create: splits.map(split => ({
                        userId: split.userId,
                        amount: split.amount,
                    })),
                },
            },
            include: {
                splits: true,
            },
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getGroupBalances = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.userId;

        // Verify membership
        const member = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });
        if (!member) return res.status(403).json({ message: 'Access denied' });

        // Fetch all expenses and settlements
        const expenses = await prisma.expense.findMany({
            where: { groupId },
            include: { splits: true },
        });

        const settlements = await prisma.settlement.findMany({
            where: { groupId },
        });

        const groupMembers = await prisma.groupMember.findMany({
            where: { groupId },
            include: { user: { select: { id: true, name: true } } },
        });

        // Calculate Net Balances
        const balances = {}; // userId -> amount
        groupMembers.forEach(m => {
            balances[m.userId] = 0.0;
        });

        // Process Expenses
        expenses.forEach(exp => {
            const payerId = exp.payerId;
            const amount = exp.amount;

            // Payer paid the full amount
            if (balances[payerId] !== undefined) {
                balances[payerId] += amount;
            }

            // Subtract what each person owes
            exp.splits.forEach(split => {
                if (balances[split.userId] !== undefined) {
                    balances[split.userId] -= split.amount;
                }
            });
        });

        // Process Settlements
        settlements.forEach(settlement => {
            if (balances[settlement.payerId] !== undefined) {
                balances[settlement.payerId] += settlement.amount;
            }
            if (balances[settlement.receiverId] !== undefined) {
                balances[settlement.receiverId] -= settlement.amount;
            }
        });

        // Simplify Debts
        const debtors = [];
        const creditors = [];

        Object.entries(balances).forEach(([uid, amount]) => {
            if (amount < -0.01) debtors.push({ userId: uid, amount });
            if (amount > 0.01) creditors.push({ userId: uid, amount });
        });

        debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
        creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

        const simplifiedDebts = [];
        let i = 0; // debtor index
        let j = 0; // creditor index

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

            simplifiedDebts.push({
                from: debtor.userId,
                to: creditor.userId,
                amount: parseFloat(amount.toFixed(2)),
            });

            debtor.amount += amount;
            creditor.amount -= amount;

            if (Math.abs(debtor.amount) < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }

        // Format response
        const memberMap = {};
        groupMembers.forEach(m => memberMap[m.userId] = m.user);

        const response = {
            balances: Object.entries(balances).map(([uid, amount]) => ({
                userId: uid,
                user: memberMap[uid],
                amount: parseFloat(amount.toFixed(2)),
            })),
            debts: simplifiedDebts.map(d => ({
                from: memberMap[d.from],
                to: memberMap[d.to],
                amount: d.amount,
            })),
        };

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createExpense, getGroupBalances };
