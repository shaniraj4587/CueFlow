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
import { typography } from '../theme/typography';
import { spacing, borderRadius, elevation } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { filteredScripts, searchQuery, setSearchQuery, deleteScript, duplicateScript, resetSampleScript } =
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
  const maxContentWidth = width >= 600 ? Math.min(width * 0.92, 960) : '100%';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={settings.look.themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      {/* Top App Header */}
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
                Teleprompter
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
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
              <Text style={styles.createBtnText}>{t.newScript}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}>
          <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.clearSearchText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Scripts List */}
      <FlatList
        data={filteredScripts}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}
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
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  brandTitle: {
    ...typography.h3,
    fontSize: 17,
  },
  brandSubtitle: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  settingsIcon: {
    fontSize: 18,
  },
  createBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
  },
  createBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 13,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
