import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { UserHeaderComponent } from '../../../shared/user/header/header';
import { UserFooterComponent } from '../../../shared/user/footer/footer';

@Component({
  selector: 'app-vocabulary',
  imports: [ RouterModule, UserHeaderComponent, UserFooterComponent
    ],
  templateUrl: '../home.html',
  styleUrls: [
    // '../../../assets/css/bootstrap.min.css',
    // '../../../assets/css/bootstrap-icons.css',
    // '../../../assets/css/templatemo-topic-listing.css'
  ]
})
export class VocabComponent  {
ngAfterViewInit() {
    // Load JS chỉ khi HomeComponent được render
    this.loadScript('assets/js/jquery.min.js');
    this.loadScript('assets/js/bootstrap.bundle.min.js');
    this.loadScript('assets/js/jquery.sticky.js');
    // this.loadScript('assets/js/click-scroll.js');
    this.loadScript('assets/js/custom.js');
    }
    private loadScript(path: string) {
        const script = document.createElement('script');
        script.src = path;
        script.async = false;
        document.body.appendChild(script);
    }
   
}
