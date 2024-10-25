import { twMerge } from 'tailwind-merge';

export const Base = ({
  className,
  children
}: {
  className?: string,
  children: React.ReactNode
}) => {
  const classes = [
    "text-base/6 font-medium text-gray-200",
  ];

  return (
    <p className={twMerge(
      className,
      ...classes
    )}>
      {children}
    </p>
  );
}
