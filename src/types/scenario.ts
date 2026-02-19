export interface ScenarioObject {
  type?: string;
  content?: any[];
  name?: string;
  speed?: number;
  time?: number;
  wait?: number | string;
  voice?: string;
  prompt?: string;
  index?: number;
  condition?: string;
  to?: string;
  method?: string;
  get?: string;
  post?: string;
  put?: string;
  delete?: string;
  then?: any[];
  error?: any[];
  src?: string;
  mode?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  pos?: string;
  look?: string;
  entry?: string;
  sepia?: number;
  mono?: number;
  blur?: number;
  opacity?: number;
  transition?: string;
  duration?: number;
  nw?: boolean;
  sub?: boolean;
  loop?: boolean;
  play?: any;
  stop?: any;
  pause?: any;
  label?: string;
}

// Handler-specific types
export interface TextHandlerScenario {
  content?: any[];
  name?: string;
  speed?: number;
  time?: number;
  then?: any[];
  error?: any[];
}

export interface WaitHandlerScenario {
  wait?: number | string;
  time?: number;
}

export interface SayHandlerScenario {
  content?: any[];
  name?: string;
  speed?: number;
  voice?: string;
}

export interface ChoiceHandlerScenario {
  content?: any[];
  prompt?: string;
}

export interface JumpHandlerScenario {
  index: number;
}

export interface ShowHandlerScenario {
  src?: string;
  name?: string;
  mode?: 'bg' | 'cutin' | 'chara' | 'cg' | 'effect';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  pos?: string;
  look?: string;
  entry?: string;
  sepia?: number;
  mono?: number;
  blur?: number;
  opacity?: number;
  transition?: 'fade';
  duration?: number;
}

export interface HideHandlerScenario {
  name?: string;
  mode?: 'cg';
  transition?: 'fade';
  duration?: number;
}

export interface MoveToHandlerScenario {
  name: string;
  x: number;
  y: number;
  duration?: number;
}

export interface SoundHandlerScenario {
  src?: string;
  name?: string;
  mode?: 'bgm';
  play?: any;
  stop?: any;
  pause?: any;
  loop?: boolean;
}

export interface IfHandlerScenario {
  condition: string;
  content: any[];
}

export interface RouteHandlerScenario {
  to: string;
}

export interface CallHandlerScenario {
  method: string;
}

export interface HttpHandlerScenario {
  get?: string;
  post?: string;
  put?: string;
  delete?: string;
  content?: any[];
  then?: any[];
  error?: any[];
}