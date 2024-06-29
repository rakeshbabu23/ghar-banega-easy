import React from 'react'
import { Form, Input, Modal, message } from 'antd'
import { useDispatch } from 'react-redux';
import { setLoading } from '../../../redux/loadersSlice';
import { AddMemberToProject } from '../../../apiCalls/projects';
import { getAntdFormInputRules } from '../../../utils/helpers';
function MemberForm({ showMemberForm, setShowMemberForm, reloadData, project }) {
    console.log(project.members);
    const formRef = React.useRef(null);
    const dispatch = useDispatch();
    const onFinish = async (values) => {
        try {
            //check if email already exist
            const emailExists = project.members.find(
                (member) => member.user.email === values.email
            );

            if (emailExists) {
                throw new Error('User is already a member of this project');
            } else {
                dispatch(setLoading(true));
                //add member
                const response = await AddMemberToProject({
                    projectId: project._id,
                    email: values.email,
                    role: values.role
                });
                dispatch(setLoading(false));
                if (response.success) {
                    message.success(response.message);
                    setShowMemberForm(false);
                    reloadData();
                } else {
                    message.error(response.message);
                }
            }

        } catch (error) {
            dispatch(setLoading(false));
            message.error(error.message);
        }
    }
    return (
        <Modal
            title='ADD MEMBER'
            open={showMemberForm}
            onCancel={() => setShowMemberForm(false)}
            centered
            okText="Add"
            onOk={() => {
                formRef.current.submit();
            }}
        >
            <Form layout='vertical' ref={formRef} onFinish={onFinish}>
                <Form.Item label="Email" name="email"
                    rules={getAntdFormInputRules}>
                    <Input placeholder='Email' />
                </Form.Item>
                <Form.Item label="Role" name="role"
                    rules={getAntdFormInputRules}>
                    <select name="" id="">
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                    </select>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default MemberForm