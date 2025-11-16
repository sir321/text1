/**
 * 用户信息接口
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  createTime: string;
  status: 'active' | 'inactive' | 'pending';
}

/**
 * 搜索和筛选条件接口
 */
export interface FilterOptions {
  keyword: string;
  department: string;
  status: string;
  pageSize: number;
  currentPage: number;
}