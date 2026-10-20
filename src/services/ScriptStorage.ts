import AsyncStorage from '@react-native-async-storage/async-storage';
import { Script } from '../types/script';

const SCRIPTS_STORAGE_KEY = '@pmptr_scripts_v1';

export const SAMPLE_SCRIPT_CONTENT = `Welcome to CueFlow, your professional offline-first teleprompter for Android.

This tool is designed to give you flawless speech delivery, whether you are recording a video presentation, addressing an online meeting, giving a keynote lecture, or practicing public speaking.

Notice how blank lines act as natural breathing spaces.
When the teleprompter reaches a blank line, it can pause automatically to allow you to emphasize key points and maintain a conversational rhythm.

Key features you can customize:
1. Adjust the scrolling speed to match your natural speaking cadence.
2. Alter text size, line height, and letter spacing for effortless readability at any distance.
3. Switch between clean light and high-contrast dark themes.
4. Activate Mirror Mode if you are using a professional beam-splitter glass rig.
5. Launch the Android Floating Teleprompter overlay so you can read your script while using any camera or video conferencing app!
6. Enable Voice Follow to let speech recognition track your pace in real time.

Speak with confidence, clarity, and authority.
You are now ready to deliver your presentation!`;

export const HINDI_SAMPLE_SCRIPT_CONTENT = `CueFlow टेलीप्रॉम्प्टर में आपका स्वागत है।

यह आपका व्यक्तिगत ऑफ़लाइन टेलीप्रॉम्प्टर है, जो आपको वीडियो रिकॉर्डिंग, ऑनलाइन मीटिंग या मंच पर आत्मविश्वास के साथ बोलने में मदद करता है।

ध्यान दें कि खाली पंक्तियाँ बोलने में स्वाभाविक ठहराव (pause) का काम करती हैं।
जब टेलीप्रॉम्प्टर किसी खाली पंक्ति पर पहुँचता है, तो यह कुछ पलों के लिए रुक जाता है ताकि आप सांस ले सकें।

आप जो सुविधाएँ बदल सकते हैं:
१. अपनी बोलने की गति के अनुसार स्क्रॉलिंग स्पीड सेट करें।
२. टेक्स्ट का आकार और लाइनों के बीच की दूरी अपनी सुविधा से तय करें।
३. दिन और रात के लिए लाइट या डार्क थीम चुनें।
४. फ़्लोटिंग टेलीप्रॉम्प्टर से किसी भी कैमरा ऐप के ऊपर अपनी स्क्रिप्ट पढ़ें।
५. वॉइस फॉलो चालू करें - यह आपकी आवाज़ सुनकर अपने आप स्क्रॉल करेगा!

पूरे आत्मविश्वास और स्पष्टता के साथ बोलें।
आपकी प्रस्तुति शानदार रहेगी!`;

export const SAMPLE_SCRIPT: Script = {
  id: 'sample-script-welcome',
  title: 'Welcome to CueFlow',
  content: SAMPLE_SCRIPT_CONTENT,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  lastOpenedAt: 1700000000000,
  scrollPosition: 0,
};

export const HINDI_SAMPLE_SCRIPT: Script = {
  id: 'sample-script-hindi',
  title: 'CueFlow में आपका स्वागत है (हिंदी)',
  content: HINDI_SAMPLE_SCRIPT_CONTENT,
  createdAt: 1700000000001,
  updatedAt: 1700000000001,
  lastOpenedAt: 1700000000001,
  scrollPosition: 0,
};

export class ScriptStorage {
  private static cachedScripts: Script[] | null = null;

  static async initialize(): Promise<Script[]> {
    try {
      const data = await AsyncStorage.getItem(SCRIPTS_STORAGE_KEY);
      if (!data) {
        // First run: save both English and Hindi sample scripts
        const initialList = [SAMPLE_SCRIPT, HINDI_SAMPLE_SCRIPT];
        await AsyncStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(initialList));
        this.cachedScripts = initialList;
        return initialList;
      }
      const parsed: Script[] = JSON.parse(data);
      // Ensure Hindi script is also present for existing installs
      if (!parsed.some(s => s.id === HINDI_SAMPLE_SCRIPT.id || s.title.includes('हिंदी'))) {
        parsed.push(HINDI_SAMPLE_SCRIPT);
        await AsyncStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(parsed));
      }
      this.cachedScripts = parsed;
      return parsed;
    } catch (err) {
      console.error('[ScriptStorage] initialize error:', err);
      return [SAMPLE_SCRIPT, HINDI_SAMPLE_SCRIPT];
    }
  }

  static async getAll(): Promise<Script[]> {
    if (this.cachedScripts) {
      return [...this.cachedScripts].sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return this.initialize();
  }

  static async getById(id: string): Promise<Script | null> {
    const list = await this.getAll();
    return list.find(s => s.id === id) || null;
  }

  static async save(script: Script): Promise<Script> {
    const list = await this.getAll();
    const existingIndex = list.findIndex(s => s.id === script.id);

    const updatedScript: Script = {
      ...script,
      updatedAt: Date.now(),
    };

    let newList: Script[];
    if (existingIndex >= 0) {
      newList = [...list];
      newList[existingIndex] = updatedScript;
    } else {
      newList = [updatedScript, ...list];
    }

    this.cachedScripts = newList;
    await AsyncStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(newList));
    return updatedScript;
  }

  static async create(title: string, content: string): Promise<Script> {
    const newScript: Script = {
      id: `script_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: title.trim() || 'Untitled Script',
      content: content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      scrollPosition: 0,
    };

    return this.save(newScript);
  }

  static async update(id: string, updates: Partial<Omit<Script, 'id' | 'createdAt'>>): Promise<Script | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated: Script = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    return this.save(updated);
  }

  static async delete(id: string): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length === list.length) {
      return false; // Not found
    }

    this.cachedScripts = filtered;
    await AsyncStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  static async duplicate(id: string): Promise<Script | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const duplicated: Script = {
      ...existing,
      id: `script_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: `${existing.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      scrollPosition: 0,
    };

    return this.save(duplicated);
  }

  static async markOpened(id: string): Promise<void> {
    await this.update(id, { lastOpenedAt: Date.now() });
  }

  static async updateScrollPosition(id: string, scrollPosition: number): Promise<void> {
    await this.update(id, { scrollPosition });
  }

  static async resetSampleScript(): Promise<Script> {
    await this.save(HINDI_SAMPLE_SCRIPT);
    return this.save(SAMPLE_SCRIPT);
  }
}
