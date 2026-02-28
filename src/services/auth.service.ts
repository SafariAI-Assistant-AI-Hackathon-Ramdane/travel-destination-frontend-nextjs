import api from './api.config';
import { 
    AuthenticationRequest, 
    AuthenticationResponse, 
    RegistrationRequest,
    UserProfileResponse
} from '../types/auth.types';
import Cookies from 'js-cookie';

export const authService = {
    register: async (request: RegistrationRequest): Promise<void> => {
        await api.post('/auth/register', request);
    },

    registerForAdmin: async (request: RegistrationRequest): Promise<void> => {
        await api.post('/auth/register/for-admin', request);
    },

    authenticate: async (request: AuthenticationRequest): Promise<AuthenticationResponse> => {
        const response = await api.post<AuthenticationResponse>('/auth/authenticate', request);
        const data = response.data;
        if (data && data.token) {
            // Store token in cookie (secure way)
            Cookies.set('auth_token', data.token, { expires: 1, secure: true, sameSite: 'strict' });
        }
        return data;
    },

    activateAccount: async (token: string): Promise<void> => {
        await api.get(`/auth/activate-account`, { params: { token } });
    },

    logout: (): void => {
        Cookies.remove('auth_token');
    },

    getProfile: async (): Promise<UserProfileResponse> => {
        const response = await api.get<UserProfileResponse>('/auth/profile');
        return response.data;
    },

    isAuthenticated: (): boolean => {
        return !!Cookies.get('auth_token');
    }
};
