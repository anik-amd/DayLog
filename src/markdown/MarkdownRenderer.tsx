import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useColorScheme } from "nativewind";

interface MarkdownProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const lines = content.split('\n');

  const textColor = isDark ? '#d4d4d8' : '#3f3f46';
  const headingColor = isDark ? '#fafafa' : '#27272a';
  const subheadingColor = isDark ? '#e4e4e7' : '#3f3f46';

  return (
    <View>
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <Text key={index} style={[localStyles.h1, { color: headingColor }]}>
              {parseInline(line.substring(2), isDark)}
            </Text>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <Text key={index} style={[localStyles.h2, { color: headingColor }]}>
              {parseInline(line.substring(3), isDark)}
            </Text>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <Text key={index} style={[localStyles.h3, { color: subheadingColor }]}>
              {parseInline(line.substring(4), isDark)}
            </Text>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <View key={index} style={localStyles.bulletRow}>
              <Text style={[localStyles.bullet]}>•</Text>
              <Text style={[localStyles.bulletText, { color: textColor }]}>
                {parseInline(line.substring(2), isDark)}
              </Text>
            </View>
          );
        }
        if (line.trim() === '') {
          return <View key={index} style={localStyles.blankLine} />;
        }
        
        return (
          <Text key={index} style={[localStyles.paragraph, { color: textColor }]}>
            {parseInline(line, isDark)}
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
    color: '#a1a1aa',
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

function parseInline(text: string, isDark: boolean) {
  const parts: any[] = [];
  const textColor = isDark ? '#d4d4d8' : '#3f3f46';
  const headingColor = isDark ? '#fafafa' : '#27272a';
  
  const boldSegments = text.split(/(\*\*.*?\*\*)/g);
  
  boldSegments.forEach((segment, i) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      const innerText = segment.slice(2, -2);
      parts.push(
        <Text key={`bold-${i}`} style={[{ fontFamily: 'Outfit-SemiBold', color: headingColor }]}>
          {parseItalics(innerText, isDark)}
        </Text>
      );
    } else if (segment) {
      parts.push(<React.Fragment key={`frag-${i}`}>{parseItalics(segment, isDark)}</React.Fragment>);
    }
  });

  return parts.length > 0 ? parts : text;
}

function parseItalics(text: string, isDark: boolean) {
  if (!text) return [];
  const parts: any[] = [];
  const italicColor = isDark ? '#a1a1aa' : '#52525b';
  const textColor = isDark ? '#d4d4d8' : '#3f3f46';
  
  const italicSegments = text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g);
  
  italicSegments.forEach((seg, i) => {
    if ((seg.startsWith('*') && seg.endsWith('*')) || (seg.startsWith('_') && seg.endsWith('_'))) {
      const innerText = seg.substring(1, seg.length - 1);
      parts.push(
        <Text key={`italic-${i}`} style={[{ fontFamily: 'Outfit-Regular', fontStyle: 'italic', color: italicColor }]}>
          {innerText}
        </Text>
      );
    } else if (seg) {
      parts.push(<Text key={`text-${i}`} style={{ fontFamily: 'Outfit-Regular', color: textColor }}>{seg}</Text>);
    }
  });
  
  return parts;
}
