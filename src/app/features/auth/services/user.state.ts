import { Injectable } from "@angular/core";
import { BehaviorSubject, distinctUntilChanged, shareReplay } from "rxjs";

export interface MyAccountDto {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
}

@Injectable({ providedIn: 'root' })
export class UserState {
    private currentUserSubject = new BehaviorSubject<MyAccountDto | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable()
        .pipe(distinctUntilChanged(), shareReplay(1));

    _next(user: MyAccountDto | null) {
        this.currentUserSubject.next(user);
    }
}