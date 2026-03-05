// Shared modal styles for deck/card forms.
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export const modalStyles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  backdrop: {
    backgroundColor: COLORS.overlay,
    flex: 1,
  },
  cancelButton: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cancelText: {
    color: COLORS.subtleText,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 6,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  input: {
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    bottom: 0,
    left: 0,
    padding: 20,
    position: 'absolute',
    right: 0,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});
