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
    "text-base/6 font-medium text-gray-200",
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
    "text-sm/6 font-medium text-gray-200",
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
    "text-3xl/6 font-bold text-gray-200",
    "my-4",
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
    "text-xl/6 font-bold text-gray-200",
    "my-2",
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
    "text-base/6 font-medium text-gray-200",
    "underline hover:text-gray-100 hover:no-underline",
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
