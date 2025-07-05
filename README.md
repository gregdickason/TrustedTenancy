# TrustedTenancy - MVP

A comprehensive AI-powered Software-as-a-Service (SaaS) platform designed specifically for the Australian rental property market.

## Features (MVP)

### Core Functionality
- Property listing creation and management
- Property browsing and search
- Tenant-landlord communication
- Responsive design for mobile and desktop

### Technical Stack
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18 or later
- PostgreSQL database (or use Prisma dev database)
- npm

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   └── properties/   # Property management
│   ├── landlords/        # Landlord property listing
│   ├── properties/       # Property browsing
│   └── layout.tsx        # Root layout
├── lib/
│   ├── auth.ts           # Authentication configuration
│   └── db.ts             # Database configuration
└── prisma/
    └── schema.prisma     # Database schema
```

## API Routes

### Properties
- `GET /api/properties` - List all properties (with filtering)
- `POST /api/properties` - Create a new property
- `GET /api/properties/[id]` - Get property details
- `PUT /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property

### Inquiries
- `POST /api/properties/[id]/inquiries` - Create inquiry
- `GET /api/properties/[id]/inquiries` - Get property inquiries (landlord only)

## Database Schema

### Key Models
- **User**: Authentication and user profiles
- **Property**: Property listings with location, pricing, and features
- **PropertyImage**: Property photos and media
- **Inquiry**: Tenant inquiries about properties

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
- Set up production database (PostgreSQL)
- Configure OAuth providers
- Set production URLs

## Features Roadmap

### Phase 2 (Next Release)
- [ ] Image upload functionality
- [ ] Advanced search filters
- [ ] User authentication UI
- [ ] Email notifications
- [ ] Property application system

### Phase 3 (Future)
- [ ] Payment integration
- [ ] Lease management
- [ ] Maintenance requests
- [ ] Advanced analytics
- [ ] AI-powered recommendations

## Development

### Building for Production
```bash
npm run build
```

### Database Operations
```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Greg Dickason

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, email support@trustedtenancy.com.au or create an issue on GitHub.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Authentication powered by [NextAuth.js](https://next-auth.js.org/)
- Database management with [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)