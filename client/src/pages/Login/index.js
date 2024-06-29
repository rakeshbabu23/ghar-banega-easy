import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';

import Divider from '../../components/Divider';
import { Link, useNavigate } from 'react-router-dom';
import { LoginUser } from '../../apiCalls/users';
import { useDispatch, useSelector } from 'react-redux';
import { setButtonLoading } from '../../redux/loadersSlice';
import { getAntdFormInputRules } from '../../utils/helpers';

function Login() {
  const { buttonLoading } = useSelector((state) => state.loaders);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      dispatch(setButtonLoading(true));
      const response = await LoginUser(values);
      dispatch(setButtonLoading(false));
      if (response.success) {
        localStorage.setItem("token", response.data);
        message.success(response.message);
        navigate("/");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(setButtonLoading(false));
      message.error(error.message);
    }
  };


  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);


  return (
    <div className='grid grid-cols-2'>
      <div className='bg-primary h-screen flex flex-col justify-center items-center'>
        <div>
          <h1 className='text-5xl text-white'>
            GHAR BANEGA EASY
          </h1>
          <span className='text-white mt-5'>One place to build a great home for you</span>
        </div>
      </div>
      <div className='flex justify-center items-center'>
        <div className='w-[420px]'>
          <h1 className='text-gray-700 text-2xl text-center'>LOGIN TO YOUR ACCOUNT</h1>
          <Divider />
          <Form layout='vertical'
            onFinish={onFinish}>
            <Form.Item label="Email" name="email"
              rules={getAntdFormInputRules}>
              <Input />
            </Form.Item>
            <Form.Item label="Password" name="password"
              rules={getAntdFormInputRules}>
              <Input type='password' />
            </Form.Item>

            <Button type='primary' htmlType='submit' block
              loading={buttonLoading}>
              Login</Button>

            <div className='flex justify-center mt-5'>
              <span>
                Don't have an account? <Link to='/register'>Register</Link>
              </span>
            </div>
          </Form>
        </div>
      </div>

    </div>
  )
}

export default Login