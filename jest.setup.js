/* eslint-env jest */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { NativeModules } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

NativeModules.FloatingTeleprompterModule = {
  canDrawOverlays: jest.fn(() => Promise.resolve(true)),
  requestOverlayPermission: jest.fn(() => Promise.resolve(true)),
  showOverlay: jest.fn(() => Promise.resolve(true)),
  hideOverlay: jest.fn(() => Promise.resolve(true)),
  isOverlayRunning: jest.fn(() => Promise.resolve(false)),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

NativeModules.VoiceFollowModule = {
  isAvailable: jest.fn(() => Promise.resolve(true)),
  isOnDeviceAvailable: jest.fn(() => Promise.resolve(true)),
  startListening: jest.fn(() => Promise.resolve(true)),
  stopListening: jest.fn(() => Promise.resolve(true)),
  destroy: jest.fn(() => Promise.resolve(true)),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

NativeModules.KeepAwakeModule = {
  activate: jest.fn(() => Promise.resolve(true)),
  deactivate: jest.fn(() => Promise.resolve(true)),
};

NativeModules.FileAccessModule = {
  pickTextFile: jest.fn(() => Promise.resolve({ fileName: 'test.txt', content: 'test content' })),
  exportTextFile: jest.fn(() => Promise.resolve(true)),
};
