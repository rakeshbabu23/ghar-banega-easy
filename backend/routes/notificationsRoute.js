const router = require('express').Router();

const Notifications = require("../models/notificationsModel");

const authMiddleware = require('../middlewares/authMiddleware');

//add a notification
router.post('/add-notification', authMiddleware, async (req, res) => {
    try {
        const newNotification = new Notifications(req.body);
        await newNotification.save();
        res.send({
            success: true,
            data: newNotification,
            message: "Notification added successfully",
        });
    } catch (error) {
        res.send({
            error: error.message,
            success: false,
        });
    }
});

//get all notifications
router.get('/get-all-notifications', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notifications.find({
            user: req.body.userId,
        }).sort({ createdAt: -1 });
        res.send({
            success: true,
            data: notifications,
        });
    } catch (error) {
        res.send({
            error: error.message,
            success: false,
        });
    }
});

//mark notifications as read
router.post('/mark-as-read', authMiddleware, async (req, res) => {
    try {
        await Notifications.updateMany({
            user: req.body.userId,
            read: false,
        }, {
            read: true,
        });
        const notifications = await Notifications.find({
            user: req.body.userId,
        }).sort({ createdAt: -1 });
        res.send({
            success: true,
            message: "Notifications marked as read successfully",
            data: notifications,
        });
    } catch (error) {
        res.send({
            error: error.message,
            success: false,
        });
    }
});

//delete all notifications
router.post('/delete-all-notifications', authMiddleware, async (req, res) => {
    try {
        await Notifications.deleteMany({
            user: req.body.userId,
        });
        res.send({
            success: true,
            message: "All notifications deleted successfully",
        });
    } catch (error) {
        res.send({
            error: error.message,
            success: false,
        });
    }
});


module.exports = router;