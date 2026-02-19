export interface EngineConfig {
  title: string;
  resolution: {
    width: number;
    height: number;
  };
}

export interface SceneConfig {
  name?: string;
  template: string;
  background: string;
  bgm: string;
  [key: string]: any;
}