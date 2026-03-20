import React from 'react';
import { Text, View } from 'react-native';

interface MarkdownProps {
  content: string;
}

// Minimalistic native markdown parser tailored specifically for performance (no massive 3rd party parser libraries).
// Understands: Headings, Unordered Lists, Bold tags, Line breaks
export default function MarkdownRenderer({ content }: MarkdownProps) {
  const lines = content.split('\n');

  return (
    <View>
      {lines.map((line, index) => {
        // H1
        if (line.startsWith('# ')) {
          return (
            <Text key={index} className="text-white text-[22px] leading-8 font-bold mt-3 mb-1">
              {parseInline(line.substring(2))}
            </Text>
          );
        }
        // H2
        if (line.startsWith('## ')) {
          return (
            <Text key={index} className="text-white text-[18px] leading-7 font-bold mt-2 mb-1">
              {parseInline(line.substring(3))}
            </Text>
          );
        }
        // H3
        if (line.startsWith('### ')) {
          return (
            <Text key={index} className="text-neutral-100 text-[16px] leading-6 font-bold mt-1 mb-1">
              {parseInline(line.substring(4))}
            </Text>
          );
        }
        // Bullet List
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <View key={index} className="flex-row items-start mt-0.5 mb-1 pl-2 pr-2">
              <Text className="text-neutral-500 mr-2.5 text-[18px]">•</Text>
              <Text className="text-neutral-200 text-[16px] leading-7 font-medium flex-1 break-words">
                {parseInline(line.substring(2))}
              </Text>
            </View>
          );
        }
        // Blank line (line break equivalent spacing)
        if (line.trim() === '') {
          return <View key={index} className="h-3" />;
        }
        
        // Standard Paragraph Text
        return (
          <Text key={index} className="text-neutral-200 text-[16px] leading-7 font-medium break-words mt-0.5">
            {parseInline(line)}
          </Text>
        );
      })}
    </View>
  );
}

function parseInline(text: string) {
  const parts: any[] = [];
  
  // Pass 1: Split explicitly around **bold** tags first so they aren't confused with single *italics*
  const boldSegments = text.split(/(\*\*.*?\*\*)/g);
  
  boldSegments.forEach((segment, i) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      const innerText = segment.slice(2, -2);
      parts.push(
        <Text key={`bold-${i}`} className="font-extrabold text-white">
          {parseItalics(innerText)}
        </Text>
      );
    } else if (segment) {
      // Pass 2: Send remaining flat text chunks sequentially through the italics parser
      parts.push(<React.Fragment key={`frag-${i}`}>{parseItalics(segment)}</React.Fragment>);
    }
  });

  return parts.length > 0 ? parts : text;
}

function parseItalics(text: string) {
  if (!text) return [];
  const parts: any[] = [];
  
  // Safe italic splitter that catches *italic* or _italic_ safely avoiding newlines
  const italicSegments = text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g);
  
  italicSegments.forEach((seg, i) => {
    if ((seg.startsWith('*') && seg.endsWith('*')) || (seg.startsWith('_') && seg.endsWith('_'))) {
      const innerText = seg.substring(1, seg.length - 1);
      parts.push(
        <Text key={`italic-${i}`} className="italic text-neutral-100">
          {innerText}
        </Text>
      );
    } else if (seg) {
      parts.push(<Text key={`text-${i}`}>{seg}</Text>);
    }
  });
  
  return parts;
}
