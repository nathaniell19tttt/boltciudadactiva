// Transient in-memory store for data needed between registration steps.
// Cleared after successful profile creation.
type Role = 'trabajador' | 'empresa';

const store = {
  email: '',
  password: '',
  role: 'trabajador' as Role,
};

export const setRegistrationData = (data: { email?: string; password?: string; role?: Role }) => {
  if (data.email !== undefined) store.email = data.email;
  if (data.password !== undefined) store.password = data.password;
  if (data.role !== undefined) store.role = data.role;
};

export const getRegistrationData = () => ({ ...store });

export const clearRegistrationData = () => {
  store.email = '';
  store.password = '';
  store.role = 'trabajador';
};
