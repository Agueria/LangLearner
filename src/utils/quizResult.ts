export const parseResultCount = (value: string | string[] | undefined) => {
  if (typeof value !== 'string') {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const calculateQuizPercentage = (
  correctCount: number,
  totalCount: number
) => (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);
