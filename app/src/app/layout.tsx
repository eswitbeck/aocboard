import './globals.css';

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
        className="bg-gray-900 text-gray-200"
      >
        {children}
      </body>
    </html>
  )
}
