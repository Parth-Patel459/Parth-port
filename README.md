# News Aggregator

A modern news aggregator application that fetches and displays news articles from various sources using the NewsAPI.

## Features

- Real-time news updates
- Multiple news categories
- Customizable news sources
- Offline support
- Dark mode
- Responsive design
- Push notifications
- Article saving and reading history

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- NewsAPI key (get it from [newsapi.org](https://newsapi.org))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/news-aggregator.git
cd news-aggregator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your NewsAPI key:
```
VITE_NEWS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
news-aggregator/
├── public/                 # Static files
│   ├── news-aggregator/    # News aggregator app
│   ├── assets/            # Images, icons, etc.
│   └── manifest.json      # PWA manifest
├── src/
│   ├── js/               # JavaScript files
│   │   ├── config/      # Configuration files
│   │   ├── services/    # Service files
│   │   └── utils/       # Utility functions
│   └── css/             # CSS files
├── dist/                # Build output
├── package.json         # Project dependencies
└── vite.config.js       # Vite configuration
```

## API Integration

The application uses the NewsAPI to fetch news articles. Make sure to:

1. Sign up for a NewsAPI account at [newsapi.org](https://newsapi.org)
2. Get your API key
3. Add it to the `.env` file

## Service Worker

The application includes a service worker for:
- Offline functionality
- Caching of static assets
- Background sync
- Push notifications

## Testing

Run tests using:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [NewsAPI](https://newsapi.org) for providing the news data
- [Font Awesome](https://fontawesome.com) for icons
- [Vite](https://vitejs.dev) for the build tool 