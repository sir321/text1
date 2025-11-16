import { User } from '../types/user';
import { getStorage, setStorage } from '../Tool';

const USER_STORAGE_KEY = 'user_management_users';

/**
 * 获取所有用户数据
 * @returns 用户列表
 */
export const getUsers = (): User[] => {
  return getStorage<User[]>(USER_STORAGE_KEY, []);
};

/**
 * 保存用户数据
 * @param users 用户列表
 */
export const saveUsers = (users: User[]): void => {
  setStorage(USER_STORAGE_KEY, users);
};

/**
 * 添加新用户
 * @param user 新用户信息
 */
export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

/**
 * 更新用户信息
 * @param id 用户ID
 * @param updatedUser 更新后的用户信息
 * @returns 是否更新成功
 */
export const updateUser = (id: string, updatedUser: Partial<User>): boolean => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    saveUsers(users);
    return true;
  }
  return false;
};

/**
 * 删除用户
 * @param id 用户ID
 * @returns 是否删除成功
 */
export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const newUsers = users.filter(user => user.id !== id);
  if (newUsers.length !== users.length) {
    saveUsers(newUsers);
    return true;
  }
  return false;
};