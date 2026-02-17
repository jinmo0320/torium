type Portionable = {
  portion: number;
  [key: string]: any;
};

// 비중의 합은 100%여야 함.
export const isValidPortions = (portions: Portionable[]) => {
  const total = portions.reduce((acc, p) => acc + p.portion, 0);
  return Math.abs(total - 1.0) <= 0.001;
};
