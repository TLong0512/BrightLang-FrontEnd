import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// import standalone header/footer
import { UserHeaderComponent } from '../../../shared/user/header/header';
import { UserFooterComponent } from '../../../shared/user/footer/footer';

@Component({
  selector: 'app-home-page',
  imports: [
    FormsModule,
    RouterModule,
    UserHeaderComponent,
    UserFooterComponent,
    // ... các imports khác
  ],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.scss']
})
export class HomePageComponent {
  isCollapsed = true;
  activeTab = 'topik1';
  searchKeyword = '';

  startLearning() {
    console.log('Starting learning with email:', this.searchKeyword);
  }
}
