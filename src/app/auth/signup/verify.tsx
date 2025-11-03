"use client";
import React from "react";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  notification,
  Row,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";

const Verify = (props: any) => {
  const { id } = props;

  const router = useRouter();

  const onFinish = async (values: any) => {
    const { id, codeActive } = values;
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check-code`,
      method: "POST",
      body: {
        id,
        codeActive,
      },
    });
    if (res?.data) {
      message.success("Your account is activated.");
      router.push(`/auth/login`);
    } else {
      notification.error({
        message: "Verify error",
        description: res?.message,
      });
    }
  };

  return (
    <Row justify={"center"} style={{ marginTop: "30px" }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset
          style={{
            padding: "15px",
            margin: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <legend>Active your account</legend>
          <Form
            name="basic"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item label="Id" name="id" initialValue={id} hidden>
              <Input disabled />
            </Form.Item>
            <div>Code active sent to your email. Please check your email.</div>
            <Divider />

            <Form.Item
              label="Code"
              name="codeActive"
              rules={[
                {
                  required: true,
                  message: "Please input your code!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <Link href={"/"}>
            <ArrowLeftOutlined /> Go to homepage
          </Link>
          <Divider />
          <div style={{ textAlign: "center" }}>
            Already have an account? <Link href={"/auth/login"}>Log in</Link>
          </div>
        </fieldset>
      </Col>
    </Row>
  );
};

export default Verify;
