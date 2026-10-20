import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
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

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing script if scriptId was provided
  useEffect(() => {
    if (scriptId) {
      ScriptStorage.getById(scriptId).then(script => {
        if (script) {
          setTitle(script.title);
          setContent(script.content);
          setIsSaved(true);
        }
      });
    }
  }, [scriptId]);

  // Compute stats dynamically
  const stats = calculateScriptStats(content);

  // Autosave handler (debounced 1.5s after user stops typing)
  const saveScript = useCallback(async () => {
    const safeTitle = title.trim() || 'Untitled Script';
    if (currentScriptId) {
      await ScriptStorage.update(currentScriptId, {
        title: safeTitle,
        content,
      });
    } else {
      const created = await ScriptStorage.create(safeTitle, content);
      setCurrentScriptId(created.id);
    }
    setIsSaved(true);
  }, [title, content, currentScriptId]);

  const handleContentChange = (text: string) => {
    setContent(text);
    setIsSaved(false);

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      saveScript();
    }, 1500);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    setIsSaved(false);

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      saveScript();
    }, 1500);
  };

  // Import document from Android Storage Access Framework
  const handleImportDocument = async () => {
    try {
      const imported = await FileImportService.importTextDocument();
      if (imported) {
        setTitle(imported.fileName.replace(/\.[^/.]+$/, ''));
        setContent(imported.content);
        setIsSaved(false);
      }
    } catch (err: any) {
      Alert.alert('Import Error', 'Could not import the selected text document.');
    }
  };

  // Export document as .txt file
  const handleExportDocument = async () => {
    try {
      const success = await FileImportService.exportTextDocument(
        title || 'teleprompter_script',
        content
      );
      if (success) {
        Alert.alert('Script Exported', 'Your script was successfully exported.');
      }
    } catch (err: any) {
      Alert.alert('Export Error', 'Could not export the script to device storage.');
    }
  };

  const handleLoadSample = () => {
    setTitle('Welcome to CueFlow');
    setContent(SAMPLE_SCRIPT_CONTENT);
    setIsSaved(false);
  };

  const handleLoadHindiSample = () => {
    setTitle('CueFlow में आपका स्वागत है (हिंदी)');
    setContent(HINDI_SAMPLE_SCRIPT_CONTENT);
    setIsSaved(false);
  };

  const handleClear = () => {
    setContent('');
    setIsSaved(false);
    setShowClearConfirm(false);
  };

  const handlePrompt = async () => {
    await saveScript();
    if (currentScriptId) {
      navigation.navigate('Teleprompter', { scriptId: currentScriptId });
    }
  };

  const { width } = useWindowDimensions();
  const maxContentWidth = width >= 600 ? Math.min(width * 0.92, 960) : '100%';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={[styles.container, { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header Bar */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Back to library"
          >
            <Text style={[styles.backIcon, { color: colors.textPrimary }]}>‹</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.titleInput, { color: colors.textPrimary }]}
            placeholder={t.scriptTitlePlaceholder}
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={handleTitleChange}
            maxLength={80}
          />

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={saveScript}
              style={[
                styles.saveBtn,
                { backgroundColor: isSaved ? colors.surface : colors.primary, borderColor: colors.border },
              ]}
              accessibilityLabel="Save script"
            >
              <Text
                style={[
                  styles.saveBtnText,
                  { color: isSaved ? colors.textSecondary : '#FFFFFF' },
                ]}
              >
                {isSaved ? t.saved : t.save}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePrompt}
              style={[styles.promptBtn, { backgroundColor: colors.primary }]}
              accessibilityLabel="Launch Teleprompter"
            >
              <Text style={styles.promptBtnText}>{t.prompt}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toolbar Bar */}
        <View style={[styles.toolbar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
            <TouchableOpacity
              onPress={handleImportDocument}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Open document from device"
            >
              <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>{t.importTextFile}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportDocument}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Export document to device"
            >
              <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>{t.exportBtn}</Text>
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
              accessibilityLabel="Toggle Monospace font"
            >
              <Text
                style={[
                  styles.toolBtnText,
                  { color: isMonospace ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {t.monoFont}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLoadHindiSample}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Load Hindi sample text"
            >
              <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>{t.hindiSampleBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLoadSample}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Load English sample text"
            >
              <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>{t.englishSampleBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowClearConfirm(true)}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Clear script"
            >
              <Text style={[styles.toolBtnText, { color: colors.error }]}>{t.clearAll}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Stats Summary Bar */}
        <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.statItem, { color: colors.textSecondary }]}>
            {t.wordsLabel} <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.wordCount}</Text>
          </Text>
          <Text style={[styles.statDivider, { color: colors.border }]}>|</Text>
          <Text style={[styles.statItem, { color: colors.textSecondary }]}>
            {t.charsLabel} <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.charCount}</Text>
          </Text>
          <Text style={[styles.statDivider, { color: colors.border }]}>|</Text>
          <Text style={[styles.statItem, { color: colors.textSecondary }]}>
            {t.estReadingLabel} <Text style={[styles.statValue, { color: colors.primary }]}>{stats.estimatedDurationText}</Text>
          </Text>
        </View>

        {/* Multiline Script Editor */}
        <View style={[styles.editorContainer, { backgroundColor: colors.card }]}>
          <TextInput
            style={[
              styles.textEditor,
              {
                color: colors.textPrimary,
                fontFamily: isMonospace ? 'monospace' : undefined,
              },
            ]}
            multiline
            textAlignVertical="top"
            placeholder={t.scriptBodyPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={handleContentChange}
            autoCorrect={false}
          />
        </View>

        {/* Confirm Clear Modal */}
        <ConfirmDialog
          visible={showClearConfirm}
          title={t.clearAll}
          message={t.deleteConfirmMsg}
          confirmLabel={t.clear}
          isDestructive
          colors={colors}
          onConfirm={handleClear}
          onCancel={() => setShowClearConfirm(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  backIcon: {
    fontSize: 26,
    fontWeight: '300',
    marginTop: -2,
  },
  titleInput: {
    flex: 1,
    ...typography.h3,
    fontSize: 16,
    paddingVertical: 4,
    marginRight: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  saveBtnText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  promptBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
  },
  promptBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 13,
  },
  toolbar: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  toolbarScroll: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  toolBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  toolBtnText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  statItem: {
    ...typography.caption,
    fontSize: 12,
  },
  statValue: {
    fontWeight: '700',
  },
  statDivider: {
    marginHorizontal: spacing.sm,
  },
  editorContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  textEditor: {
    flex: 1,
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
});
