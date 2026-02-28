export interface AuthenticationResponse {
    token?: string;
}

export interface RegistrationRequest {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

export interface AuthenticationRequest {
    email: string;
    password: string;
}

export interface UserProfileResponse {
    id?: number;
    email: string;
    firstname: string;
    lastname: string;
    enabled: boolean;
    accountLocked: boolean;
    roles: string[];
    createdAt: string;
    updatedAt: string | null;
}
