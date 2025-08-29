import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'home-page',
    standalone: true,
    templateUrl: './home-page.html',
    styleUrl: './home-page.css',
    imports: [RouterLink]
})

export class HomePageComponent{}