The user creator is automatically taken from user.id, and below the management form, the name of the form creator will appear if user.role == OWNER.

Next, for the Deadline, a date will appear if the paymentDeadline column is not null and will display "pay immediately" if it is null.

After selecting an order, I want to have a div containing specific customer information that can be opened or closed with a button, which will display information retrieved from the customer table through the relationship from the order's customerId column.

For the PO Item, I want it to be in the form of a table.

Additionally, for the total, please add calculations above it as follows:

Total Discount: -> taken from the discount in the orders or orderItems table.
Total Tax: -> for now, create a dropdown with options of 0% and 12%.
Shipping: -> taken from the shippingCost column in the Orders table.
Total Payment: -> the overall total of everything.