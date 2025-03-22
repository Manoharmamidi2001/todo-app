import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Card } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUserModalVisible, setIsUserModalVisible] = useState(false);
    const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [form] = Form.useForm();
    const [taskForm] = Form.useForm();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.clear();
        message.success("Logged out successfully!");
        navigate("/");
    };

    // Fetch Users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:2110/api/user/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            console.log("🔹 Users Data:", data); // Debugging
            setUsers(data);
        } catch (error) {
            message.error("Failed to fetch users!");
        }
        setLoading(false);
    };
    
    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:2110/api/todo", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            console.log("🔹 Tasks Data:", data); // Debugging
            setTasks(data);
        } catch (error) {
            message.error("Failed to fetch tasks!");
        }
        setLoading(false);
    };    

    useEffect(() => {
        if (token) {
            fetchUsers();
            fetchTasks();
        }
    }, [token]);
    
    // Handle Create & Edit User
    const handleUserSubmit = async (values) => {
        try {
            const method = editingUser ? "PUT" : "POST";
            const url = editingUser
                ? `http://localhost:2110/api/user/${editingUser._id}`
                : "http://localhost:2110/api/user/register";
    
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(values),
            });
    
            if (!response.ok) throw new Error("Error in saving user!");
    
            message.success(editingUser ? "User updated!" : "User created!");
            
            if (editingUser) {
                setUsers(users.map(user => (user._id === editingUser._id ? { ...user, ...values } : user)));
            } else {
                fetchUsers(); // Fetch only if a new user is created
            }
    
            setIsUserModalVisible(false);
            form.resetFields();
            setEditingUser(null);
        } catch (error) {
            message.error("Operation failed!");
        }
    };    

    // Handle Assign Task
    const handleTaskSubmit = async (values) => {
        try {
            const method = editingTask ? "PUT" : "POST";
            const url = editingTask
                ? `http://localhost:2110/api/todo/${editingTask._id}`
                : "http://localhost:2110/api/todo";
    
            // Include user ID explicitly
            const payload = { ...values, userId: values.user };
    
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) throw new Error("Error in saving task!");
            message.success(editingTask ? "Task updated!" : "Task assigned!");
            fetchTasks();
            setIsTaskModalVisible(false);
            taskForm.resetFields();
            setEditingTask(null);
        } catch (error) {
            message.error("Operation failed!");
        }
    };    

    // Delete User
    const deleteUser = async (userId) => {
        try {
            await fetch(`http://localhost:2110/api/user/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("User deleted!");
            fetchUsers();
        } catch (error) {
            message.error("Failed to delete user!");
        }
    };

    // Delete Task
    const deleteTask = async (taskId) => {
        try {
            await fetch(`http://localhost:2110/api/todo/${taskId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("Task deleted!");
            fetchTasks();
        } catch (error) {
            message.error("Failed to delete task!");
        }
    };

    return (
        <Card title="Admin Dashboard" style={{ margin: "20px" }}>
            <Button type="primary" danger onClick={handleLogout} style={{ position: "absolute", top: 0, right: 0 }}>
                Logout
            </Button>
            <Button type="primary" onClick={() => setIsUserModalVisible(true)} style={{ marginBottom: 16 }}>
                Add User
            </Button>
            <Table dataSource={users} rowKey="_id" loading={loading} bordered>
                <Table.Column title="Full Name" dataIndex="fullname" key="fullname" />
                <Table.Column title="Email" dataIndex="email" key="email" />
                <Table.Column title="Role" dataIndex="role" key="role" />
                <Table.Column
                    title="Actions"
                    render={(text, record) => (
                        <>
                            <Button
                                type="link"
                                onClick={() => {
                                    setEditingUser(record);
                                    setIsUserModalVisible(true);
                                    form.setFieldsValue(record);
                                }}
                            >
                                Edit
                            </Button>
                            <Popconfirm title="Are you sure?" onConfirm={() => deleteUser(record._id)}>
                                <Button type="link" danger>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                />
            </Table>

            <Button type="primary" onClick={() => setIsTaskModalVisible(true)} style={{ margin: "16px 0" }}>
                Assign Task
            </Button>
            <Table dataSource={tasks} rowKey="_id" loading={loading} bordered>
                <Table.Column title="Title" dataIndex="title" key="title" />
                <Table.Column title="Description" dataIndex="description" key="description" />
                <Table.Column title="Priority" dataIndex="priority" key="priority" />
                <Table.Column title="Assigned To" dataIndex={["user", "fullname"]} key="user" />
                <Table.Column
                    title="Actions"
                    render={(text, record) => (
                        <>
                            <Button
                                type="link"
                                onClick={() => {
                                    setEditingTask(record);
                                    setIsTaskModalVisible(true);
                                    taskForm.setFieldsValue({
                                        ...record,
                                        user: record.user ? record.user._id : undefined, // Set user ID for the select field
                                    });
                                }}                                
                            >
                                Edit
                            </Button>
                            <Popconfirm title="Are you sure?" onConfirm={() => deleteTask(record._id)}>
                                <Button type="link" danger>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                />
                <Table.Column
                        title="Status"
                        key="status"
                        render={(text, record) => (
                            <span style={{ color: record.completed ? "green" : "red", fontWeight: "bold" }}>
                                {record.completed ? "Completed" : "Pending"}
                            </span>
                        )}
                    />
            </Table>

            {/* User Modal */}
            <Modal
                title={editingUser ? "Edit User" : "Add User"}
                open={isUserModalVisible}
                onCancel={() => {
                    setIsUserModalVisible(false);
                    form.resetFields();
                    setEditingUser(null);
                }}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleUserSubmit}>
                    <Form.Item name="fullname" label="Full Name" rules={[{ required: true, message: "Required!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: "Required!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, message: "Required!" }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true, message: "Required!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Task Modal */}
            <Modal
                title={editingTask ? "Edit Task" : "Assign Task"}
                open={isTaskModalVisible}
                onCancel={() => {
                    setIsTaskModalVisible(false);
                    taskForm.resetFields();
                    setEditingTask(null);
                }}
                onOk={() => taskForm.submit()}
            >
                <Form form={taskForm} layout="vertical" onFinish={handleTaskSubmit}>
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: "Required!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input />
                    </Form.Item>
                    <Form.Item name="priority" label="Priority">
                        <Input />
                    </Form.Item>
                    <Form.Item name="user" label="Assign To" rules={[{ required: true, message: "Required!" }]}>
                        <Select>
                            {users.map((user) => (
                                <Option key={user._id} value={user._id}>
                                    {user.fullname}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default AdminDashboard;