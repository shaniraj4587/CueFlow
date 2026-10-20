import { ScriptStorage, SAMPLE_SCRIPT } from '../src/services/ScriptStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('ScriptStorage Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('initializes with the sample script on first run', async () => {
    const scripts = await ScriptStorage.initialize();
    expect(scripts.length).toBeGreaterThanOrEqual(1);
    expect(scripts[0].title).toBe(SAMPLE_SCRIPT.title);
  });

  it('creates and retrieves a new script', async () => {
    const created = await ScriptStorage.create('Keynote 2026', 'Opening remarks and welcome.');
    expect(created.id).toBeDefined();
    expect(created.title).toBe('Keynote 2026');
    expect(created.content).toBe('Opening remarks and welcome.');

    const retrieved = await ScriptStorage.getById(created.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Keynote 2026');
  });

  it('updates an existing script title and content', async () => {
    const created = await ScriptStorage.create('Initial Title', 'Initial Content');
    const updated = await ScriptStorage.update(created.id, {
      title: 'Updated Title',
      content: 'Updated Content',
    });

    expect(updated?.title).toBe('Updated Title');
    expect(updated?.content).toBe('Updated Content');

    const fresh = await ScriptStorage.getById(created.id);
    expect(fresh?.title).toBe('Updated Title');
  });

  it('duplicates an existing script with a (Copy) suffix', async () => {
    const original = await ScriptStorage.create('Original Script', 'Original body text.');
    const duplicated = await ScriptStorage.duplicate(original.id);

    expect(duplicated).not.toBeNull();
    expect(duplicated?.id).not.toBe(original.id);
    expect(duplicated?.title).toBe('Original Script (Copy)');
    expect(duplicated?.content).toBe('Original body text.');
  });

  it('deletes a script and returns false for nonexistent id', async () => {
    const script = await ScriptStorage.create('To Delete', 'Goodbye text.');
    const deleteResult = await ScriptStorage.delete(script.id);
    expect(deleteResult).toBe(true);

    const check = await ScriptStorage.getById(script.id);
    expect(check).toBeNull();

    const secondDelete = await ScriptStorage.delete('nonexistent-id');
    expect(secondDelete).toBe(false);
  });

  it('updates scroll position without overwriting other properties', async () => {
    const script = await ScriptStorage.create('Scroll Test', 'Long speech content...');
    await ScriptStorage.updateScrollPosition(script.id, 450);

    const refreshed = await ScriptStorage.getById(script.id);
    expect(refreshed?.scrollPosition).toBe(450);
    expect(refreshed?.title).toBe('Scroll Test');
  });
});
