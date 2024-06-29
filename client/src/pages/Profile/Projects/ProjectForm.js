import { Form, Input, Modal, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../../redux/loadersSlice';
import { CreateProject, EditProject } from '../../../apiCalls/projects';


function ProjectForm({
    show, setShow, reloadData, project
}) {
    const formRef = React.useRef(null);
    const { user } = useSelector(state => state.users);
    const dispatch = useDispatch();
    const onFinish = async (values) => {
        try {
            dispatch(setLoading(true));
            let response = null;
            if (project) {
                //edit project
                values._id = project._id;
                response = await EditProject(values);
            } else {
                //create project
                values.owner = user._id;
                values.members = [
                    {
                        user: user._id,
                        role: 'owner',
                    }
                ];
                response = await CreateProject(values);
                
            }
            if (response.success) {
                message.success(response.message);
                reloadData();
                setShow(false);
            } else {
                throw new Error(response.error);
            }
            dispatch(setLoading(false));
        } catch (error) {
            dispatch(setLoading(false));
        }
    };
    return (
        <Modal
            title={project ? 'Edit Project' : 'Create Project'}
            open={show}
            onCancel={() => setShow(false)}
            centered
            width={700}
            onOk={() => {
                formRef.current.submit()
            }}
            okText="Save"
        >
            <Form layout='vertical'
                ref={formRef}
                onFinish={onFinish}
                initialValues={project}>
                <Form.Item label='Project Name' name="name">
                    <Input placeholder='Project Name' />
                </Form.Item>
                <Form.Item label='Project Description' name='description'>
                    <TextArea placeholder='Project Description' />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default ProjectForm