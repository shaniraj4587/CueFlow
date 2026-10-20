import { TextStyle } from 'react-native';

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 21,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 21,
  },
  subtext: {
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
};
