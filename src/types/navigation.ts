import { Script } from './script';

export type RootStackParamList = {
  Home: undefined;
  Editor: { scriptId?: string; initialContent?: string; initialTitle?: string };
  Settings: { activeTab?: 'reading' | 'look' | 'stage' | 'voice' | 'general' };
  Teleprompter: { scriptId: string };
};
