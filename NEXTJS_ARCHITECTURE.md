# AL-MURAJACAH - Next.js Architecture Plan

## Overview

This document outlines the complete architecture for rebuilding AL-MURAJACAH as a modern, production-ready Next.js application with TypeScript, Tailwind CSS, PostgreSQL, Prisma, and NextAuth.

## Tech Stack

- **Frontend Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Credentials + Email)
- **Forms & Validation**: React Hook Form + Zod
- **State Management**: React Context API + Zustand (for complex state)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Email**: Resend or SendGrid
- **Deployment**: Vercel (recommended) or any Node.js hosting

## Project Structure

```
al-murajacah/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected route group
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── sessions/
│   │   │   └── page.tsx
│   │   ├── timetable/
│   │   │   └── page.tsx
│   │   ├── groups/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── sessions/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── timetable/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── groups/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── [id]/share/
│   │   │       └── route.ts
│   │   └── email/
│   │       └── route.ts
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                    # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Sidebar.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── sessions/
│   │   ├── BookingForm.tsx
│   │   ├── DateSelector.tsx
│   │   ├── TimeSelector.tsx
│   │   ├── SubjectSelector.tsx
│   │   └── VenueSelector.tsx
│   ├── timetable/
│   │   ├── TimetableView.tsx
│   │   ├── TimetableDay.tsx
│   │   └── SessionCard.tsx
│   ├── groups/
│   │   ├── GroupCard.tsx
│   │   ├── GroupInvite.tsx
│   │   └── ConflictWarning.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── lib/                          # Utilities & configs
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── validations.ts            # Zod schemas
│   ├── utils.ts                  # Helper functions
│   └── translations.ts           # i18n translations
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useTimetable.ts
│   └── useGroups.ts
├── store/                        # Zustand stores (if needed)
│   └── timetableStore.ts
├── types/                        # TypeScript types
│   ├── user.ts
│   ├── session.ts
│   ├── timetable.ts
│   └── group.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
├── public/                       # Static assets
│   ├── images/
│   └── fonts/
├── .env.local                    # Environment variables
├── .env.example                  # Example env file
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String    // Hashed with bcrypt
  language     String    @default("en") // "en" | "ar"
  studyMode    String    @default("alone") // "alone" | "companion" | "group"
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  sessions     Session[]
  timetables   Timetable[]
  groupMembers GroupMember[]
  createdGroups Group[] @relation("GroupCreator")
  
  @@map("users")
}

model Session {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime
  startTime   String   // "HH:mm" format
  endTime     String   // "HH:mm" format
  duration    String   // "2hr 30min"
  subject     String
  venue       String
  floor       String?  // Only for Masjid Abii Bakar
  studyMode   String   // "alone" | "companion" | "group"
  groupId     String?  // If part of a group
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  group       Group?   @relation(fields: [groupId], references: [id], onDelete: SetNull)
  timetable   Timetable?
  
  @@index([userId, date])
  @@map("sessions")
}

model Timetable {
  id          String   @id @default(cuid())
  userId      String   @unique
  name        String   @default("My Timetable")
  sessions    Session[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("timetables")
}

model Group {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique // Shareable code
  creatorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  creator     User     @relation("GroupCreator", fields: [creatorId], references: [id])
  members     GroupMember[]
  sessions    Session[]
  
  @@map("groups")
}

model GroupMember {
  id        String   @id @default(cuid())
  groupId   String
  userId    String
  joinedAt  DateTime @default(now())
  
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([groupId, userId])
  @@map("group_members")
}
```

## Key Features Implementation

### 1. Authentication (NextAuth)

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          username: user.username,
          email: user.email,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    }
  }
}

