export const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email.trim()) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return '';
};

export const validatePassword = (password: string) => {
  if (!password.trim()) return 'Password is required';
  if (password.trim().length < 6) return 'Password must be at least 6 characters';
  return '';
};
