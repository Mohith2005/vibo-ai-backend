import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

export class PlayerService {
  private sound: Audio.Sound | null = null;

  async loadAndPlay(
    url: string,
    onStatusUpdate: (status: AVPlaybackStatus) => void
  ) {
    if (this.sound) {
      await this.sound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      { 
        uri: url,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      },
      { shouldPlay: true },
      onStatusUpdate
    );
    this.sound = sound;
  }

  async play() {
    if (this.sound) await this.sound.playAsync();
  }

  async pause() {
    if (this.sound) await this.sound.pauseAsync();
  }

  async setPosition(millis: number) {
    if (this.sound) await this.sound.setPositionAsync(millis);
  }

  async setVolume(volume: number) {
    if (this.sound) await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
  }

  async cleanup() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

export const playerService = new PlayerService();
