import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useScripts } from '../hooks/useScripts';
import { useSettings } from '../hooks/useSettings';
import { ScriptCard } from '../components/ScriptCard';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { NativeOverlayService } from '../services/NativeOverlayService';
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { filteredScripts, searchQuery, setSearchQuery, deleteScript, duplicateScript, resetSampleScript, scripts } =
    useScripts();
  const { colors, settings, t } = useSettings();

  const [deleteDialogScriptId, setDeleteDialogScriptId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (deleteDialogScriptId) {
      await deleteScript(deleteDialogScriptId);
      setDeleteDialogScriptId(null);
    }
  };

  const { width } = useWindowDimensions();
  const maxContentWidth = width >= 600 ? Math.min(width * 0.94, 1020) : '100%';

  const handleLaunchFirstScriptOverlay = async () => {
    const target = filteredScripts[0] || scripts[0];
    if (target) {
      await NativeOverlayService.launch(
        target.id,
        target.title,
        target.content,
        settings.floating,
        target.scrollPosition || 0
      );
    } else {
      navigation.navigate('Editor', {});
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={settings.look.themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      {/* Top Windows App Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.headerInner, { maxWidth: maxContentWidth }]}>
          <View style={styles.brandRow}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>CueFlow</Text>
              <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                Desktop Teleprompter for Windows
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleLaunchFirstScriptOverlay}
              style={[styles.overlayHeaderBtn, { backgroundColor: '#0284C7' }]}
              accessibilityLabel="Launch Floating Overlay"
            >
              <Text style={styles.overlayHeaderBtnText}>⧉ Float Prompter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Settings', { activeTab: 'reading' })}
              style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Settings"
            >
              <Text style={[styles.settingsIcon, { color: colors.textPrimary }]}>⚙</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Editor', {})}
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              accessibilityLabel="Create New Script"
            >
              <Text style={styles.createBtnText}>+ New Script</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <Text style={[styles.searchIcon, { color: colors.textMuted }]}>🔍</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.searchPlaceholder || 'Search scripts by title or keyword...'}
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.clearSearchText, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Script List */}
      <FlatList
        data={filteredScripts}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' },
          filteredScripts.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item }) => (
          <ScriptCard
            script={item}
            colors={colors}
            labels={{
              prompt: t.prompt,
              edit: t.edit,
              copy: t.copy,
              words: t.words,
            }}
            onPress={() => navigation.navigate('Teleprompter', { scriptId: item.id })}
            onEdit={() => navigation.navigate('Editor', { scriptId: item.id })}
            onDuplicate={() => duplicateScript(item.id)}
            onDelete={() => setDeleteDialogScriptId(item.id)}
            onFloat={async () => {
              await NativeOverlayService.launch(
                item.id,
                item.title,
                item.content,
                settings.floating,
                item.scrollPosition || 0
              );
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={searchQuery ? t.noMatchingScripts : t.noScriptsTitle}
            description={
              searchQuery
                ? t.noMatchingScriptsSub
                : t.noScriptsSub
            }
            actionLabel={searchQuery ? t.clearSearch : t.createScriptBtn}
            secondaryActionLabel={!searchQuery ? t.resetSampleBtn : undefined}
            colors={colors}
            onAction={() => {
              if (searchQuery) {
                setSearchQuery('');
              } else {
                navigation.navigate('Editor', {});
              }
            }}
            onSecondaryAction={resetSampleScript}
          />
        }
      />

      {/* Confirmation Dialog for Script Deletion */}
      <ConfirmDialog
        visible={deleteDialogScriptId !== null}
        title={t.deleteConfirmTitle}
        message={t.deleteConfirmMsg}
        confirmLabel={t.delete}
        isDestructive
        colors={colors}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogScriptId(null)}
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm + 2,
  },
  brandTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
  },
  brandSubtitle: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overlayHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: borderRadius.md,
  },
  overlayHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  settingsIcon: {
    fontSize: 18,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: borderRadius.md,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...typography.body2,
    fontSize: 14,
  },
  clearSearchText: {
    fontSize: 14,
    padding: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
