export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}