export default NextAuth(authOptions)
```

### 2. Session Booking API

```typescript
// app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sessionSchema } from "@/lib/validations"
import { sendBookingEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = sessionSchema.parse(body)

    const booking = await prisma.session.create({
      data: {
        userId: session.user.id,
        ...validated
      }
    })

    // Send email notification
    await sendBookingEmail(session.user, booking)

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
```

### 3. Timetable Management

```typescript
// app/api/timetable/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const timetable = await prisma.timetable.findUnique({
    where: { userId: session.user.id },
    include: {
      sessions: {
        orderBy: [
          { date: "asc" },
          { startTime: "asc" }
        ]
      }
    }
  })

  return NextResponse.json(timetable)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId } = await req.json()

  // Add session to timetable
  const timetable = await prisma.timetable.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      sessions: {
        connect: { id: sessionId }
      }
    },
    update: {
      sessions: {
        connect: { id: sessionId }
      }
    },
    include: { sessions: true }
  })

  // Check for conflicts
  const conflicts = await checkConflicts(timetable.sessions)

  return NextResponse.json({ timetable, conflicts })
}
```

### 4. Group Features

```typescript
// app/api/groups/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = await req.json()

  const group = await prisma.group.create({
    data: {
      name,
      code: nanoid(8), // Generate shareable code
      creatorId: session.user.id,
      members: {
        create: {
          userId: session.user.id
        }
      }
    },
    include: {
      members: {
        include: { user: true }
      }
    }
  })

  return NextResponse.json(group, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: { userId: session.user.id }
      }
    },
    include: {
      members: { include: { user: true } },
      sessions: true,
      creator: true
    }
  })

  return NextResponse.json(groups)
}
```

### 5. Conflict Detection

```typescript
// lib/utils.ts
export function checkConflicts(sessions: Session[]) {
  const conflicts: Conflict[] = []
  
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const s1 = sessions[i]
      const s2 = sessions[j]
      
      // Same date
      if (s1.date.toDateString() === s2.date.toDateString()) {
        const s1Start = timeToMinutes(s1.startTime)
        const s1End = timeToMinutes(s1.endTime)
        const s2Start = timeToMinutes(s2.startTime)
        const s2End = timeToMinutes(s2.endTime)
        
        // Check overlap
        if (
          (s1Start >= s2Start && s1Start < s2End) ||
          (s1End > s2Start && s1End <= s2End) ||
          (s1Start <= s2Start && s1End >= s2End)
        ) {
          conflicts.push({
            session1: s1,
            session2: s2,
            type: "time_overlap"
          })
        }
      }
    }
  }
  
  return conflicts
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}
```

## Setup Instructions

1. **Initialize Next.js Project**
```bash
npx create-next-app@latest al-murajacah --typescript --tailwind --app
cd al-murajacah
```

2. **Install Dependencies**
```bash
npm install @prisma/client prisma next-auth bcryptjs zod react-hook-form @hookform/resolvers zustand framer-motion lucide-react
npm install -D @types/bcryptjs
```

3. **Setup Prisma**
```bash
npx prisma init
# Configure DATABASE_URL in .env.local
npx prisma migrate dev --name init
npx prisma generate
```

4. **Configure Environment Variables**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/al_murajacah"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="your-resend-api-key"
EMAIL_FROM="noreply@al-murajacah.com"
```

5. **Run Development Server**
```bash
npm run dev
```

## Key Components to Build

1. **Language Selector** - Toggle between English/Arabic
2. **Study Mode Selector** - Alone/Companion/Group
3. **Multi-step Booking Form** - Date → Time → Subject → Venue
4. **Timetable View** - Calendar/grid view of sessions
5. **Group Management** - Create, join, share groups
6. **Conflict Detection** - Visual warnings for overlapping sessions
7. **Arabic RTL Support** - Full right-to-left layout support

## Migration Path

1. Keep current HTML/CSS/JS version running
2. Build Next.js version in parallel
3. Migrate data from localStorage to PostgreSQL
4. Deploy Next.js version
5. Redirect old domain to new version

## Next Steps

1. Set up database and run migrations
2. Implement authentication flow
3. Build core booking functionality
4. Add timetable management
5. Implement group features
6. Add Arabic translations
7. Polish UI/UX
8. Deploy to production
