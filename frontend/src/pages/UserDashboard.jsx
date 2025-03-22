import React, { useEffect, useState } from "react";
import { Table, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const token = localStorage.getItem("token");

    const handleLogout = () => {
            localStorage.clear();
            message.success("Logged out successfully!");
            navigate("/");
        };

    // Fetch User's Tasks
    const fetchUserTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:2110/api/todo/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            console.log("🔹 User Tasks Data:", data);
            setTasks(data);
        } catch (error) {
            message.error("Failed to fetch tasks!");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token) {
            fetchUserTasks();
        }
    }, [token]);

    // Mark Task as Completed
    const completeTask = async (taskId) => {
      try {
          const response = await fetch(`http://localhost:2110/api/todo/${taskId}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ completed: true }), // ✅ Update status
          });
  
          if (!response.ok) throw new Error("Failed to complete task!");
  
          message.success("Task marked as completed!");
          fetchUserTasks(); // Refresh the task list
      } catch (error) {
          message.error(error.message);
      }
  };
  

    return (
        <Card title="User Dashboard" style={{ margin: "20px" }}>
          <Button type="primary" danger onClick={handleLogout} style={{ position: "absolute", top: 0, right: 0 }}>
            Logout
          </Button>
            <Table dataSource={tasks} rowKey="_id" loading={loading} bordered>
                <Table.Column title="Title" dataIndex="title" key="title" />
                <Table.Column title="Description" dataIndex="description" key="description" />
                <Table.Column title="Priority" dataIndex="priority" key="priority" />
                <Table.Column
                    title="Status"
                    dataIndex="completed"
                    key="completed"
                    render={(completed) => (completed ? "Completed ✅" : "Pending ⏳")}
                />
                <Table.Column
                    title="Actions"
                    render={(text, record) =>
                        record.status !== "Completed" && (
                            <Button type="link" onClick={() => completeTask(record._id)}>
                                Mark as Completed
                            </Button>
                        )
                    }
                />
            </Table>
        </Card>
    );
};

export default UserDashboard;