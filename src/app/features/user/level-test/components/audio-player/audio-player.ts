import { Component, input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-player card border-0 shadow-sm">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-3">
          <!-- Play/Pause Button -->
          <button 
            class="btn btn-primary audio-control-btn"
            (click)="toggleAudio()"
            [disabled]="!audioService.audioState().isLoaded">
            <i class="fas" [class]="audioService.audioState().isPlaying ? 'fa-pause' : 'fa-play'"></i>
          </button>

          <!-- Progress Bar -->
          <div class="flex-grow-1 progress-container">
            <div 
              class="progress audio-progress"
              (click)="onProgressClick($event)">
              <div 
                class="progress-bar bg-primary" 
                role="progressbar" 
                [style.width.%]="audioService.progress()">
              </div>
            </div>
          </div>

          <!-- Time Display -->
          <div class="time-display">
            <span class="text-muted small">
              {{ audioService.formattedCurrentTime() }} / {{ audioService.formattedDuration() }}
            </span>
          </div>

          <!-- Volume Control -->
          <div class="volume-control d-flex align-items-center gap-2">
            <i class="fas fa-volume-up text-muted"></i>
            <input 
              type="range" 
              class="form-range volume-slider" 
              min="0" 
              max="1" 
              step="0.1"
              [value]="audioService.audioState().volume"
              (input)="onVolumeChange($event)">
          </div>

          <!-- Stop Button -->
          <button 
            class="btn btn-outline-secondary audio-control-btn"
            (click)="stopAudio()"
            [disabled]="!audioService.audioState().isLoaded">
            <i class="fas fa-stop"></i>
          </button>
        </div>

        @if (!audioService.audioState().isLoaded) {
          <div class="mt-2 text-center">
            <div class="spinner-border spinner-border-sm text-primary me-2"></div>
            <span class="small text-muted">Đang tải âm thanh...</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .audio-player {
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.98);
    }

    .audio-control-btn {
      border-radius: 50%;
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      transition: all 0.3s ease;
    }

    .audio-control-btn:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .progress-container {
      position: relative;
    }

    .audio-progress {
      height: 8px;
      border-radius: 4px;
      cursor: pointer;
      background-color: #e9ecef;
    }

    .audio-progress:hover {
      height: 10px;
      transition: height 0.2s ease;
    }

    .volume-slider {
      width: 80px;
    }

    .time-display {
      min-width: 90px;
      font-family: 'Courier New', monospace;
    }
  `]
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  audioUrl = input.required<string>();
  audioService = inject(AudioService);

  async ngOnInit() {
    const url = this.audioUrl();
    if (url) {
      await this.audioService.loadAudio(url);
    }
  }

  ngOnDestroy() {
    this.audioService.destroy();
  }

  toggleAudio(): void {
    if (this.audioService.audioState().isPlaying) {
      this.audioService.pause();
    } else {
      this.audioService.play();
    }
  }

  stopAudio(): void {
    this.audioService.stop();
  }

  onProgressClick(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const duration = this.audioService.audioState().duration;
    const newTime = percentage * duration;
    
    this.audioService.seek(newTime);
  }

  onVolumeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const volume = parseFloat(target.value);
    this.audioService.setVolume(volume);
  }
}