const express = require('express');
const { createGroup, getGroups, joinGroup, getGroupDetails } = require('../controllers/group.controller');
const { getGroupBalances } = require('../controllers/expense.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createGroup);
router.get('/', getGroups);
router.post('/join', joinGroup);
router.get('/:id', getGroupDetails);
router.get('/:groupId/balances', getGroupBalances);

module.exports = router;
