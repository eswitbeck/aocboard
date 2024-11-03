'use client';

export default function ServerActionButton({
  fn,
  style,
  className,
  children
}: {
  fn: () => Promise<void>;
  className?: string;
  style?: any
  children?: React.ReactNode;
}) {
  return (
    <button
      style={style}
      className={className}
      onClick={() => fn()
    }>
      {children}
    </button>
  );
}
