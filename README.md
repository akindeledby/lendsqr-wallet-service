# lendsqr-wallet-service

This is a completed assessment project given to me for the role of a backend developer.

# Lendsqr Wallet Service (MVP)

This project is a minimal viable wallet service for **DemoCredit**, a micro-lending platform. It allows users to register, automatically get a wallet, and perform core financial operations: **funding**, **withdrawing**, and **transferring** money. Additionally, it integrates with the **Adjutor Karma Blacklist API** to block blacklisted users.

---

## Tech Stack

- **Node.js** (LTS)
- **TypeScript**
- **Express.js**
- **Knex.js** (ORM)
- **MySQL** (database)
- **Jest** (unit testing)
- **Supertest** (HTTP assertions)
- **Dotenv** (environment config)
- **Axios** (for API calls)
- **Heroku** (deployment target)

---

## Features Implemented

| Feature               | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| User Registration     | Users register with name, email, and BVN                                  |
| Karma Blacklist Check | BVN is validated against the Adjutor Karma API                            |
| Wallet Auto-Creation  | A wallet is created with 0 balance upon registration                      |
| Fund Wallet           | Users can fund their wallet using `POST /wallet/fund`                     |
| Withdraw Funds        | Users can withdraw from their wallet using `POST /wallet/withdraw`        |
| Transfer Funds        | Users can transfer to another user’s wallet using `POST /wallet/transfer` |
| Transactions Logging  | All transactions are logged to the `transactions` table                   |
| Unit Tests            | Tests for user registration and wallet operations                         |
| Mocked Karma API      | Jest mock for blacklist check during tests                                |
| Faux Authentication   | Uses a middleware with `x-user-id` header for simplicity                  |

---

## Architecture & Design Choices

- **Modular Structure**: Routes, controllers, karmaServices, and middleware are separated for scalability.
- **Transactions**: All monetary operations are wrapped in atomic database transactions.
- **Central Middleware**: Blacklist validation and user injection handled before reaching business logic.
- **Environment Safety**: Sensitive credentials handled via `.env` and not hardcoded.

---

## Folder Structure

lendsqr-wallet/
├── src/
│ ├── controllers/ # Route handlers (e.g. registerUser, fundWallet)
│ ├── db/ # Knex config and db instance
│ ├── middleware/ # Faux auth and Karma blacklist check
│ ├── routes/ # Express routes
│ ├── karmaServices/ # External API services (e.g. karmaService)
│ ├── types/ # Custom TS types
│ └── index.ts # App entry point
├── migrations/ # Knex migration files
├── tests/ # Jest + Supertest test suites
├── .env # Environment variables
├── knexfile.ts # Knex environment config
├── jest.config.js # Jest config
├── package.json # all dependencies and devdependencies
├── tsconfig.json # Typescript config
└── README.md # You're here

## Database Design (E-R Diagram)

View it here: [ER Diagram on dbdesigner.net](https://app.dbdesigner.net/designer/schema/your-link-here)

### Entities

#### `users`

| Field      | Type      | Notes          |
| ---------- | --------- | -------------- |
| id         | int, PK   | auto-increment |
| name       | varchar   | required       |
| email      | varchar   | unique         |
| bvn        | varchar   | unique         |
| created_at | timestamp | default now    |

#### `wallets`

| Field      | Type          | Notes                 |
| ---------- | ------------- | --------------------- |
| id         | int, PK       | auto-increment        |
| user_id    | int, FK       | references `users.id` |
| balance    | decimal(14,2) | default `0.00`        |
| created_at | timestamp     | default now           |

#### `transactions`

| Field       | Type          | Notes                    |
| ----------- | ------------- | ------------------------ |
| id          | int, PK       | auto-increment           |
| sender_id   | int, FK       | nullable (for FUND)      |
| receiver_id | int, FK       | nullable (for WITHDRAW)  |
| amount      | decimal(14,2) | required                 |
| type        | enum          | FUND, WITHDRAW, TRANSFER |
| description | text          | transaction description  |
| created_at  | timestamp     | default now              |

---

## Karma Blacklist API Integration

- Endpoint: `GET https://adjutor.lendsqr.com/v2/verification/karma/:bvn`
- Each registration and transaction checks if the BVN is blacklisted.
- If blacklisted, the user is blocked (`403 Forbidden`).

---

## API Endpoints

| Method | Route              | Description                | Auth Required |
| ------ | ------------------ | -------------------------- | ------------- |
| POST   | `/register`        | Register user + wallet     | No required   |
| POST   | `/wallet/fund`     | Fund wallet                | (x-user-id)   |
| POST   | `/wallet/withdraw` | Withdraw from wallet       | (x-user-id)   |
| POST   | `/wallet/transfer` | Transfer to another wallet | (x-user-id)   |

---

## Running Tests

```bash
npm run test

```

You can view the E-R Diagram here: https://erd.dbdesigner.net/designer/schema/1752690070-lendsql-wallet-service
