import { Injectable, signal, computed } from '@angular/core';
import { AudioControls, AudioState } from '../../../../models/audio.model';

@Injectable({
  providedIn: 'root'
})
export class AudioService implements AudioControls {
  private audio: HTMLAudioElement | null = null;
  
  // Signals for reactive state management
  private readonly _audioState = signal<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    volume: 1
  });

  // Computed values
  readonly audioState = this._audioState.asReadonly();
  readonly progress = computed(() => {
    const state = this._audioState();
    return state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  });
  
  readonly formattedCurrentTime = computed(() => {
    return this.formatTime(this._audioState().currentTime);
  });
  
  readonly formattedDuration = computed(() => {
    return this.formatTime(this._audioState().duration);
  });

  async loadAudio(url: string): Promise<void> {
    try {
      if (this.audio) {
        this.stop();
        this.audio = null;
      }

      this.audio = new Audio(url);
      
      // Setup event listeners
      this.audio.addEventListener('loadedmetadata', () => {
        this.updateState({ 
          duration: this.audio?.duration || 0, 
          isLoaded: true 
        });
      });

      this.audio.addEventListener('timeupdate', () => {
        this.updateState({ 
          currentTime: this.audio?.currentTime || 0 
        });
      });

      this.audio.addEventListener('ended', () => {
        this.updateState({ 
          isPlaying: false, 
          currentTime: 0 
        });
      });

      this.audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        this.updateState({ 
          isLoaded: false,
          isPlaying: false 
        });
      });

      // Preload the audio
      this.audio.preload = 'metadata';
      await this.audio.load();
      
    } catch (error) {
      console.error('Failed to load audio:', error);
      this.updateState({ 
        isLoaded: false,
        isPlaying: false 
      });
    }
  }

  play(): void {
    if (this.audio && this._audioState().isLoaded) {
      this.audio.play()
        .then(() => {
          this.updateState({ isPlaying: true });
        })
        .catch(error => {
          console.error('Failed to play audio:', error);
        });
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.updateState({ isPlaying: false });
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.updateState({ 
        isPlaying: false, 
        currentTime: 0 
      });
    }
  }

  seek(time: number): void {
    if (this.audio && this._audioState().isLoaded) {
      this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.audio.volume = clampedVolume;
      this.updateState({ volume: clampedVolume });
    }
  }

  private updateState(partialState: Partial<AudioState>): void {
    this._audioState.update(current => ({ ...current, ...partialState }));
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  destroy(): void {
    if (this.audio) {
      this.stop();
      this.audio = null;
    }
    this._audioState.set({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoaded: false,
      volume: 1
    });
  }
}