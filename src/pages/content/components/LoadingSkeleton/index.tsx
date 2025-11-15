import Skeleton from '../Skeleton';

interface LoadingSkeletonProps {
  isLightTheme: boolean;
  numberOfLines?: number;
  width?: string | number;
  height?: string | number;
}

const LoadingSkeleton = ({ isLightTheme, numberOfLines, width, height }: LoadingSkeletonProps) => (
  <>
    {Array(numberOfLines || 3)
      .fill(0)
      .map((_, index) => (
        <Skeleton
          key={index}
          width={width || '100%'}
          height={height || '1em'}
          isLightTheme={isLightTheme}
        />
      ))}
  </>
);

export default LoadingSkeleton;
