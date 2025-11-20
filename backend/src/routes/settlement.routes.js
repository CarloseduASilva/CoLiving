const express = require('express');
const { createSettlement } = require('../controllers/settlement.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createSettlement);

module.exports = router;
