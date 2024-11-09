import './globals.css';
import { twMerge } from 'tailwind-merge';

export const metadata = {
  title: 'AoC Boards'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={twMerge(
          "bg-gray-900 text-gray-200",
          "overflow-hidden relative"
        )}
      >
        {children}
      </body>
    </html>
  )
}
