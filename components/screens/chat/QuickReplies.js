import React from "react";
import { View, ScrollView } from "react-native";
import { Chip } from "react-native-paper";
import { COLORS, SIZING } from "../../../theme/theme";
import styles from "./styles";

const QUICK_REPLIES = [
  "איך אני יכול לעזור לחיית המחמד שלי?",
  "מה התזונה המומלצת לכלב?",
  "איך לטפל בחתול חולה?",
  "מתי צריך לקחת לחיסון?",
  "איך לאלף כלב?",
  "מה לעשות עם חתול שמתנהג מוזר?",
];

const QuickReplies = ({ onQuickReply }) => {
  return (
    <View style={styles.quickRepliesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRepliesScroll}
      >
        {QUICK_REPLIES.map((reply, index) => (
          <Chip
            key={index}
            onPress={() => onQuickReply(reply)}
            style={styles.quickReplyChip}
            textStyle={styles.quickReplyText}
          >
            {reply}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
};

export default QuickReplies;
