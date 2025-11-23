declare module 'react-native-immersive-mode' {
  interface ImmersiveMode {
    fullLayout(enable: boolean): Promise<void>;
    setBarMode(mode: 'Normal' | 'Full' | 'FullSticky' | 'Bottom' | 'BottomSticky'): Promise<void>;
    setBarTranslucent(translucent: boolean): Promise<void>;
    setBarColor(color: string): Promise<void>;
    setBarStyle(style: 'Light' | 'Dark'): Promise<void>;
    addEventListener(event: string, handler: () => void): void;
    removeEventListener(event: string, handler: () => void): void;
  }
  
  const ImmersiveMode: ImmersiveMode;
  export default ImmersiveMode;
}