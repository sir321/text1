import React from 'react';
import { Table, Button, Space, Popconfirm, Tag, message, ColumnsType } from 'antd';
import { User, FilterOptions } from '../types/user';
import { formatDate } from '../Tool';
import UserForm from './UserForm';

interface UserTableProps {
  users: User[];
  filterOptions: FilterOptions;
  total: number;
  onDelete: (id: string) => void;
  onUpdate: (user: User) => void;
  onAdd: (user: User) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  filterOptions,
  total,
  onDelete,
  onUpdate,
  onAdd,
  onPageChange
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  // 状态标签颜色映射
  const statusColorMap: Record<string, string> = {
    active: 'success',
    inactive: 'default',
    pending: 'warning'
  };

  // 状态标签文本映射
  const statusTextMap: Record<string, string> = {
    active: '激活',
    inactive: '未激活',
    pending: '待审核'
  };

  const showAddModal = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  const showEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    message.success('删除成功');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const handleOk = (user: User) => {
    if (editingUser) {
      onUpdate(user);
      message.success('更新成功');
    } else {
      onAdd(user);
      message.success('添加成功');
    }
    setIsModalVisible(false);
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: User, b: User) => a.name.localeCompare(b.name)
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: '技术部', value: '技术部' },
        { text: '产品部', value: '产品部' },
        { text: '设计部', value: '设计部' }
      ],
      onFilter: (value: string, record: User) => {
        return String(record.department) === String(value);
      }
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => formatDate(time),
      sorter: (a: User, b: User) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>
          {statusTextMap[status]}
        </Tag>
      ),
      filters: [
        { text: '激活', value: 'active' },
        { text: '未激活', value: 'inactive' },
        { text: '待审核', value: 'pending' }
      ],
      onFilter: (value: string, record: User) => {
        return String(record.status) === String(value);
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: User) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 20, textAlign: 'right' }}>
        <Button type="primary" onClick={showAddModal}>
          新增用户
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{
          current: filterOptions.currentPage,
          pageSize: filterOptions.pageSize,
          total: total,
          onChange: onPageChange,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="middle"
        scroll={{ x: 1200 }}
      />
      <UserForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
        initialValues={editingUser || {}}
        isEdit={!!editingUser}
      />
    </div>
  );
};

export default UserTable;