export interface RegisterDto {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  identifier: string;
  password: string;
  userAgent?: string;
}
export interface ResetPasswordDto {
  password: string;
  verificationCode: string;
}
