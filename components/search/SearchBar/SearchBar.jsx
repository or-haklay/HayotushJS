import React from "react";
import { View } from "react-native";
import { TextInput, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";

const SearchBar = ({
  value,
  onChangeText,
  placeholder,
  onSearch,
  showFilters = false,
  onFiltersPress = null,
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons
          name="search"
          size={20}
          color={styles.searchIcon.color}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          onSubmitEditing={onSearch}
        />
        {value.length > 0 && (
          <IconButton
            icon="close"
            iconColor={styles.clearButton.color}
            size={20}
            onPress={() => onChangeText("")}
            style={styles.clearButton}
          />
        )}
      </View>

      {showFilters && (
        <IconButton
          icon="filter"
          iconColor={styles.filterButton.color}
          size={24}
          onPress={onFiltersPress}
          style={styles.filterButton}
        />
      )}
    </View>
  );
};

export default SearchBar;
