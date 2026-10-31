# Morning 99 Order Hub Application 
## By: Su Myat Noe 

This is a staff ordering and kitchen display application for a restaurant. Waiters can create table orders with the waiter mode and kitchen can get immediate order requests and track each order through its preparation lifecycle. 
## Waiter View 
<img width="1671" height="929" alt="image" src="https://github.com/user-attachments/assets/c3e6856f-7f14-4a91-a67c-011c080bee97" />
## Kitchen View 
<img width="1674" height="924" alt="image" src="https://github.com/user-attachments/assets/a614c5fc-72f3-4009-8d1d-924787ca7f4e" />

## Features 
** Select a restaurant table before adding menu items.
** Browse menu categories and add items to an order.
** Calculate subtotal, tax, and total in the frontend.
** Submit orders to the backend.
** Display active orders in a kitchen board.
** Move orders through Pending → Preparing → Ready → Completed.
** Refresh kitchen orders automatically using polling every five seconds.
** Delete completed orders and their associated order items from the database.
** Show loading and error feedback during order submission.

## Tech Stack 

**Frontend**: React, TypeScript, Vite 
**Routing**: TanStack Router 
**UI**: Tailwind CSS and shadcn/UI components
**Notifications**: Sooner 
**Backend**: Node.js, Express, TypeScript 
**Database**: SQLite with better-sqlite3

## Architecture
<img width="299" height="362" alt="image" src="https://github.com/user-attachments/assets/ac157b41-073f-4750-a50d-37354dcd2149" />

### Creating an order 
1. The waiter selects a table and adds menu items
2. The frontend creates an order object
3. POST/ api/orders sends the order to the backend
4. The backend inserts the order and its order items into SQLite
5. The kitchen screen retrieves the saved order through GET/ api/orders

### Updating an order 
1. Kitchen staff clicks a status button
2. The frontend sends PATCH /api/orders/:id/status
3. The backend validates the new status and update SQLite
4. The frontend fetches the latest orders and updates REACT state

### Clearing completed orders 
1. Kitchen staff clicks Clear Completed Orders
2. The frontend sends DELETE/ api/orders/completed
3. The backend deletes order items belonging to completed orders, then deletes the completed orders inside a database transaction
4. The frontend fetches the latest order list

### Polling 
The kitchen screen requests the latest orders immediately when it mounts and then every five seconds. 

## API Endpoints 
GET: /api/health: Checks whether the backend is running 
GET: /api/orders: Retrieve orders and their items 
POST: /api/orders: Creates an order 
PATCH: /api/orders/:id/status: Update an order's status 
DELETE: /api/orders/completed: Delete Completed orders and their items 

## Current Development Notes and Limitations 
-- Polling runs every five seconds; it is not push-based real-time communication.
-- The project is configured for local development. localhost API URLs and CORS settings will need to change for deployment.
-- Database initialization currently uses CREATE TABLE IF NOT EXISTS; schema changes should eventually use explicit migrations so fresh and existing databases remain consistent.
-- Completed-order deletion is permanent. There is no archive or recovery feature.
-- Authentication, staff roles, authorization, production security, and deployment configuration still need to be designed.
