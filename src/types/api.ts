import {
  TextHandlerScenario,
  ChoiceHandlerScenario,
  ShowHandlerScenario,
  HideHandlerScenario,
  JumpHandlerScenario,
  SoundHandlerScenario,
  SayHandlerScenario,
  IfHandlerScenario,
  CallHandlerScenario,
  MoveToHandlerScenario,
  RouteHandlerScenario,
  WaitHandlerScenario,
  ScenarioObject
} from './scenario';

export interface CommandList {
  text: (scenarioObject: TextHandlerScenario | string) => Promise<void>;
  choice: (scenarioObject: ChoiceHandlerScenario) => Promise<void>;
  show: (scenarioObject: ShowHandlerScenario) => Promise<void>;
  newpage: () => void;
  hide: (scenarioObject: HideHandlerScenario) => Promise<void>;
  jump: (scenarioObject: JumpHandlerScenario) => void;
  sound: (scenarioObject: SoundHandlerScenario) => Promise<void>;
  say: (scenarioObject: SayHandlerScenario) => Promise<void>;
  if: (scenarioObject: IfHandlerScenario) => Promise<void>;
  call: (scenarioObject: CallHandlerScenario) => void;
  moveto: (scenarioObject: MoveToHandlerScenario) => Promise<void>;
  route: (scenarioObject: RouteHandlerScenario) => Promise<void>;
  wait: (scenarioObject: WaitHandlerScenario) => Promise<void>;
}

export interface CenterPoint {
  x: number;
  y: number;
}

export interface ChoiceResult {
  selectId: any;
  onSelect?: ScenarioObject[];
}