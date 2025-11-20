const prisma = require('../prisma');

const createSettlement = async (req, res) => {
    try {
        const { payerId, receiverId, amount, groupId } = req.body;
        const userId = req.userId;

        // Verify membership
        const member = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });
        if (!member) return res.status(403).json({ message: 'Access denied' });

        const settlement = await prisma.settlement.create({
            data: {
                payerId,
                receiverId,
                amount,
                groupId,
            },
        });

        res.status(201).json(settlement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createSettlement };
