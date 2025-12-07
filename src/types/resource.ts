import { ImageObject } from '../resource/ImageObject';
import { SoundObject } from '../resource/soundObject';
import { ScenarioObject } from './scenario';

export interface DisplayedImage {
  image: ImageObject;
  pos?: { x: number; y: number };
  size: { width: number; height: number };
  look?: string;
  entry?: string;
}

export interface UsedSound {
  audio: SoundObject;
}

export interface SceneFile {
  init?: (api: any) => void;
  cleanUp?: () => void;
  scenario: ScenarioObject[];
  sceneConfig: any;
  res?: any;
  [key: string]: any;
}