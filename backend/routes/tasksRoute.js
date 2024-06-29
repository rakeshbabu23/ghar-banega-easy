const router = require('express').Router();
const Task = require('../models/taskModel');
const authMiddleware = require('../middlewares/authMiddleware');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const cloudinary = require("../config/cloudinaryConfig");
const multer = require("multer");

//create a task
router.post('/create-task', authMiddleware, async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        res.send({
            success: true,
            data: newTask,
            message: "Task created successfully",
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false,
        });
    }
});

//get all tasks
router.post('/get-all-tasks', authMiddleware, async (req, res) => {
    try {
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] === "all") {
                delete req.body[key];
            }
        });
        delete req.body["userId"];

        const tasks = await Task.find(req.body).populate('assignedTo').populate('assignedBy').populate('project').sort({ createdAt: -1 });

        res.send({
            success: true,
            data: tasks,
            message: 'Tasks fetched successfully',
        });
    }
    catch (error) {
        res.send({
            message: error.message,
            success: false,
        });
    }
});

//update a task
router.post('/update-task', authMiddleware, async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.body._id, req.body);
        res.send({
            success: true,
            message: 'Task updated successfully',
        });
    }
    catch (error) {
        res.send({
            message: error.message,
            success: false,
        });
    }
});


//delete task
router.post('/delete-task', authMiddleware, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.body._id);
        res.send({
            success: true,
            message: 'Task deleted successfully',
        });
    }
    catch (error) {
        res.send({
            message: error.message,
            success: false,
        });
    }
});


//create multer storage
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});


//upload-image
router.post('/upload-image', authMiddleware, multer({ storage: storage }).single("file"), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "tasks",
        });
        const imageUrl = result.secure_url;

        await Task.findOneAndUpdate(
            { _id: req.body.taskId },
            {
                $push: {
                    attachments: imageUrl,
                },
            }
        );

        res.send({
            success: true,
            data: imageUrl,
            message: "Image uploaded successfully",
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false,
        });
    }
});

module.exports = router;