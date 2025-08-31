export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  volume: number;
}

export interface AudioControls {
  play(): void;
  pause(): void;
  stop(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
}