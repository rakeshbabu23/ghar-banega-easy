import { Modal, message } from 'antd'
import moment from 'moment';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { setLoading } from '../redux/loadersSlice';
import { DeleteAllNotifications, MarkNotificationsRead } from '../apiCalls/notifications';
import { SetNotifications } from '../redux/usersSlice';

function Notifications({
    showNotifications,
    setShowNotifications,
}) {
    const { notifications } = useSelector((state) => state.users);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const readNotifications = async () => {
        try {
            const response = await MarkNotificationsRead();
            if (response.success) {
            dispatch(SetNotifications(response.data));
            }
        } catch (error) {
            
            message.error(error.message);
        }
    };

    const deleteAllNotifications = async () => {
       try {
        dispatch(setLoading(true));
        const response = await DeleteAllNotifications();
        dispatch(setLoading(false));
        if (response.success) {
            dispatch(SetNotifications([]));
        } else{
            throw new Error(response.message);
        }
       } catch (error) {
        dispatch(setLoading(false));
        message.error(error.message);
       }
    }

    useEffect(() => {
        if(notifications.length > 0) {
            readNotifications();
        }
    }, [notifications]);

    return (
        <Modal
            title="Notifications"
            open={showNotifications}
            onCancel={() => setShowNotifications(false)}
            footer={null}
            centered
            width={1000}
        >
            <div className='flex flex-col gap-5 mt-5'>
                {notifications.length > 0 ? ( <div className='flex justify-end'>
                    <span className='text-[15px] font-bold underline cursor-pointer'
                    onClick={deleteAllNotifications}>
                        Delete All
                    </span>
                </div>
                ): (<div className='flex justify-center'>
                    <span className='text-[15px] '>No Notifications</span>
                    </div>)
                }
                {notifications.map((notification) => (
                    <div
                        className='flex justify-between items-end border border-solid p-2 rounded cursor-pointer'
                        onClick={() => {
                            setShowNotifications(false);
                            navigate(notification.onClick);
                        }}
                    >
                        <div className='flex flex-col'>
                            <span className='text-md font-semibold text-gray-700'>
                                {notification.title}
                            </span>
                            <span className='text-sm'>{notification.description}</span>
                        </div>
                        <div>
                            <span className='text-sm'>
                                {moment(notification.createdAt).fromNow()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    )
}

export default Notifications