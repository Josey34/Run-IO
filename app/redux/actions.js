import { LOGIN, LOGOUT, SET_USER } from './types';

export const login = (user) => ({
    type: LOGIN,
    payload: user,
});

export const logout = () => ({
    type: LOGOUT,
});

export const setUser = (user) => ({
    type: SET_USER,
    payload: user,
});
