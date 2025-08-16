# Good Night Ticketing Service Frontend

A modern Svelte-based frontend for the Good Night ticketing service, featuring a 3x3 seat grid and reservation system.

## Features

- **Interactive Seat Grid**: 3x3 grid showing seat availability
- **Real-time Updates**: Seats update automatically when reserved/purchased
- **Reservation Form**: Collects user information (first name, last name, email)
- **API Integration**: Seamlessly connects with the backend ticketing API
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## API Endpoints Used

The frontend integrates with the following backend endpoints:

- `GET /api/v1/seats` - Fetch all seats and their availability
- `GET /api/v1/seats/:id` - Get specific seat information
- `POST /api/v1/seats/reserve` - Reserve a seat
- `POST /api/v1/seats/buy` - Purchase a reserved seat

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## How It Works

1. **Initial Load**: The app fetches all seats from the backend API
2. **Seat Selection**: Users click on available seats to reserve them
3. **Reservation**: Clicking a seat automatically calls the reserve API
4. **Form Display**: A reservation form appears for the selected seat
5. **Purchase**: Users fill out their information and purchase the seat
6. **Confirmation**: Success message is shown before returning to the grid

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── SeatGrid.svelte      # 3x3 seat grid component
│   │   └── ReservationForm.svelte # User information form
│   └── services/
│       └── api.ts               # API service layer
├── routes/
│   └── +page.svelte            # Main page with seat grid
└── app.css                     # Global styles and Tailwind CSS
```

## Configuration

### API Base URL

The API base URL is configured in `src/lib/services/api.ts`. Update the `API_BASE` constant if your backend runs on a different port or host.

```typescript
const API_BASE = 'http://localhost:8080/api/v1';
```

### Tailwind CSS

The project uses Tailwind CSS v4 with a custom configuration in `tailwind.config.js`. The configuration includes custom colors and animations for the ticketing service.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check and lint
- `npm run format` - Format code with Prettier

### Adding New Features

1. **New Components**: Create Svelte components in `src/lib/components/`
2. **API Integration**: Add new methods to `src/lib/services/api.ts`
3. **Styling**: Use Tailwind CSS classes or add custom CSS in component `<style>` blocks

## Troubleshooting

### Common Issues

1. **API Connection Error**: Ensure your backend is running on the correct port
2. **CORS Issues**: The backend should have CORS enabled for the frontend domain
3. **Seat Not Loading**: Check the backend `/seats` endpoint is working correctly

### Debug Mode

Enable browser developer tools to see console logs and network requests for debugging API calls.

## Contributing

1. Follow the existing code style and structure
2. Add TypeScript types for new interfaces
3. Test API integration thoroughly
4. Ensure responsive design works on mobile devices

## License

This project is part of the Good Night 4th Hackathon.
