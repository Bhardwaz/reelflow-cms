const express = require("express")
const router = express.Router()
const bunnyWebhook = require('../controllers/webhook_controller')

router.post('/video/updates', express.json(), bunnyWebhook)

module.exports = router