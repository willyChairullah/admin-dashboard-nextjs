I want to create a CRUD page from this database:

## Database

```
new model like deliverynotes
```

## Reference

Consistance layout and style will reference the folder page "/sales/surat-jalan"
Use custom UI from Components/UI

## application flow:

1.Sales Order Created.
2.PO Created.
3.Invoice Created.
4a.Delivery Created
4b.Make delivery notes if needed
5b.Delivery Created
6.Payment an invoice.

## I want to make flow number 5

In the Sidebar Page, it will be named the "Pengiriman" module. The page created will be placed at the path "sales/pengiriman" and read on layout.tsx will contain this data:
const myStaticData = {
module: "sales",
subModule: "pengiriman",
allowedRole: ["OWNER", "HELPER"],
data: await getData(), // adjust according to the data retrieval
};

### Main Features:

Helper can Choose invoce was status sended.
Helper can update that invoice status between Successfully Delivered or Returned.

### Data Storage:

Save to new database and update invoice status

### Example Scenarios:

The helper will send the goods after receiving the invoice. They can access the invoice along with its details, which are visible to the helper. On the same page, the helper can also update the invoice status to either "Successfully Delivered" or "Returned."

Make everything complete so that it can CRUD the data.
