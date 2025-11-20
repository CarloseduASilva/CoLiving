const express = require('express');
const { createExpense } = require('../controllers/expense.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createExpense);

module.exports = router;
