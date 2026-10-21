import 'react-native';
import React from 'react';
import App from '../App';
import { it, expect } from '@jest/globals';
import renderer, { act } from 'react-test-renderer';
import { PlaybackControls } from '../src/components/PlaybackControls';
import { lightColors } from '../src/theme/colors';

it('renders correctly', async () => {
  let tree: any;
  await act(async () => {
    tree = renderer.create(<App />);
  });
  expect(tree).toBeDefined();
});

it('triggers speed decrease and increase in PlaybackControls without error', () => {
  let currentSpeed = 5;
  const onSpeedChange = (newSpeed: number) => {
    currentSpeed = newSpeed;
  };

  let tree: any;
  act(() => {
    tree = renderer.create(
      <PlaybackControls
        isPlaying={false}
        progressPercent={25}
        speed={currentSpeed}
        colors={lightColors}
        onTogglePlay={() => {}}
        onRestart={() => {}}
        onSpeedChange={onSpeedChange}
        onSeek={() => {}}
      />
    );
  });

  const root = tree.root;
  const decBtn = root.findByProps({ accessibilityLabel: 'Decrease speed' });
  const incBtn = root.findByProps({ accessibilityLabel: 'Increase speed' });

  // Test decrease
  act(() => {
    decBtn.props.onPress();
  });
  expect(currentSpeed).toBe(4);

  // Test increase
  act(() => {
    incBtn.props.onPress();
  });
  expect(currentSpeed).toBe(6);
});
