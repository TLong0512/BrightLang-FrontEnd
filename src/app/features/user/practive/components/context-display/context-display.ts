import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Context } from '../../../../../models/topik.model';
import { AudioPlayerComponent } from '../../../level-test/components/audio-player/audio-player';

@Component({
  selector: 'app-context-display',
  standalone: true,
  imports: [CommonModule, AudioPlayerComponent],
  template: `
    <div class="context-container">
      @if (context(); as ctx) {
        @if (ctx.title) {
          <h3 class="context-title">{{ ctx.title }}</h3>
        }
        
        @if (ctx.type === 'text' || ctx.type === 'mixed') {
          @if (ctx.textContent) {
            <div class="text-content" [innerHTML]="ctx.textContent"></div>
          }
        }
        
        @if (ctx.type === 'image' || ctx.type === 'mixed') {
          @if (ctx.imageUrl) {
            <div class="image-content">
              <img [src]="ctx.imageUrl" [alt]="ctx.title || 'Context image'" class="context-image">
            </div>
          }
        }
        
        @if (ctx.type === 'audio' || ctx.type === 'mixed') {
          @if (ctx.audioUrl) {
            <div class="audio-content">
              <app-audio-player [audioUrl]="ctx.audioUrl"></app-audio-player>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .context-container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 25px;
      border-left: 4px solid #80d0c7;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .context-title {
      color: #13547a;
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0f2f1;
    }

    .text-content {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #333;
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e9ecef;
    }

    .image-content {
      margin: 20px 0;
      text-align: center;
    }

    .context-image {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border: 3px solid #80d0c7;
    }

    .audio-content {
      margin: 20px 0;
    }

    @media (max-width: 768px) {
      .context-container {
        padding: 20px;
        margin-bottom: 20px;
      }
      
      .context-title {
        font-size: 1.2rem;
      }
      
      .text-content {
        font-size: 1rem;
        padding: 15px;
      }
    }
  `]
})
export class ContextDisplayComponent {
  context = input.required<Context | null>();
}