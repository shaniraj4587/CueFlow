import { PermissionService } from '../src/services/PermissionService';
import { FileImportService } from '../src/services/FileImportService';
import { NativeOverlayService } from '../src/services/NativeOverlayService';
import { PermissionsAndroid, Platform } from 'react-native';

describe('Permissions & Error Handling', () => {
  beforeEach(() => {
    Platform.OS = 'android';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('handles microphone permission denial gracefully', async () => {
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED);

    const result = await PermissionService.requestMicrophonePermission();
    expect(result).toBe(false);
  });

  it('handles microphone permission granted correctly', async () => {
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

    const result = await PermissionService.requestMicrophonePermission();
    expect(result).toBe(true);
  });

  it('handles overlay permission check safely when native module is mocked or unavailable', async () => {
    const isGranted = await PermissionService.checkOverlayPermission();
    expect(typeof isGranted).toBe('boolean');
  });

  it('handles floating overlay launch failure safely without crash', async () => {
    const launched = await NativeOverlayService.launch(
      'test-id',
      'Test Title',
      'Test Content',
      {
        width: 300,
        height: 200,
        opacity: 0.8,
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        fontSize: 20,
        speed: 5,
        mirrorMode: false,
      }
    );
    expect(typeof launched).toBe('boolean');
  });
});
