import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  detail: {
    color: COLORS.subtleText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { children } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.detail}>{error.message}</Text>
        <Pressable style={styles.button} onPress={this.handleReset}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
}
