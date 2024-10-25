import { twMerge } from "tailwind-merge";

export const Button = ({
  className,
  color,
  children
}: {
  className?: string,
  color?: 'orange' | 'yellow'
  children: React.ReactNode
}) => {
  const colors = {
    orange: [
      "bg-orange-600 hover:bg-orange-700",
      "text-gray-800 hover:text-gray-200"
    ],
    yellow: [
      "bg-yellow-600 hover:bg-yellow-800",
      "text-gray-800 hover:text-yellow-400"
    ]
  };

  const classes = [
    "py-2 px-4 rounded-lg",
    "bg-gray-700 hover:bg-gray-800",
    "hover:text-gray-400",
    "shadow-sm",
  ];

  return (
    <button className={twMerge(
      ...classes,
      color ? colors[color] : [],
      className
    )}>
      {children}
    </button>
  );
}
