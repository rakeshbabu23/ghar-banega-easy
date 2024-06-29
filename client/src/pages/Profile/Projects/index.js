import { Button, Table, message } from 'antd'
import React from 'react'
import ProjectForm from './ProjectForm'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../../redux/loadersSlice';
import { DeleteProject, GetAllProjects } from '../../../apiCalls/projects';
import { getDateFormat } from '../../../utils/helpers';


function Projects() {
    const [selectedProject, setSelectedProject] = React.useState(null);
    const [projects, setProjects] = React.useState([]);
    const [show, setShow] = React.useState(false);
    const { user } = useSelector(state => state.users);
    const dispatch = useDispatch();


    const getData = async () => {
        try {
            dispatch(setLoading(true));
            const response = await GetAllProjects({ owner: user._id });
            if (response.success) {
                setProjects(response.data);
            } else {
                throw new Error(response.error);
            }
            dispatch(setLoading(false));
        } catch (error) {
            message.error(error.message);
            dispatch(setLoading(false));
        }
    }

    const onDelete = async (id) => {
        try {
            dispatch(setLoading(true));
            const response = await DeleteProject(id);
            if (response.success) {
                message.success(response.message);
                getData();
            } else {
                throw new Error(response.error);
            }
            dispatch(setLoading(false));
        } catch (error) {
            message.error(error.message);
            dispatch(setLoading(false));
        }
    }

    React.useEffect(() => {
        getData();
    }, []);

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
        },
        {
            title: "Description",
            dataIndex: "description",
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text) => text.toUpperCase(),
        },
        {
            title: "Created at",
            dataIndex: "createdAt",
            render: (text) => getDateFormat(text),

        },
        {
            title: "Action",
            dataIndex: "action",
            render: (text, record) => {
                return (
                    <div className='flex gap-4'>
                        <i className='ri-delete-bin-line'
                        onClick={() => onDelete(record._id)}
                        ></i>
                        <i className='ri-pencil-line'
                            onClick={() => {
                                setSelectedProject(record);
                                setShow(true);
                            }}
                        ></i>
                    </div>
                )
            }
        }
    ];

    return (
        <div>
            <div className='flex justify-end'>
                <Button type="default"
                    onClick={() => { 
                        setSelectedProject(null);
                        setShow(true) }}
                >
                    Add Project
                </Button>
            </div>
            <Table columns={columns} dataSource={projects}
                className='mt-4' />

            {show && (
                <ProjectForm show={show} setShow={setShow} reloadData={getData} project={selectedProject} />
            )}
        </div>
    )
}

export default Projects