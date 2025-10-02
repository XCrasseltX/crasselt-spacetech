export const metadata = {
title: 'Black Hole Background',
description: 'Realistic black hole background in Next.js + R3F'
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="de">
<body>{children}</body>
</html>
);
}
