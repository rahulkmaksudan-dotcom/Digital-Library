# Quality Assurance & Test Verification Guide
## Digital Library Management System
### Thakur Shree DPS College of Engineering and Management

---

## 1. Automated Backend Unit & Service Tests

Automated tests are implemented using **JUnit 5**, **Mockito**, and **Spring Boot Test**.

### Test Suites:
1. **`FineCalculationTest.java`**:
   - `testOverdueFineCalculation()`: Verifies that a book returned 5 days late at ₹2.00/day correctly generates a ₹10.00 fine.
   - `testZeroFineWhenReturnedOnTime()`: Verifies that books returned on or before scheduled due date accrue ₹0.00 fines.
2. **`LoanServiceTest.java`**:
   - `testIssueBookSuccessfully()`: Verifies that issuing a book decrements `availableCopies` and schedules a return date exactly 10 days in the future.
   - `testIssueBookFailsWhenOutOfStock()`: Ensures an `IllegalStateException` or business error is raised when `availableCopies == 0`.
   - `testReturnBookRestoresInventoryStock()`: Verifies that processing a book return increments `availableCopies` by 1.

### Executing Backend Tests:
```powershell
cd "d:\Library Management\backend"
mvn test
```

#### Verified Results:
```
[INFO] Running com.dps.library.service.FineCalculationTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.dps.library.service.LoanServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Results: Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 2. Automated Frontend Compilation & Build Verification

The React + Vite + TypeScript application undergoes strict type-checking and bundling:

```powershell
cd "d:\Library Management\frontend"
npm run build
```

#### Verified Results:
```
vite v5.4.21 building for production...
✓ 1685 modules transformed.
dist/index.html                   0.86 kB │ gzip:   0.49 kB
dist/assets/index-Ci9brXpS.css   47.43 kB │ gzip:   8.16 kB
dist/assets/index-DH8oX08j.js   552.63 kB │ gzip: 132.76 kB
✓ built in 4.95s
```

---

## 3. End-to-End Functional Test Scenarios

### Scenario A: Student Circulation Flow
1. Navigate to `/login` and sign in with `DPS2023CS001` / `Student@123`.
2. Inspect the **Student Dashboard**: verify KPI cards for Active Loans, Overdue Books, and Fines Dues.
3. Open **My Borrowed Books**: verify that "Introduction to Algorithms" shows an active status with 10-day due date.
4. Navigate to `/catalog`: search for "Tanenbaum" or "Distributed Systems". Click bookmark icon to add book to personal wishlist.
5. Open **My Saved Wishlist**: verify book is displayed.
6. Open **Request a Book**: submit a procurement request for a new textbook; verify it appears as "Under Review".

### Scenario B: Librarian Desk Operations
1. Navigate to `/login` and sign in with `librarian@dpslibrary.edu` / `Librarian@123`.
2. Open **Issue Book Desk**:
   - In Step 1, search for student "Ashish" or "DPS2023CS001".
   - In Step 2, search for textbook "Operating Systems Concepts" (Silberschatz).
   - Verify loan duration defaults to 10 days. Click "Confirm & Issue Book".
   - Verify that book copies decrease by 1 in the catalog inventory.
3. Open **Return Book Desk**:
   - Search for the active loan.
   - Click "Process Return". If returned past due date, verify fine of ₹2.00/day is calculated.
   - Confirm return; verify that available copies increase by 1.
4. Open **Student Book Requests**: approve or reject the request submitted by the student in Scenario A.

### Scenario C: Administrative Oversight & System Tuning
1. Navigate to `/login` and sign in with `admin@dpslibrary.edu` / `Admin@123`.
2. Open **Library System Settings**:
   - Change `fine.rate_per_day` from `2.00` to `3.00`.
   - Click "Save"; verify setting updates immediately.
3. Open **System Security Audit Logs**:
   - Verify every action taken in Scenarios A and B (logins, book issues, returns, and setting updates) is logged with actor name, timestamp, and IP address.
4. Open **CSV Reports & Exports**:
   - Click "Download CSV" for Books Inventory, Loan Circulation, and Fines Ledger. Verify files open in Microsoft Excel with complete tabular records.

