import React, { useState } from "react";
import { Form, Input, Button, Card, message, Switch } from "antd";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            if (!values.email || !values.password) {
                throw new Error("Please enter both email and password!");
            }
            
            const response = await fetch("http://localhost:2110/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const data = await response.json();

            if (!response.ok) {
                alert("Invalid credentials! Please try again.");
                throw new Error(data.message || "Invalid email or password!");
            }

            if ((isAdmin && data.user.role !== "admin") || (!isAdmin && data.user.role !== "user")) {
                alert("Unauthorized! Please login with the correct role.");
                throw new Error("Unauthorized login attempt!");
            }

            localStorage.setItem("token", data.user.token);
            localStorage.setItem("role", data.user.role);

            message.success("Login successful!");
            if (data.user.role === "admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/user-dashboard");
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Login" style={{ width: 400, margin: "100px auto" }}>
            <Switch
                checked={isAdmin}
                onChange={() => setIsAdmin(!isAdmin)}
                checkedChildren="Admin Login"
                unCheckedChildren="User Login"
                style={{ marginBottom: 16 }}
            />
            <Form layout="vertical" onFinish={handleLogin}>
                <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email!" }]}> 
                    <Input />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password!" }]}> 
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        {isAdmin ? "Login as Admin" : "Login as User"}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default Login;