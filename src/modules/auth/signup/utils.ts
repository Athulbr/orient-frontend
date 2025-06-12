export const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email.trim()) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return '';
};
export const validatePassword = (password: string) => {
  if (!password.trim()) return 'Password is required';
  return '';
};
export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword.trim()) return 'Confirm Password is required';
  if (password !== confirmPassword) return 'Password and Confirm Password do not match';
  return '';
};
export const validateFirstName = (password: string) => {
  if (!password) return 'Name is required';
  return '';
};
export const validateLastName = (password: string) => {
  if (!password) return 'Name is required';
  return '';
};
