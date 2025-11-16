import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, message } from 'antd';
import SearchBar from './components/SearchBar';
import UserTable from './components/UserTable';
import { User, FilterOptions } from './types/user';
import { getUsers, saveUsers, addUser as addUserToStorage, updateUser as updateUserInStorage, deleteUser as deleteUserFromStorage } from './utils/storage';
import { generateId, deepClone } from './Tool';

const { Header, Content } = Layout;
const { Title } = Typography;

// 初始模拟数据
const generateMockData = (): User[] => {
  const departments = ['技术部', '产品部', '设计部', '市场部', '运营部'];
  const positions = ['高级工程师', '产品经理', '设计师', '市场专员', '运营专员'];
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  
  const mockUsers: User[] = [];
  const names = ['张三', '李四', '王五', '赵六', '陈七', '杨八', '刘九', '周十'];
  
  for (let i = 0; i < 20; i++) {
    mockUsers.push({
      id: generateId(),
      name: names[i % names.length] + (i >= names.length ? i : ''),
      email: `user${i + 1}@example.com`,
      phone: `138${String(i).padStart(8, '0')}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  
  return mockUsers;
};

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [displayUsers, setDisplayUsers] = useState<User[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    keyword: '',
    department: '',
    status: '',
    pageSize: 10,
    currentPage: 1
  });
  const [actionHistory, setActionHistory] = useState<Array<{ type: string; data: any }>>([]);

  // 初始化数据
  useEffect(() => {
    let storedUsers = getUsers();
    // 如果没有数据，生成模拟数据
    if (storedUsers.length === 0) {
      storedUsers = generateMockData();
      saveUsers(storedUsers);
    }
    setUsers(storedUsers);
  }, []);

  // 筛选和分页
  useEffect(() => {
    // 筛选
    let filtered = [...users];
    
    if (filterOptions.keyword) {
      const keyword = filterOptions.keyword.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.includes(keyword)
      );
    }
    
    if (filterOptions.department) {
      filtered = filtered.filter(user => user.department === filterOptions.department);
    }
    
    if (filterOptions.status) {
      filtered = filtered.filter(user => user.status === filterOptions.status);
    }
    
    setFilteredUsers(filtered);
    
    // 分页
    const startIndex = (filterOptions.currentPage - 1) * filterOptions.pageSize;
    const endIndex = startIndex + filterOptions.pageSize;
    setDisplayUsers(filtered.slice(startIndex, endIndex));
  }, [users, filterOptions]);

  // 获取所有部门
  const departments = Array.from(new Set(users.map(user => user.department)));

  // 处理筛选条件变化
  const handleFilterChange = (newOptions: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newOptions }));
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setFilterOptions(prev => ({ ...prev, currentPage: page, pageSize }));
  };

  // 添加用户
  const handleAddUser = (user: User) => {
    const newUser = deepClone(user);
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    addUserToStorage(newUser);
    
    // 记录操作历史用于撤销
    setActionHistory(prev => [...prev, { type: 'add', data: newUser }]);
    
    // 自动跳转到最后一页
    const newTotalPages = Math.ceil(updatedUsers.length / filterOptions.pageSize);
    if (filterOptions.currentPage > newTotalPages) {
      setFilterOptions(prev => ({ ...prev, currentPage: newTotalPages }));
    }
  };

  // 更新用户
  const handleUpdateUser = (updatedUser: User) => {
    const oldUser = users.find(u => u.id === updatedUser.id);
    if (oldUser) {
      const updatedUsers = users.map(user => 
        user.id === updatedUser.id ? deepClone(updatedUser) : user
      );
      setUsers(updatedUsers);
      updateUserInStorage(updatedUser.id, updatedUser);
      
      // 记录操作历史用于撤销
      setActionHistory(prev => [...prev, { type: 'update', data: { old: oldUser, new: updatedUser } }]);
    }
  };

  // 删除用户
  const handleDeleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete) {
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      deleteUserFromStorage(id);
      
      // 记录操作历史用于撤销
      setActionHistory(prev => [...prev, { type: 'delete', data: userToDelete }]);
      
      // 处理分页
      const newTotalPages = Math.ceil(updatedUsers.length / filterOptions.pageSize);
      if (filterOptions.currentPage > newTotalPages && newTotalPages > 0) {
        setFilterOptions(prev => ({ ...prev, currentPage: newTotalPages }));
      }
    }
  };

  // 撤销操作
  const handleUndo = () => {
    if (actionHistory.length === 0) {
      message.warning('没有可撤销的操作');
      return;
    }

    const lastAction = actionHistory[actionHistory.length - 1];
    let updatedUsers = [...users];

    switch (lastAction.type) {
      case 'add':
        updatedUsers = users.filter(user => user.id !== lastAction.data.id);
        deleteUserFromStorage(lastAction.data.id);
        message.success('已撤销添加操作');
        break;
      case 'update':
        updatedUsers = users.map(user => 
          user.id === lastAction.data.old.id ? deepClone(lastAction.data.old) : user
        );
        updateUserInStorage(lastAction.data.old.id, lastAction.data.old);
        message.success('已撤销更新操作');
        break;
      case 'delete':
        updatedUsers = [...users, deepClone(lastAction.data)];
        addUserToStorage(lastAction.data);
        message.success('已撤销删除操作');
        break;
    }

    setUsers(updatedUsers);
    setActionHistory(prev => prev.slice(0, -1));
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '0 24px', lineHeight: '64px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>用户数据管理中心</Title>
        </div>
      </Header>
      <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <Card
          style={{ 
            background: '#fff', 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            marginBottom: 20
          }}
          extra={
            <button
              onClick={handleUndo}
              disabled={actionHistory.length === 0}
              style={{
                padding: '6px 16px',
                backgroundColor: actionHistory.length > 0 ? '#1890ff' : '#d9d9d9',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: actionHistory.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              撤销
            </button>
          }
        >
          <SearchBar
            options={filterOptions}
            onFilterChange={handleFilterChange}
            departments={departments}
          />
          <UserTable
            users={displayUsers}
            filterOptions={filterOptions}
            total={filteredUsers.length}
            onDelete={handleDeleteUser}
            onUpdate={handleUpdateUser}
            onAdd={handleAddUser}
            onPageChange={handlePageChange}
          />
        </Card>
      </Content>
    </Layout>
  );
}

export default App;