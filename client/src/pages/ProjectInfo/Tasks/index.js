import { Button, Modal, Table, message } from 'antd';
import React, { useEffect, useState } from 'react'
import TaskForm from './TaskForm';
import { setLoading } from '../../../redux/loadersSlice';
import { DeleteTask, GetAllTasks, UpdateTask } from '../../../apiCalls/tasks';
import { useDispatch, useSelector } from 'react-redux';
import { getDateFormat } from '../../../utils/helpers';
import Divider from '../../../components/Divider';
import { AddNotification } from '../../../apiCalls/notifications';

function Tasks({ project }) {
  const [filters, setFilters] = useState({
    status: 'all',
    assignedTo: 'all',
    assignedBy: 'all',
  });
  const [showViewTask, setShowViewTask] = useState(false);
  const { user } = useSelector((state) => state.users);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [task, setTask] = useState(null);
  const dispatch = useDispatch();

  const isEmployee = project.members.find((member) => member.role === 'employee' && member.user._id === user._id);

  const getTasks = async () => {
    try {
      dispatch(setLoading(true));
      //const projectId = project._id;
      const response = await GetAllTasks({
        project: project._id,
        ...filters,
      });
      dispatch(setLoading(false));
      if (response.success) {
        setTasks(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(setLoading(false));
      message.error(error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      dispatch(setLoading(true));
      const response = await DeleteTask(id);
      dispatch(setLoading(false));
      if (response.success) {
        message.success(response.message);
        getTasks();
      } else {
        throw new Error(response.message);
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      message.error(error.message);
    }
  };


  const onStatusUpdate = async ({ task, status }) => {
    try {
      dispatch(setLoading(true));
      const response = await UpdateTask({
        _id: task._id,
        status,
      });
      if (response.success) {
        getTasks();
        await AddNotification({
          title: "Task Status Updated",
          description: `${task.name} status has been updated to ${status}`,
          user: task.assignedBy._id,
          onClick: `/project/${project._id}`,
        });

        message.success(response.message);

      } else {
        throw new Error(response.message);
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) =>
        <span
          className='underline cursor-pointer text-[14px]'
          onClick={() => {
            setTask(record);
            setShowViewTask(true);
          }}
        >
          {record.name}</span>

    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      render: (text, record) => record.assignedTo.firstName + " " + record.assignedTo.lastName,
    },
    {
      title: 'Assigned By',
      dataIndex: 'assignedBy',
      render: (text, record) => record.assignedBy.firstName + " " + record.assignedBy.lastName,
    },
    {
      title: 'Assigned On',
      dataIndex: 'createdAt',
      render: (text, record) => getDateFormat(text),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text, record) => {
        return <select value={record.status}
          onChange={(e) => onStatusUpdate({ task: record, status: e.target.value })}
          disabled={isEmployee && record.assignedTo._id !== user._id}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="closed" disabled={isEmployee}>Closed</option>
        </select>
      }
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (text, record) => {
        return (
          <div className='flex gap-2'>
            <Button type='primary' onClick={() => {
              setTask(record);
              setShowTaskForm(true);
            }}>Edit</Button>
            {!isEmployee && <Button type='primary' danger
              onClick={() => deleteTask(record._id)}>Delete</Button>}
          </div>
        )
      }

    },
  ];

  if (isEmployee) {
    columns.pop();
  }

  useEffect(() => {
    getTasks();
  }, [filters]);

  return (
    <div>
      {
        !isEmployee && (
          <div className='flex justify-end'>
            <Button type='default' onClick={() => setShowTaskForm(true)}>Add Task</Button>
          </div>
        )
      }

      <div className='flex gap-5'>
        <div>
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({
                ...filters,
                status: e.target.value,
              });
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <span>Assigned By</span>
          <select
            value={filters.assignedBy}
            onChange={(e) => {
              setFilters({
                ...filters,
                assignedBy: e.target.value,
              });
            }}
          >
            <option value="all">All</option>
            {project.members.
              filter((m) => m.role === "admin" || m.role === "owner").
              map((m) => (
                <option value={m.user._id}>
                  {m.user.firstName + " " + m.user.lastName}
                </option>
              ))
            }
          </select>
        </div>

        <div>
          <span>Assigned To</span>
          <select
            value={filters.assignedTo}
            onChange={(e) => {
              setFilters({
                ...filters,
                assignedTo: e.target.value,
              });
            }}
          >
            <option value="all">All</option>
            {project.members.
              filter((m) => m.role === "employee").
              map((m) => (
                <option value={m.user._id}>
                  {m.user.firstName + " " + m.user.lastName}
                </option>
              ))
            }
          </select>
        </div>

      </div>

      <Table columns={columns} dataSource={tasks} className='mt-5' />

      {showTaskForm && (
        <TaskForm
          showTaskForm={showTaskForm}
          setShowTaskForm={setShowTaskForm}
          project={project}
          reloadData={getTasks}
          task={task}
        />
      )}

      {showViewTask && (
        <Modal
          title="TASK DETAILS"
          open={showViewTask}
          onCancel={() => setShowViewTask(false)}
          footer={null}
          centered
          width={700}
        >
          <Divider />
          <div className='flex flex-col'>
            <span className='tetx-md text-black font-semibold'>{task.name}</span>
            <span className='text-[14px] text-gray-500'>{task.description}</span>

            <div className='flex gap-5'>
              {task.attachments.map((image) => {
                return (
                  <img
                    src={image}
                    alt=""
                    className='w-40 h-40 object-cover mt-2 p-2 border border-solid rounded border-gray-500'
                  />
                )
              })}
            </div>
          </div>
        </Modal>
      )

      }
    </div>
  );
}

export default Tasks