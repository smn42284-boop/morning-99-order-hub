# Morning 99 Order Hub

Build a modern, clean, mobile-first web app for a restaurant named "Morning 99". 

The app is designed for restaurant staff and operates in two main modes (which can be switched via a top navigation bar or drawer):

1. WAITER / ORDER MODE (Default View):

   - Header displaying "Morning 99 - New Order".

   - Table Selection: A dropdown or visual grid to select the Table Number (Tables 1–12).

   - Category Tabs: "Breakfast", "Coffee & Drinks", "Specials", "Desserts".

   - Item Grid: Show menu cards with item titles, prices, and an "Add to Order" button. 

     (e.g., "99 Morning Set - $8.50", "Signature Iced Latte - $4.00", "Avocado Toast - $6.50").

   - Order Summary Panel (Sidebar or Drawer): Shows added items, quantities (+/- buttons), subtotal, tax, and total.

   - "Submit Order to Kitchen" Button: Saves the order details into browser `localStorage` under the key `morning99_orders` with a default status of "Pending" and a timestamp. Show a success toast message upon submission.

2. KITCHEN / DISPLAY MODE:

   - Header displaying "Morning 99 - Kitchen Display System".

   - Order Board: Display incoming orders from `localStorage` arranged in cards or a Kanban-style layout (Columns: Pending, Preparing, Ready).

   - Order Card Details: Shows Table Number, Time Submitted, list of ordered items with quantities, and current status.

   - Action Buttons: Allow staff to tap "Start Preparing" (moves to Preparing) and "Mark Ready" (moves to Ready).

   - "Clear Completed Orders" button to wipe completed orders from local storage.

Design & UI Requirements:

- Use Tailwind CSS and shadcn/ui components.

- A warm, friendly morning aesthetic (soft amber/yellow accents, neutral dark/light background, clean typography).

- Responsive layout optimized for mobile devices and tablet screens.

- All state management must persist across page refreshes using browser `localStorage`.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e8ff1f77-ab9a-40ee-a179-3dc55503b561).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
