import React, { memo } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { COLORS, GRID_HORIZONTAL_PADDING } from '../utils/constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

function SearchBarComponent({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        placeholder="Search apps..."
        placeholderTextColor={COLORS.searchPlaceholder}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 12,
  },
  input: {
    height: 44,
    backgroundColor: COLORS.searchBackground,
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 15,
    color: COLORS.searchText,
  },
});

export const SearchBar = memo(SearchBarComponent);
