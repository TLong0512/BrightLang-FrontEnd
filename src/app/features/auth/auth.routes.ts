import { Routes } from "@angular/router";
import { AuthComponent } from "../../shared/auth/auth";
import { LoginComponent } from "./login/login";
import { RegisterComponent } from "./register/register";
import { VerifyComponent } from "./verify/verify";
import { ForgetPassword } from "./forget-password/forget-password";
import { ResetPasswordComponent } from "./reset-password/reset-password";

export const authRoutes: Routes = [
    {
        path: '',
        component: AuthComponent,
        children: [
            {
                path: '',
                component: LoginComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            },
            {
                path: 'verify',
                component: VerifyComponent
            },
            {
                path: 'forget-password',
                component: ForgetPassword
            },
            {
                path: 'reset-password',
                component: ResetPasswordComponent
            }
        ]
    }
]