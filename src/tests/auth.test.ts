import {describe, it,expect} from 'vitest';
import authReducer, {register,login} from '../redux/auth/authReducer';
import type { AuthState } from "../redux/auth/authReducer";

const initialState: AuthState = {
  token: "",
  isAuthenticated: false,
    loading: false,
    user: null,
    error: null,
};

describe ('Auth', () => {
    

    it('should register user successfully', () => {
    

        const action = {
            type: register.fulfilled.type,
            payload: {
                token: 'mocked_token',
                isAuthenticated: true
            }
        };

        const newState = authReducer(initialState, action);
        expect(newState.token).toBe("mocked_token");
        expect(newState.isAuthenticated).toBe(true);
        
        
    });
    it('should register fail', () => {
        const action = {
            type: register.rejected.type,
            payload: 'register fail',
        
        }
        const newState = authReducer(initialState, action);
        expect(newState.error).toBe('register fail');
    })

    it('should login user successfully', () => {
        const action = {
            type: login.fulfilled.type,
            payload: 'mocked_token' 
        }
        
        
        const newState = authReducer(initialState, action);
    
        expect(newState.token).toBe('mocked_token');
        expect(newState.isAuthenticated).toBe(false); // เนื่องจาก getUserFromToken จะคืนค่า null ในการทดสอบนี้
    })

    it('should login fail', () => {
        const action = {
            type: login.rejected.type,
            payload: 'login fail'
        }
        const newState = authReducer(initialState, action);
        expect(newState.error).toBe('login fail');
    })



});