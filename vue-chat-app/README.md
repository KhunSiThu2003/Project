# Chat App

A modern real-time chat application built with Vue 3, Firebase, and Tailwind CSS.

## Features

- Real-time messaging
- User authentication
- Friend system
- Message management (edit, delete, pin)
- Dark mode support
- Internationalization (English, Spanish, French)
- Responsive design
- Admin dashboard

## Tech Stack

- Vue 3 (Composition API)
- Firebase (Authentication, Firestore, Storage)
- Pinia (State Management)
- Vue Router
- Tailwind CSS
- Vue I18n
- SweetAlert2

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
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
src/
├── assets/          # Static assets
├── components/      # Reusable components
├── composables/     # Vue composables
├── firebase/        # Firebase configuration
├── locales/         # i18n translations
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
└── views/           # Page components
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
