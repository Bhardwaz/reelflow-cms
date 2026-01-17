const express = require("express")
const router = express.Router()
const bunnyWebhook = require('../controllers/webhook_controller')
const { getDashboardStats } = require("../controllers/dashboard.controller")
const checkDbSession = require("../middleware/checkDbSession")
const auth = require("../middleware/auth")

router.post('/video/updates', express.json(), bunnyWebhook)
router.get('/media/views', auth, checkDbSession, getDashboardStats)

module.exports = router