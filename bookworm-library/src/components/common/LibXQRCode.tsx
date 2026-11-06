import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface LibXQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  logoUrl?: string;
  quietZone?: number;
}

export function LibXQRCode({
  value,
  size = 200,
  color = '#1A3326',
  backgroundColor = '#FFFFFF',
  quietZone = 10,
}: LibXQRCodeProps) {
  return (
    <View style={[styles.qrContainer, { width: size + quietZone * 2, height: size + quietZone * 2, backgroundColor }]}>
      <QRCode
        value={value || 'LIBX-DEFAULT-EMPTY'}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
        quietZone={quietZone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
});

