export interface ResetPasswordDto {
    Email: string,
    VerificationCode: string,
    NewPassword: string,
    ConfirmNewPassword: string
}
