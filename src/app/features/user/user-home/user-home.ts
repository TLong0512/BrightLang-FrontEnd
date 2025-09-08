import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: 'user-home',
    standalone: true,
    templateUrl: 'user-home.html',
<<<<<<< HEAD
    imports: [RouterLinkActive]
=======
    styleUrl: 'user-home.css',
    imports: [RouterLinkActive, RouterLink]
>>>>>>> 56e4c8e427d48649344c5f2a2cf72a58d9364b80

})

export class UserHomeComponent {

}