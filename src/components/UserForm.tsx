import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space, Modal, message } from 'antd';
import { User } from '../types/user';
import { generateId, isValidEmail, isValidPhone } from '../Tool';

interface UserFormProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (user: User) => void;
  initialValues?: Partial<User>;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  onCancel,
  onOk,
  initialValues = {},
  isEdit = false
}) => {
  const [form] = Form.useForm();

  // 部门列表
  const departments = [
    '技术部',
    '产品部',
    '设计部',
    '市场部',
    '运营部',
    '财务部',
    '人力资源部'
  ];

  // 职位列表
  const positions = [
    '高级工程师',
    '工程师',
    '初级工程师',
    '产品经理',
    '设计师',
    '市场专员',
    '运营专员',
    '财务专员',
    'HR专员'
  ];

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const userData: User = {
        id: isEdit ? (initialValues.id as string) : generateId(),
        ...values,
        createTime: isEdit ? (initialValues.createTime as string) : new Date().toISOString(),
        status: values.status || 'pending'
      };
      onOk(userData);
      form.resetFields();
    });
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      title={isEdit ? '编辑用户' : '新增用户'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {isEdit ? '保存' : '添加'}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="name"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, max: 20, message: '用户名长度在2-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { 
                validator: (_: any, value: string) => {
                  if (!value || isValidEmail(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('邮箱格式不正确'));
                }
              }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { 
                validator: (_: any, value: string) => {
                  if (!value || isValidPhone(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('手机号格式不正确'));
                }
              }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="department"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select placeholder="请选择部门">
              {departments.map(dept => (
                <Select.Option key={dept} value={dept}>{dept}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="职位"
            rules={[{ required: true, message: '请选择职位' }]}
          >
            <Select placeholder="请选择职位">
              {positions.map(pos => (
                <Select.Option key={pos} value={pos}>{pos}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">激活</Select.Option>
              <Select.Option value="inactive">未激活</Select.Option>
              <Select.Option value="pending">待审核</Select.Option>
            </Select>
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default UserForm;