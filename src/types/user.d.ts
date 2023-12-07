type User = {
  userId: number;
  email: string;
  password: string;
  role: 'admin' | 'moderator' | 'user';
};

export default User;
