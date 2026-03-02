// Shared modal styles for deck/card forms.
import { StyleSheet } from 'react-native';

export const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#D62828',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#4E4E4E',
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1F6FEB',
    borderRadius: 10,
  },
  submitText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
