import { Component, ViewEncapsulation } from '@angular/core';
import { LoginComponent } from '../../features/auth/login/login';
import { RegisterComponent } from '../../features/auth/register/register';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
  imports: [RouterOutlet],
  encapsulation: ViewEncapsulation.None
})

export class AuthComponent {
  leaves = ['leaf_01.png', 'leaf_02.png', 'leaf_03.png', 'leaf_04.png'];
  basePath = 'assets/images/summer/';
  files = ['bg', 'girl', 'trees'];
}