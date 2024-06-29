import { Form, Input, Modal, Upload, message, Tabs, Button } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../../redux/loadersSlice'
import { CreateTask, UpdateTask, UploadImage } from '../../../apiCalls/tasks'
import { AddNotification } from '../../../apiCalls/notifications'

function TaskForm({ showTaskForm, setShowTaskForm, project, task, reloadData }) {
    const [selectedTab = '1', setSelectedTab] = useState('1');
    const [email, setEmail] = useState('');
    const { user } = useSelector((state) => state.users);
    const formRef = React.useRef(null);
    const [file = null, setFile] = useState(null);
    const [images = [], setImages] = useState(task?.attachments || []);
    const dispatch = useDispatch();
    const onFinish = async (values) => {
        try {
            let response = null;
            const assignedToMember = project.members.find((member) => member.user.email === email);
            const assignedToUserId = assignedToMember.user._id;
            dispatch(setLoading(true));
            if (task) {
                //update task
                response = await UpdateTask({
                    ...values,
                    project: project._id,
                    _id: task._id,
                    assignedTo: task.assignedTo._id,
                });
            } else {
                const assignedBy = user._id;
                response = await CreateTask({
                    ...values,
                    project: project._id,
                    assignedTo: assignedToUserId,
                    assignedBy,

                });
            }

            if (response.success) {
                if (!task) {
                    //send notification to the assigned employee
                    AddNotification({
                        title: `You have been assigned a new task in ${project.name}`,
                        user: assignedToUserId,
                        onClick: `/project/${project._id}`,
                        description: values.description,
                    });
                }


                reloadData();
                message.success(response.message);
                setShowTaskForm(false);
            }

            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            message.error(error.message);
        }
    };


    const validateEmail = () => {
        const employeesInProject = project.members.filter((member) => member.role === 'employee' || 'admin');
        const isEmailValid = employeesInProject.find((employee) => employee.user.email === email);
        return isEmailValid ? true : false;
    }

    const uploadImage = async () => {
        try {
            dispatch(setLoading(true));
            const formData = new FormData();
            formData.append("file", file);
            formData.append("taskId", task._id);
            const response = await UploadImage(formData);
            if (response.success) {
                message.success(response.message);
                setImages([...images, response.data]);
                reloadData();
            } else {
                throw new Error(response.message);
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
            message.error(error.message);
        }
    }

    const deleteImage = async (image) => {
        try {
            dispatch(setLoading(true));
            const attachments = images.filter((img) => img !== image);
            const response = await UpdateTask({
                ...task,
                attachments,
            });
            if (response.success) {
                message.success(response.message);
                setImages(attachments);
                reloadData();
            } else {
                throw new Error(response.message);
            }
            dispatch(setLoading(false));
        } catch (error) {
            message.error(error.message);
            dispatch(setLoading(false));
        }
    }

    return (
        <Modal
            title={task ? 'Update Task' : 'Create Task'}
            open={showTaskForm}
            onCancel={() => setShowTaskForm(false)}
            centered
            onOk={() => {
                formRef.current.submit();
            }}
            okText={task ? 'UPDATE' : 'CREATE'}
            {...(selectedTab === '2' && { footer: null })}
        >
            <Tabs
                activeKey={selectedTab}
                onChange={(key) => setSelectedTab(key)}
            >
                <Tabs.TabPane tab="Task Details" key='1'>
                    <Form layout='vertical' ref={formRef} onFinish={onFinish}
                        initialValues={{
                            ...task,
                            assignedTo: task ? task.assignedTo.email : '',
                        }}>
                        <Form.Item label="Task Name" name="name">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Description" name="description">
                            <TextArea />
                        </Form.Item>

                        <Form.Item label='Assign To' name='assignedTo'>
                            <Input placeholder='Enter email of the assignee'
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={task ? true : false}
                            />
                        </Form.Item>

                        {email &&
                            !validateEmail() && <div className='bg-red-700 text-sm rounded p-2'>
                                <span className='text-white'>Email is not valid</span>
                            </div>
                        }
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Attachments" key='2' disabled={!task}>
                    <div className='flex gap-5 mb-5'>
                        {images.map((image) => {
                            return (
                                <div className='flex gap-2 border border-solid rounded border-gray-500 items-end'>
                                    <img
                                        src={image}
                                        alt=""
                                        className='w-20 h-20 object-cover p-2 '
                                    />
                                    <i className='ri-delete-bin-line'
                                        onClick={() => deleteImage(image)}
                                    ></i>
                                </div>
                            )
                        })}
                    </div>
                    <Upload
                        beforeUpload={() => false}
                        onChange={(info) => {
                            setFile(info.file);
                        }}
                        listType='picture'
                    >
                        <Button type="dashed">Select Images</Button>
                    </Upload>

                    <div className="flex justify-end mt-4 gap-5">
                        <Button type="primary" onClick={uploadImage} disabled={!file}>
                            Upload
                        </Button>
                        <Button type="default" onClick={() => setShowTaskForm(false)} >
                            Cancel
                        </Button>
                    </div>
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    )
}

export default TaskForm