import { StyleSheet } from "react-native";
import { SIZING, FONTS, COLORS } from "../../../theme/theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: SIZING.medium,
    paddingBottom: SIZING.large,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: SIZING.medium,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: SIZING.medium,
    borderRadius: SIZING.large,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    marginLeft: SIZING.medium,
  },
  botBubble: {
    backgroundColor: COLORS.surface,
    marginRight: SIZING.medium,
  },
  typingBubble: {
    backgroundColor: COLORS.surface,
    opacity: 0.7,
  },
  messageText: {
    fontSize: SIZING.medium,
    fontFamily: FONTS.regular,
    lineHeight: SIZING.medium * 1.4,
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.text,
  },
  typingDots: {
    flexDirection: "row",
    marginTop: SIZING.small,
  },
  typingDot: {
    fontSize: SIZING.large,
    color: COLORS.textSecondary,
    marginRight: 2,
  },
  botAvatar: {
    backgroundColor: COLORS.secondary,
  },
  userAvatar: {
    backgroundColor: COLORS.primary,
  },
  typingIndicator: {
    marginBottom: SIZING.medium,
  },
  quickRepliesContainer: {
    paddingHorizontal: SIZING.medium,
    paddingBottom: SIZING.small,
  },
  quickRepliesScroll: {
    paddingVertical: SIZING.small,
  },
  quickReplyChip: {
    marginRight: SIZING.small,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: SIZING.small,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  inputContainer: {
    padding: SIZING.medium,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: SIZING.large,
    maxHeight: 100,
  },
});
