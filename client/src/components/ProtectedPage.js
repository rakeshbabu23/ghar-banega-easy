import { message } from 'antd';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { GetUser } from '../apiCalls/users';
import { useDispatch, useSelector } from 'react-redux';
import { SetNotifications, SetUser } from '../redux/usersSlice';
import { setLoading } from '../redux/loadersSlice';
import { GetAllNotifications } from '../apiCalls/notifications';
import { Avatar, Badge, Space } from 'antd';
import Notifications from './Notifications';

function ProtectedPage({ children }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, notifications } = useSelector((state) => state.users);
    const getUser = async () => {
        try {
            dispatch(setLoading(true));
            const response = await GetUser();
            dispatch(setLoading(false));
            if (response.success) {
                dispatch(SetUser(response.data));
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            dispatch(setLoading(false));
            message.error(error.message);
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const getNotifications = async () => {
        try {
            dispatch(setLoading(true));
            const response = await GetAllNotifications();
            dispatch(setLoading(false));
            if (response.success) {
                dispatch(SetNotifications(response.data));
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            dispatch(setLoading(false));
            message.error(error.message);
        }
    }

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
        } else {
            getUser();
        }
    }, []);

    useEffect(() => {
        if (user) {
            getNotifications();
        }
    }, [user]);

    return (
        user && <div>
            <div className='flex justify-between items-center bg-primary text-white p-5'>
                <h1 className='text-2xl cursor-pointer'
                    onClick={() => navigate("/")}>GHAR BANEGA EASY</h1>

                <div className='flex items-center bg-white px-5 py-2 rounded'>
                    <span className='text-primary cursor-pointer underline mr-2'
                        onClick={() => navigate("/profile")}>{user?.firstName}</span>
                    <Badge count={
                        notifications.filter((notification) => !notification.read).length
                    }
                    className='cursor-pointer'
                    >
                        <Avatar shape="square" size="large"
                            icon={<i className="ri-notification-line text-white  rounded-full cursor-pointer"></i>}
                            onClick={() => {
                                setShowNotifications(true);
                            }}
                        />
                    </Badge>
                    <i className="ri-logout-box-r-line ml-10 text-primary cursor-pointer"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/login");
                        }}></i>
                </div>
            </div>
            <div className='px-5 py-3'>
                {children}
            </div>

            {showNotifications && (
                <Notifications
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
               
                />
            )}

        </div>
    )
}

export default ProtectedPage