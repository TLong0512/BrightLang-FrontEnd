import { Component } from "@angular/core";
import { RouterLinkActive } from "@angular/router";

@Component({
    selector: 'user-home',
    standalone: true,
    templateUrl: 'user-home.html',
    styleUrl: 'user-home.css',
    imports: [RouterLinkActive]

})

export class UserHomeComponent{}