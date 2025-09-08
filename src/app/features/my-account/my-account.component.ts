import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { Location } from "@angular/common";

@Component({
    selector: 'app-my-account',
    template: `
    @defer(when user()) {
        <h3>Your account information:</h3>
        <p>Id: {{ user()!.id }}</p>
        <p>Fullname: {{ user()!.fullName }}</p>
        <p>Email: {{ user()!.email }}</p>
        <p>
            Roles:
            @for(role of user()!.roles; track $index) {
            <span>{{ role }}</span>
            }
        </p>
        <a class="btn btn-warning" [routerLink]="['update-account']">Edit account</a>
        <a class="btn btn-danger" [routerLink]="['change-password']">Change password</a>
        <a (click)="goBack()" class="btn btn-secondary">Go back</a>
    } @placeholder {
        <p>Loading...</p>
    } @error {
        <p>Couldn't load your account information.</p>
    }
`,
    imports: [RouterLink]
})
export class MyAccountComponent {

    private readonly location = inject(Location);
    goBack() { this.location.back() } 

    private readonly authService = inject(AuthService);
    protected readonly user$ = this.authService.myAccountMe();
    protected readonly user = toSignal(this.user$);
}