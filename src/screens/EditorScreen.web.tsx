import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScriptStorage, SAMPLE_SCRIPT_CONTENT, HINDI_SAMPLE_SCRIPT_CONTENT } from '../services/ScriptStorage';
import { FileImportService } from '../services/FileImportService';
import { calculateScriptStats } from '../types/script';
import { useSettings } from '../hooks/useSettings';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Editor'>;

export const EditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { scriptId, initialTitle, initialContent } = route.params || {};
  const { colors, t } = useSettings();

  const [title, setTitle] = useState<string>(initialTitle || '');
  const [content, setContent] = useState<string>(initialContent || '');
  const [isMonospace, setIsMonospace] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [currentScriptId, setCurrentScriptId] = useState<string | undefined>(scriptId);
  const [saveStatusText, setSaveStatusText] = useState<string>('Saved');

  const autosaveTimerRef = useRef<any>(null);
  const titleRef = useRef<string>(title);
  const contentRef = useRef<string>(content);
  const currentScriptIdRef = useRef<string | undefined>(currentScriptId);

  titleRef.current = title;
  contentRef.current = content;
  currentScriptIdRef.current = currentScriptId;

  // Load existing script if scriptId was provided
  useEffect(() => {
    if (scriptId) {
      ScriptStorage.getById(scriptId).then(script => {
        if (script) {
          setTitle(script.title);
          setContent(script.content);
          setIsSaved(true);
          setSaveStatusText('Saved');
        }
      });
    }
  }, [scriptId]);

  // Compute stats dynamically
  const stats = calculateScriptStats(content);

  // Core save function
  const saveScript = useCallback(async () => {
    const curTitle = titleRef.current.trim() || 'Untitled Script';
    const curContent = contentRef.current;
    setSaveStatusText('Saving...');

    try {
      if (currentScriptIdRef.current) {
        await ScriptStorage.update(currentScriptIdRef.current, {
          title: curTitle,
          content: curContent,
        });
      } else {
        const created = await ScriptStorage.create(curTitle, curContent);
        setCurrentScriptId(created.id);
        currentScriptIdRef.current = created.id;
      }
      setIsSaved(true);
      setSaveStatusText('✓ Saved');
      setTimeout(() => setSaveStatusText('Saved'), 2000);
    } catch (e) {
      console.error('[EditorScreen.web] save error:', e);
      setSaveStatusText('Error saving');
    }
  }, []);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveScript();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveScript]);

  const handleContentChange = (text: string) => {
    setContent(text);
    contentRef.current = text;
    setIsSaved(false);
    setSaveStatusText('Unsaved');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      saveScript();
    }, 800);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    titleRef.current = text;
    setIsSaved(false);
    setSaveStatusText('Unsaved');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      saveScript();
    }, 800);
  };

  const handleBack = async () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    // Flush save before exiting editor
    if (title.trim() || content.trim()) {
      await saveScript();
    }
    navigation.goBack();
  };

  const handlePrompt = async () => {
    await saveScript();
    const idToOpen = currentScriptIdRef.current;
    if (idToOpen) {
      navigation.navigate('Teleprompter', { scriptId: idToOpen });
    }
  };

  const handleImportDocument = async () => {
    try {
      const imported = await FileImportService.importTextDocument();
      if (imported) {
        setTitle(imported.fileName.replace(/\.[^/.]+$/, ''));
        setContent(imported.content);
        setIsSaved(false);
        setSaveStatusText('Unsaved');
        setTimeout(() => saveScript(), 200);
      }
    } catch (err) {
      console.error('Import error:', err);
    }
  };

  const handleExportDocument = async () => {
    await saveScript();
    const safeTitle = title.trim() || 'script';
    await FileImportService.exportTextDocument(safeTitle, content);
  };

  const { width } = useWindowDimensions();
  const maxContentWidth = width >= 600 ? Math.min(width * 0.94, 1020) : '100%';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.headerInner, { maxWidth: maxContentWidth }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backBtn, { backgroundColor: colors.surface }]}
            accessibilityLabel="Back to Scripts"
          >
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={saveScript}
              style={[
                styles.saveStatusBadge,
                { backgroundColor: isSaved ? colors.surface : colors.primaryLight },
              ]}
              accessibilityLabel="Save Script"
            >
              <Text
                style={[
                  styles.saveStatusText,
                  { color: isSaved ? colors.textMuted : colors.primary, fontWeight: '700' },
                ]}
              >
                💾 {saveStatusText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePrompt}
              style={[styles.promptBtn, { backgroundColor: colors.primary }]}
              accessibilityLabel="Start Prompting"
            >
              <Text style={styles.promptBtnText}>{t.prompt || 'Prompt ▶'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}>
          {/* Title Input */}
          <View style={[styles.titleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={title}
              onChangeText={handleTitleChange}
              placeholder={t.scriptTitlePlaceholder || 'Script Title...'}
              placeholderTextColor={colors.textMuted}
              style={[styles.titleInput, { color: colors.textPrimary }]}
              maxLength={120}
            />
          </View>

          {/* Quick Toolbar */}
          <View style={styles.toolbarRow}>
            <TouchableOpacity
              onPress={handleImportDocument}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>📂 Import File</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportDocument}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>💾 Export</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsMonospace(!isMonospace)}
              style={[
                styles.toolBtn,
                {
                  backgroundColor: isMonospace ? colors.primary : colors.surface,
                  borderColor: isMonospace ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.toolBtnText, { color: isMonospace ? '#FFFFFF' : colors.textPrimary }]}>
                🔤 Mono
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setContent(HINDI_SAMPLE_SCRIPT_CONTENT);
                setIsSaved(false);
                setTimeout(() => saveScript(), 200);
              }}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>🇮🇳 हिंदी नमूना</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setContent(SAMPLE_SCRIPT_CONTENT);
                setIsSaved(false);
                setTimeout(() => saveScript(), 200);
              }}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>📑 English Sample</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowClearConfirm(true)}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.toolBtnText, { color: colors.error }]}>🗑 Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statItem, { color: colors.textSecondary }]}>
              Words: <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.wordCount}</Text>
            </Text>
            <Text style={[styles.statDivider, { color: colors.textMuted }]}>|</Text>
            <Text style={[styles.statItem, { color: colors.textSecondary }]}>
              Chars: <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.charCount}</Text>
            </Text>
            <Text style={[styles.statDivider, { color: colors.textMuted }]}>|</Text>
            <Text style={[styles.statItem, { color: colors.textSecondary }]}>
              Est. Reading:{' '}
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.estimatedDurationText}</Text>
            </Text>
            <Text style={[styles.statDivider, { color: colors.textMuted }]}>|</Text>
            <Text style={[styles.statItem, { color: colors.textMuted, fontSize: 11 }]}>
              Shortcut: Ctrl+S to save
            </Text>
          </View>

          {/* Large Script Body Content Editor */}
          <View
            style={[
              styles.contentCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              value={content}
              onChangeText={handleContentChange}
              placeholder={t.scriptBodyPlaceholder || 'Type or paste your script here...'}
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              style={[
                styles.contentInput,
                {
                  color: colors.textPrimary,
                  fontFamily: isMonospace ? 'monospace' : undefined,
                },
              ]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Dialog for Clearing Script */}
      <ConfirmDialog
        visible={showClearConfirm}
        title={t.clearConfirmTitle || 'Clear Script Content?'}
        message={t.clearConfirmMsg || 'Are you sure you want to delete all text in this script?'}
        confirmLabel={t.clear || 'Clear'}
        isDestructive
        colors={colors}
        onConfirm={() => {
          setContent('');
          setIsSaved(false);
          setShowClearConfirm(false);
          saveScript();
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  backBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  backBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveStatusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
  } as any,
  saveStatusText: {
    fontSize: 13,
  },
  promptBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.md,
  },
  promptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  container: {
    flex: 1,
  },
  titleCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  titleInput: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '700',
    outlineStyle: 'none',
  } as any,
  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  toolBtn: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: 6,
  },
  statItem: {
    fontSize: 12,
  },
  statValue: {
    fontWeight: '700',
  },
  statDivider: {
    fontSize: 12,
  },
  contentCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 450,
  },
  contentInput: {
    ...typography.body1,
    fontSize: 16,
    lineHeight: 26,
    minHeight: 420,
    outlineStyle: 'none',
  } as any,
});
