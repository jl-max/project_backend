export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserData = Omit<User, 'id'>;

export type UpdateUserData = Partial<Omit<User, 'id'>>;
