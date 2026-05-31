import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

function BrokenChild(): React.ReactNode {
  throw new Error('render exploded');
}

function HealthyChild() {
  return <Text>Healthy screen</Text>;
}

describe('ErrorBoundary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('shows a friendly fallback when a child screen crashes', () => {
    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('render exploded')).toBeTruthy();
  });

  it('can reset from the fallback state', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    );

    rerender(
      <ErrorBoundary>
        <HealthyChild />
      </ErrorBoundary>
    );
    fireEvent.press(screen.getByText('Try Again'));

    expect(screen.getByText('Healthy screen')).toBeTruthy();
  });
});
