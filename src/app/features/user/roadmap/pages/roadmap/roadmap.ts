import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-roadmap',
  templateUrl: './roadmap.html',
  styleUrls: ['./roadmap.css']
})
export class RoadmapComponent implements OnInit, OnDestroy {

  private scriptElement!: HTMLScriptElement;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // chỉ chạy khi render trên browser
      this.scriptElement = document.createElement('script');
      this.scriptElement.src = 'assets/js/script.js';   // đúng path khi build Angular
      this.scriptElement.async = true;
      document.body.appendChild(this.scriptElement);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.scriptElement) {
      document.body.removeChild(this.scriptElement);
    }
  }
}
