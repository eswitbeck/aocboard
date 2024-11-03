import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

export const Base = ({
  className,
  style,
  children
}: {
  className?: string,
  style?: React.CSSProperties,
  children: React.ReactNode
}) => {
  const classes = [
    "text-base font-medium text-gray-200",
    "leading-none! align-baseline"
  ];

  return (
    <p className={twMerge(
      ...classes,
      className
    )} style={style}>
      {children}
    </p>
  );
}

export const Small = ({
  className,
  children
}: {
  className?: string,
  children: React.ReactNode
}) => {
  const classes = [
    "text-sm font-medium text-gray-200",
    "align-baseline leading-none!"
  ];

  return (
    <p className={twMerge(
      ...classes,
      className
    )}>
      {children}
    </p>
  );
}

export const H1 = ({
  className,
  children
}: {
  className?: string,
  children: React.ReactNode
}) => {
  const classes = [
    "text-3xl font-bold text-gray-200",
    "my-4",
    "align-baseline leading-none!"
  ];

  return (
    <h1 className={twMerge(
      ...classes,
      className
    )}>
      {children}
    </h1>
  );
}

export const H3 = ({
  className,
  children
}: {
  className?: string,
  children: React.ReactNode
}) => {
  const classes = [
    "text-xl font-bold text-gray-200",
    "my-2",
    "align-baseline leading-none!"
  ];

  return (
    <h3 className={twMerge(
      ...classes,
      className
    )}>
      {children}
    </h3>
  );
}

export const A = ({
  className,
  href,
  children
}: {
  className?: string,
  href: string,
  children: React.ReactNode
}) => {
  const classes = [
    "text-base font-medium text-gray-200",
    "underline hover:text-gray-100 hover:no-underline",
    "align-baseline leading-none!"
  ];

  return (
    <Link href={href
      .replace(/\/$/, '')}>
      <p className={twMerge(
        ...classes,
        className
      )}>
        {children}
      </p>
    </Link>
  );
}
