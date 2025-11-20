const prisma = require('../prisma');
const { v4: uuidv4 } = require('uuid');

const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId;

        const inviteCode = uuidv4().substring(0, 6).toUpperCase();

        const group = await prisma.group.create({
            data: {
                name,
                inviteCode,
                members: {
                    create: {
                        userId,
                    },
                },
            },
        });

        res.status(201).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getGroups = async (req, res) => {
    try {
        const userId = req.userId;

        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });

        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const joinGroup = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.userId;

        const group = await prisma.group.findUnique({
            where: { inviteCode },
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const existingMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId: group.id,
                },
            },
        });

        if (existingMember) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        await prisma.groupMember.create({
            data: {
                userId,
                groupId: group.id,
            },
        });

        res.json({ message: 'Joined group successfully', group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getGroupDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verify membership
        const member = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId: id,
                },
            },
        });

        if (!member) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                expenses: {
                    orderBy: { date: 'desc' },
                    include: {
                        payer: { select: { id: true, name: true } },
                        splits: { include: { user: { select: { id: true, name: true } } } },
                    },
                },
            },
        });

        res.json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createGroup, getGroups, joinGroup, getGroupDetails };
