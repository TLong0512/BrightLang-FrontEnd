import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { UserHeaderComponent } from '../../shared/user/header/header';
import { UserFooterComponent } from '../../shared/user/footer/footer';


@Component({
  selector: 'app-user',
  imports: [ RouterModule, UserFooterComponent, UserHeaderComponent
    ],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})
export class UserComponent {

}
