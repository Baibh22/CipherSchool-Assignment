const Assignment = require('../models/Assignment');
require('dotenv').config();

const sampleAssignments = [
  {
    title: "Basic SELECT Query",
    description: "Easy",
    question: "Write a SQL query to select all columns from the 'users' table.",
    sampleTables: [
      {
        tableName: "users",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "email", dataType: "TEXT" },
          { columnName: "age", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "John Doe", email: "john@example.com", age: 25 },
          { id: 2, name: "Jane Smith", email: "jane@example.com", age: 30 },
          { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 35 },
          { id: 4, name: "Alice Brown", email: "alice@example.com", age: 28 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 1, name: "John Doe", email: "john@example.com", age: 25 },
        { id: 2, name: "Jane Smith", email: "jane@example.com", age: 30 },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 35 },
        { id: 4, name: "Alice Brown", email: "alice@example.com", age: 28 }
      ]
    },
    hints: [
      { level: 1, content: "Use the SELECT statement to retrieve data from a table." },
      { level: 2, content: "The asterisk (*) symbol selects all columns from a table." },
      { level: 3, content: "Don't forget to specify the table name after FROM." }
    ],
    tags: ["SELECT", "basic", "beginner"]
  },
  
  {
    title: "Filter with WHERE Clause",
    description: "Easy",
    question: "Find all users who are older than 30 years.",
    sampleTables: [
      {
        tableName: "users",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "email", dataType: "TEXT" },
          { columnName: "age", dataType: "INTEGER" }
        ],
        rows: [
          { id: 1, name: "John Doe", email: "john@example.com", age: 25 },
          { id: 2, name: "Jane Smith", email: "jane@example.com", age: 30 },
          { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 35 },
          { id: 4, name: "Alice Brown", email: "alice@example.com", age: 28 },
          { id: 5, name: "Charlie Wilson", email: "charlie@example.com", age: 42 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 35 },
        { id: 5, name: "Charlie Wilson", email: "charlie@example.com", age: 42 }
      ]
    },
    hints: [
      { level: 1, content: "Use the WHERE clause to filter rows based on conditions." },
      { level: 2, content: "The greater than operator (>) can be used to compare numbers." },
      { level: 3, content: "Structure: SELECT columns FROM table WHERE condition;" }
    ],
    tags: ["WHERE", "filtering", "comparison"]
  },
  
  {
    title: "Count Records",
    description: "Easy",
    question: "Count the total number of products in the inventory.",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "price", dataType: "REAL" },
          { columnName: "category", dataType: "TEXT" }
        ],
        rows: [
          { id: 1, name: "Laptop", price: 999.99, category: "Electronics" },
          { id: 2, name: "Mouse", price: 25.50, category: "Electronics" },
          { id: 3, name: "Desk Chair", price: 150.00, category: "Furniture" },
          { id: 4, name: "Monitor", price: 300.00, category: "Electronics" },
          { id: 5, name: "Keyboard", price: 75.00, category: "Electronics" }
        ]
      }
    ],
    expectedOutput: {
      type: "single_value",
      value: 5
    },
    hints: [
      { level: 1, content: "Use the COUNT() function to count rows." },
      { level: 2, content: "COUNT(*) counts all rows in a table." },
      { level: 3, content: "Aggregate functions like COUNT() return a single value." }
    ],
    tags: ["COUNT", "aggregate", "functions"]
  },
  
  {
    title: "JOIN Two Tables",
    description: "Medium",
    question: "List all orders with customer names. Show order ID, customer name, and order date.",
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "email", dataType: "TEXT" }
        ],
        rows: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
          { id: 3, name: "Bob Johnson", email: "bob@example.com" }
        ]
      },
      {
        tableName: "orders",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "order_date", dataType: "DATE" },
          { columnName: "total", dataType: "REAL" }
        ],
        rows: [
          { id: 101, customer_id: 1, order_date: "2024-01-15", total: 250.00 },
          { id: 102, customer_id: 2, order_date: "2024-01-16", total: 150.00 },
          { id: 103, customer_id: 1, order_date: "2024-01-17", total: 300.00 },
          { id: 104, customer_id: 3, order_date: "2024-01-18", total: 75.00 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 101, name: "John Doe", order_date: "2024-01-15" },
        { id: 102, name: "Jane Smith", order_date: "2024-01-16" },
        { id: 103, name: "John Doe", order_date: "2024-01-17" },
        { id: 104, name: "Bob Johnson", order_date: "2024-01-18" }
      ]
    },
    hints: [
      { level: 1, content: "Use JOIN to combine data from multiple tables." },
      { level: 2, content: "Match the customer_id in orders table with id in customers table." },
      { level: 3, content: "INNER JOIN syntax: SELECT columns FROM table1 INNER JOIN table2 ON condition;" }
    ],
    tags: ["JOIN", "INNER JOIN", "relationships"]
  },
  
  {
    title: "Group By and Having",
    description: "Hard",
    question: "Find categories that have more than 2 products and show the category name with the count of products.",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "price", dataType: "REAL" },
          { columnName: "category", dataType: "TEXT" }
        ],
        rows: [
          { id: 1, name: "Laptop", price: 999.99, category: "Electronics" },
          { id: 2, name: "Mouse", price: 25.50, category: "Electronics" },
          { id: 3, name: "Desk Chair", price: 150.00, category: "Furniture" },
          { id: 4, name: "Monitor", price: 300.00, category: "Electronics" },
          { id: 5, name: "Keyboard", price: 75.00, category: "Electronics" },
          { id: 6, name: "Table", price: 200.00, category: "Furniture" },
          { id: 7, name: "Headphones", price: 100.00, category: "Electronics" },
          { id: 8, name: "Bookshelf", price: 120.00, category: "Furniture" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { category: "Electronics", product_count: 5 },
        { category: "Furniture", product_count: 3 }
      ]
    },
    hints: [
      { level: 1, content: "Use GROUP BY to group rows by category." },
      { level: 2, content: "Use COUNT() to count products in each group." },
      { level: 3, content: "Use HAVING to filter groups (not WHERE for aggregate conditions)." },
      { level: 4, content: "HAVING comes after GROUP BY and filters the grouped results." }
    ],
    tags: ["GROUP BY", "HAVING", "COUNT", "aggregate"]
  }
];

const seedAssignments = async () => {
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🌱 Starting to seed assignments...');
    
    await Assignment.deleteMany({});
    console.log('🗑️ Cleared existing assignments');
    
    const insertedAssignments = await Assignment.insertMany(sampleAssignments);
    console.log(`✅ Successfully inserted ${insertedAssignments.length} assignments`);
    
    insertedAssignments.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.title} (${assignment.description})`);
    });
    
    console.log('🎉 Database seeding completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAssignments();
}

module.exports = { sampleAssignments, seedAssignments };