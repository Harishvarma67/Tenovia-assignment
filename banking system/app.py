import sqlite3

# Database Initialization
conn = sqlite3.connect('bank.db')
cursor = conn.cursor()

# Create Tables
cursor.execute('''CREATE TABLE IF NOT EXISTS customerss (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE,
                    phone TEXT,
                    address TEXT)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id INTEGER,
                    account_type TEXT,
                    balance REAL DEFAULT 0.0,
                    FOREIGN KEY(customer_id) REFERENCES customerss(id) ON DELETE CASCADE)''')
conn.commit()

# Functions
def create_customer(name, email, phone, address):
    cursor.execute("INSERT INTO customerss (name, email, phone, address) VALUES (?, ?, ?, ?)", 
                   (name, email, phone, address))
    conn.commit()
    
    # Fetch the newly created customer details
    cursor.execute("SELECT id, name, email FROM customerss WHERE email = ?", (email,))
    customer = cursor.fetchone()
    
    # Create a new account for the customer
    cursor.execute("INSERT INTO accounts (customer_id, account_type, balance) VALUES (?, 'savings', 0.0)", 
                   (customer[0],))
    conn.commit()
    
    # Fetch the account details to show balance
    cursor.execute("SELECT id, balance FROM accounts WHERE customer_id = ?", (customer[0],))
    account = cursor.fetchone()
    
    print(f"Customer created successfully. ID: {customer[0]}, Name: {customer[1]}, Email: {customer[2]}, Balance: {account[1]}")

def delete_customer(customer_id):
    cursor.execute("SELECT name, email FROM customerss WHERE id = ?", (customer_id,))
    customer = cursor.fetchone()
    
    if customer:
        cursor.execute("DELETE FROM customerss WHERE id = ?", (customer_id,))
        cursor.execute("DELETE FROM accounts WHERE customer_id = ?", (customer_id,))
        conn.commit()
        print(f"Customer deleted successfully. ID: {customer_id}, Name: {customer[0]}, Email: {customer[1]}")
    else:
        print("Customer not found.")

def deposit_money(account_id, amount):
    cursor.execute("SELECT accounts.id, customerss.name, customerss.email, accounts.balance "
                   "FROM accounts "
                   "JOIN customerss ON accounts.customer_id = customerss.id "
                   "WHERE accounts.id = ?", (account_id,))
    account_details = cursor.fetchone()
    
    if account_details:
        new_balance = account_details[3] + amount
        cursor.execute("UPDATE accounts SET balance = ? WHERE id = ?", (new_balance, account_id))
        conn.commit()
        print(f"Deposit successful. ID: {account_details[0]}, Name: {account_details[1]}, Email: {account_details[2]}, Deposited: {amount}, New Balance: {new_balance}")
    else:
        print("Account not found.")

def withdraw_money(account_id, amount):
    cursor.execute("SELECT accounts.id, customerss.name, customerss.email, accounts.balance "
                   "FROM accounts "
                   "JOIN customerss ON accounts.customer_id = customerss.id "
                   "WHERE accounts.id = ?", (account_id,))
    account_details = cursor.fetchone()
    
    if account_details:
        if account_details[3] >= amount:
            new_balance = account_details[3] - amount
            cursor.execute("UPDATE accounts SET balance = ? WHERE id = ?", (new_balance, account_id))
            conn.commit()
            print(f"Withdrawal successful. ID: {account_details[0]}, Name: {account_details[1]}, Email: {account_details[2]}, Withdrawn: {amount}, New Balance: {new_balance}")
        else:
            print("Insufficient balance.")
    else:
        print("Account not found.")

# Menu Interface
while True:
    print("\nBanking System Menu:")
    print("1. Create Customer")
    print("2. Delete Customer")
    print("3. Deposit Money")
    print("4. Withdraw Money")
    print("5. Exit")
    choice = input("Enter choice: ")
    
    if choice == '1':
        name = input("Enter Name: ")
        email = input("Enter Email: ")
        phone = input("Enter Phone: ")
        address = input("Enter Address: ")
        create_customer(name, email, phone, address)
    elif choice == '2':
        customer_id = int(input("Enter Customer ID: "))
        delete_customer(customer_id)
    elif choice == '3':
        account_id = int(input("Enter Account ID: "))
        amount = float(input("Enter Amount: "))
        deposit_money(account_id, amount)
    elif choice == '4':
        account_id = int(input("Enter Account ID: "))
        amount = float(input("Enter Amount: "))
        withdraw_money(account_id, amount)
    elif choice == '5':
        break
    else:
        print("Invalid choice, try again!")

conn.close()
