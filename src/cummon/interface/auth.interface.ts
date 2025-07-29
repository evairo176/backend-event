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

export interface UpdatePasswordDto {
  oldPassword: string;
  password: string;
  userId: string;
}

export interface UpdateProfileDto {
  userId: string;
  fullname: string;
  profilePicture: string;
}
