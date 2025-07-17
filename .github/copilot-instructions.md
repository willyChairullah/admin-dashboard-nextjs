Here's an updated and more detailed breakdown, incorporating your new requirements for dummy data, create/edit page functionality, and delete options:

-----

## Page: Invoice / Faktur (sales/invoice) - Enhanced Details

This page will display a list of all invoices in an interactive **Data Table**. This Data Table will provide search and filter functionalities, along with navigation for creating and editing invoices.

### Core Components

This page will utilize existing components from your `components` folder.

### Data Table Elements

Here are the key elements that will be displayed in the Data Table:

  * **Displayed Columns (Important Only):**

      * **Invoice Number:** The unique invoice number. This will function as a **clickable link**.
      * **Customer Name:** The name of the customer associated with the invoice.
      * **Invoice Date:** The date the invoice was created.
      * **Due Date:** The payment due date for the invoice.
      * **Total Amount:** The total amount to be paid on the invoice.
      * **Status:** The current status of the invoice (e.g., `DRAFT`, `SENT`, `PAID`, `OVERDUE`).
      * **(Optional) Remaining Amount:** The outstanding amount yet to be paid.

  * **Search Functionality (Search Input):**

      * A text input field will be available at the top of the Data Table.
      * Users can type in an **Invoice Number** or **Customer Name** to filter results in *real-time* or after pressing enter.

  * **Filter Functionality:**

      * There will be filter options based on **Invoice Status**. This could be a dropdown or checkboxes allowing users to select one or more statuses (e.g., show only "PAID" or "OVERDUE" invoices).
      * **(Optional) Date Range Filter:** Filter by `invoiceDate` or `dueDate` to view invoices within a specific period.

  * **"Add Data" Button:**

      * A clearly visible button, perhaps labeled **"+ Create New Invoice"** or **"Add Invoice"**.
      * When this button is clicked, users will be directed to the new invoice creation page.

### Dummy Data for Display Example

To illustrate the Data Table, here are some dummy invoice data examples:

```json
[
  {
    "id": "inv001",
    "invoiceNumber": "INV-2024-0001",
    "invoiceDate": "2024-07-01",
    "dueDate": "2024-07-31",
    "status": "PAID",
    "subtotal": 150.00,
    "tax": 15.00,
    "totalAmount": 165.00,
    "paidAmount": 165.00,
    "remainingAmount": 0.00,
    "notes": "Payment received via bank transfer.",
    "customerId": "custA",
    "customerName": "PT. Maju Mundur",
    "orderId": "order101"
  },
  {
    "id": "inv002",
    "invoiceNumber": "INV-2024-0002",
    "invoiceDate": "2024-07-05",
    "dueDate": "2024-08-05",
    "status": "SENT",
    "subtotal": 250.50,
    "tax": 25.05,
    "totalAmount": 275.55,
    "paidAmount": 0.00,
    "remainingAmount": 275.55,
    "notes": "Awaiting payment.",
    "customerId": "custB",
    "customerName": "CV. Jaya Abadi",
    "orderId": "order102"
  },
  {
    "id": "inv003",
    "invoiceNumber": "INV-2024-0003",
    "invoiceDate": "2024-06-10",
    "dueDate": "2024-07-10",
    "status": "OVERDUE",
    "subtotal": 75.00,
    "tax": 7.50,
    "totalAmount": 82.50,
    "paidAmount": 0.00,
    "remainingAmount": 82.50,
    "notes": "Follow up required.",
    "customerId": "custC",
    "customerName": "UD. Sejahtera",
    "orderId": "order103"
  },
  {
    "id": "inv004",
    "invoiceNumber": "INV-2024-0004",
    "invoiceDate": "2024-07-15",
    "dueDate": "2024-08-15",
    "status": "DRAFT",
    "subtotal": 120.00,
    "tax": 12.00,
    "totalAmount": 132.00,
    "paidAmount": 0.00,
    "remainingAmount": 132.00,
    "notes": "Invoice for pending order.",
    "customerId": "custA",
    "customerName": "PT. Maju Mundur",
    "orderId": "order104"
  }
]
```

-----

### Page Navigation & Functionality

  * **Create New Invoice Page (`/sales/invoice/create`):**

      * This page will contain a form for creating a new invoice.
      * **Fields:** All relevant fields from your `invoices` model will be present as input fields (e.g., `invoiceNumber`, `invoiceDate`, `dueDate`, `customerId` (likely a dropdown/autocomplete for existing customers), `orderId` (optional, also a dropdown/autocomplete), `notes`).
      * **Invoice Items:** There should be a section to add multiple `invoiceItems` (e.g., product name, quantity, unit price, total for each item). This might involve dynamic "Add Item" buttons.
      * **Automatic Calculation:** `subtotal`, `tax`, `totalAmount`, `remainingAmount` should be calculated automatically based on `invoiceItems` and `paidAmount` input.
      * **Status Default:** `status` will default to `DRAFT`.
      * **Actions:**
          * **"Save" Button:** Submits the form data to create a new invoice entry in the database.
          * **"Cancel" Button:** Navigates back to the main invoice list page (`/sales/invoice`).

  * **Edit Invoice Page (`/sales/invoice/edit/[id]`):**

      * This page will display a form pre-populated with the data of the selected invoice (identified by `id`).
      * **Fields:** All fields from the `invoices` model and `invoiceItems` will be editable.
      * **Automatic Calculation:** Similar to the create page, `subtotal`, `tax`, `totalAmount`, `remainingAmount` should update automatically upon changes.
      * **Actions:**
          * **"Save Changes" Button:** Updates the existing invoice record in the database with the modified data.
          * **"Mark as Paid" Button (Conditional):** If the `status` is not `PAID` and `remainingAmount` is greater than 0, this button could appear to quickly mark the invoice as paid (setting `paidAmount` to `totalAmount` and `status` to `PAID`).
          * **"Delete Invoice" Button:**
              * **Crucially, the "Delete Invoice" button will ONLY be available on this edit page.**
              * When clicked, it should trigger a confirmation dialog (a custom modal, NOT `alert()` or `confirm()`) to prevent accidental deletion.
              * Upon confirmation, the invoice record will be removed from the database, and the user will be redirected back to the main invoice list page (`/sales/invoice`).
          * **"Cancel" Button:** Navigates back to the main invoice list page (`/sales/invoice`) without saving changes.

-----