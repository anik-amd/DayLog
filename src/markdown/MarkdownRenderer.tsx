import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from "nativewind";
import { useThemeColors } from '../hooks/useThemeColors';

interface MarkdownProps {
  content: string;
  onTagPress?: (tag: string) => void;
}

export default function MarkdownRenderer({ content, onTagPress }: MarkdownProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const isDark = colorScheme === 'dark';
  const lines = content.split('\n');

  return (
    <View>
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <Text key={index} style={[localStyles.h1, { color: colors.text }]}>
              {parseInline(line.substring(2), colors, isDark, onTagPress)}
            </Text>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <Text key={index} style={[localStyles.h2, { color: colors.text }]}>
              {parseInline(line.substring(3), colors, isDark, onTagPress)}
            </Text>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <Text key={index} style={[localStyles.h3, { color: colors.text }]}>
              {parseInline(line.substring(4), colors, isDark, onTagPress)}
            </Text>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <View key={index} style={localStyles.bulletRow}>
              <Text style={[localStyles.bullet, { color: colors.textSecondary }]}>•</Text>
              <Text style={[localStyles.bulletText, { color: colors.text }]}>
                {parseInline(line.substring(2), colors, isDark, onTagPress)}
              </Text>
            </View>
          );
        }
        if (line.trim() === '') {
          return <View key={index} style={localStyles.blankLine} />;
        }
        
        return (
          <Text key={index} style={[localStyles.paragraph, { color: colors.text }]}>
            {parseInline(line, colors, isDark, onTagPress)}
          </Text>
        );
      })}
    </View>
  );
}

const localStyles = StyleSheet.create({
  h1: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 22,
    lineHeight: 32,
    marginTop: 12,
    marginBottom: 4,
  },
  h2: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    lineHeight: 28,
    marginTop: 8,
    marginBottom: 4,
  },
  h3: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingRight: 16,
  },
  bullet: {
    fontFamily: 'Outfit-Regular',
    fontSize: 18,
    marginRight: 10,
  },
  bulletText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 28,
    flex: 1,
    flexWrap: 'wrap',
  },
  blankLine: {
    height: 12,
  },
  paragraph: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    lineHeight: 28,
    marginTop: 2,
    flexWrap: 'wrap',
  },
});

function parseInline(text: string, colors: any, isDark: boolean, onTagPress?: (tag: string) => void) {
  const parts: any[] = [];
  
  const boldSegments = text.split(/(\*\*.*?\*\*)/g);
  
  boldSegments.forEach((segment, i) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      const innerText = segment.slice(2, -2);
      parts.push(
        <Text key={`bold-${i}`} style={[{ fontFamily: 'Outfit-SemiBold', color: colors.text }]}>
          {parseItalics(innerText, colors, isDark, onTagPress)}
        </Text>
      );
    } else if (segment) {
      parts.push(<React.Fragment key={`frag-${i}`}>{parseItalics(segment, colors, isDark, onTagPress)}</React.Fragment>);
    }
  });

  return parts.length > 0 ? parts : text;
}

function parseItalics(text: string, colors: any, isDark: boolean, onTagPress?: (tag: string) => void) {
  if (!text) return [];
  const parts: any[] = [];
  
  const tagPattern = /(#\w+)/g;
  const segments = text.split(tagPattern);
  
  segments.forEach((seg, i) => {
    if (seg.match(tagPattern)) {
      parts.push(
        <TouchableOpacity key={`tag-${i}`} onPress={() => onTagPress?.(seg.substring(1))} activeOpacity={0.7}>
          <Text style={{ fontFamily: 'Outfit-Medium', color: colors.pills.tags.text, lineHeight: 28 }}>{seg}</Text>
        </TouchableOpacity>
      );
    } else {
      const italicSegments = seg.split(/(\*[^*\n]+\*|_[^_\n]+_)/g);
      italicSegments.forEach((s, j) => {
        if ((s.startsWith('*') && s.endsWith('*')) || (s.startsWith('_') && s.endsWith('_'))) {
          const innerText = s.substring(1, s.length - 1);
          parts.push(
            <Text key={`italic-${i}-${j}`} style={[{ fontFamily: 'Outfit-Regular', fontStyle: 'italic', color: colors.textSecondary }]}>
              {innerText}
            </Text>
          );
        } else if (s) {
          parts.push(<Text key={`text-${i}-${j}`} style={{ fontFamily: 'Outfit-Regular', color: colors.text }}>{s}</Text>);
        }
      });
    }
  });
  
  return parts;
}
