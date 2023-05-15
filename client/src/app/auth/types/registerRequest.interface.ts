export interface LoginRequest {
  email?: string | null | undefined;
  password?: string | null | undefined;
}

export interface RegisterRequest extends LoginRequest{
    userName?: string | null | undefined;
}
