import { type CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  isLightTheme?: boolean;
  style?: CSSProperties;
}

const Skeleton = ({
  width = '100%',
  height = '1em',
  borderRadius = '4px',
  variant = 'text',
  isLightTheme = true,
  style,
}: SkeletonProps) => {
  const getVariantStyles = (): CSSProperties => {
    switch (variant) {
      case 'text':
        return {
          width,
          height,
          borderRadius,
          marginBottom: '2px',
        };
      case 'circular':
        return {
          width,
          height,
          borderRadius: '50%',
        };
      case 'rectangular':
      default:
        return {
          width,
          height,
          borderRadius,
        };
    }
  };

  const baseStyles: CSSProperties = {
    display: 'inline-block',
    backgroundColor: isLightTheme ? '#e0ddd0' : '#374151',
    position: 'relative',
    overflow: 'hidden',
    ...getVariantStyles(),
    ...style,
  };

  const shimmerStyles: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: isLightTheme
      ? 'linear-gradient(90deg, transparent, rgba(235, 233, 220, 0.8), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    animation: 'shimmer 2s infinite ease-in-out',
  };

  return (
    <span style={baseStyles}>
      <span style={shimmerStyles} />
      <style>
        {`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </span>
  );
};

export default Skeleton;
