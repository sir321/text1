import React from 'react';
import { Input, Select, Row, Col, Space } from 'antd';
import { FilterOptions } from '../types/user';
import { debounce } from '../Tool';

const { Search } = Input;

interface SearchBarProps {
  options: FilterOptions;
  onFilterChange: (options: Partial<FilterOptions>) => void;
  departments: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ options, onFilterChange, departments }) => {
  // 使用防抖优化搜索输入
  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => {
      onFilterChange({ keyword: value, currentPage: 1 });
    }, 300),
    [onFilterChange]
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  return (
    <Row gutter={16} style={{ marginBottom: 20, alignItems: 'flex-end' }}>
      <Col span={8}>
        <Search
          placeholder="搜索用户名/邮箱/手机号"
          allowClear
          enterButton="搜索"
          size="middle"
          onSearch={handleSearch}
          onChange={(e) => debouncedSearch(e.target.value)}
          defaultValue={options.keyword}
        />
      </Col>
      <Col span={8}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <span>部门筛选</span>
          <Select
            allowClear
            placeholder="选择部门"
            style={{ width: '100%' }}
            value={options.department}
            onChange={(value) => onFilterChange({ department: value || '', currentPage: 1 })}
            options={departments.map(dept => ({ label: dept, value: dept }))}
          />
        </Space>
      </Col>
      <Col span={8}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <span>状态筛选</span>
          <Select
            allowClear
            placeholder="选择状态"
            style={{ width: '100%' }}
            value={options.status}
            onChange={(value) => onFilterChange({ status: value || '', currentPage: 1 })}
            options={[
              { label: '激活', value: 'active' },
              { label: '未激活', value: 'inactive' },
              { label: '待审核', value: 'pending' }
            ]}
          />
        </Space>
      </Col>
    </Row>
  );
};

export default SearchBar;