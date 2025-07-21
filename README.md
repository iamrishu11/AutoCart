# AutoCart - Your AI-Powered Shopping Assistant

## Overview

AutoCart is an AI-powered shopping assistant that helps users browse products, make purchases, and track orders seamlessly. It integrates with the **Payman SDK** for secure payments, uses **Supabase** for data storage, and leverages **Google Generative AI** for conversational product search and recommendations. The application supports wallet connectivity via Payman’s OAuth flow, allowing users to manage payments securely.

### Key Features
- **Conversational Product Search**: Use natural language to search for products (e.g., "show me iPhones").
- **Secure Payments**: Integrated with Payman for USD, USDC, or TSD wallet payments.
- **Order Management**: View and track orders and packages.
- **Wallet Connectivity**: Connect your Payman wallet via OAuth for secure transactions.
- **Responsive UI**: Built with React, Tailwind CSS, and shadcn/ui components for a seamless experience on all devices.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express (for OAuth handling)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Generative AI (Gemini API) for conversational product search
- **Payments**: Payman SDK for secure wallet integration and payments
- **Deployment**:
  - Frontend: Hosted on vercel
  - Backend: Hosted on Render

## Prerequisites
Before setting up the project, ensure you have the following:
- **Node.js** (v18 or later)
- **npm** (v9 or later)
- A **Payman Developer Account** (register at `https://app.paymanai.com`)
- A **Supabase Account** and project set up
- A **Google Cloud Account** with access to the Gemini API

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/autocart.git
cd autocart
```

### 2. Install Dependencies
Install the required packages.

```bash
npm install
```

### 3. Configure Environment Variables
Create `.env` files in the following variables:

#### Frontend (`.env`)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_PAYMAN_CLIENT_ID=your-payman-client-id
```

- **Supabase**: Get `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings.
- **Gemini API**: Get `VITE_GEMINI_API_KEY` from your Google Cloud project.
- **Payman**: Get `PAYMAN_CLIENT_SECRET` from your Payman app dashboard after registering your app.

### 4. Set Up Supabase
1. Create the following tables in your Supabase project:
   - `profiles` (user profiles)
   - `orders` (user orders)
   - `packages` (order tracking)
   - `products` (product catalog)
   - `conversations` (chat history)
   - `messages` (chat messages)
   - `user_settings` (notification preferences)
2. Define the schema for each table based on your application’s requirements (refer to `src/integrations/supabase/types.ts` for table definitions).
3. Populate the `products` table with sample data for testing.

## Usage

1. **Sign Up/Log In**: Use Supabase Auth to sign up or log in to the application.
2. **Connect Wallet**:
   - Click "Connect Wallet" in the sidebar.
   - Authenticate with Payman via OAuth to connect your wallet.
3. **Browse Products**:
   - Use the chat interface to search for products (e.g., "show me tech products").
   - Select a product by number (e.g., "first") or name.
4. **Make a Purchase**:
   - Confirm your purchase in the chat.
   - Complete the payment using your connected Payman wallet.
5. **Track Orders**:
   - View your orders and packages in the dashboard.
   - Check the status of your deliveries.



## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For support or inquiries, reach out to [rishankj749@gmail.com](mailto:rishankj749@gmail.com).
