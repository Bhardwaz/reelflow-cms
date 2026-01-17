const express = require('express')
const auth = require('../middleware/auth')
const { createWidget, getAllWidgets, deleteWidget, getWidgetWithProducts, attachMediaToWidget, toggleLive } = require('../controllers/widget_controller')
const checkDbSession = require('../middleware/checkDbSession')

const router = express.Router()

router.post('/', auth, checkDbSession, createWidget)

router.get('/', auth, checkDbSession, getAllWidgets)

// delete the widget and its related data in pivot table
router.delete('/:widgetId', auth, checkDbSession, deleteWidget)

router.get('/getWidget', getWidgetWithProducts)

router.post("/attach", auth, checkDbSession, attachMediaToWidget)

router.post("/goLive/:widgetId", checkDbSession, toggleLive)

module.exports = router