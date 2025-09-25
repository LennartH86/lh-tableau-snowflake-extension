const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Snowflake connection configuration
const snowflakeConfig = {
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  role: process.env.SNOWFLAKE_ROLE
};

// Helper function to create Snowflake connection
function createConnection() {
  return snowflake.createConnection(snowflakeConfig);
}

// Helper function to execute SQL queries
function executeQuery(connection, sqlText, binds = []) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sqlText,
      binds: binds,
      complete: function(err, stmt, rows) {
        if (err) {
          console.error('Failed to execute statement due to the following error: ' + err.message);
          reject(err);
        } else {
          console.log('Successfully executed statement: ' + stmt.getSqlText());
          resolve(rows);
        }
      }
    });
  });
}

// API Routes

// Create a new table
app.post('/api/create-table', async (req, res) => {
  const { tableName, columns } = req.body;
  
  if (!tableName || !columns || columns.length === 0) {
    return res.status(400).json({ error: 'Table name and columns are required' });
  }

  const connection = createConnection();
  
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    // Build CREATE TABLE statement
    const columnDefinitions = columns.map(col => 
      `${col.name.toUpperCase()} ${col.type.toUpperCase()}`
    ).join(', ');
    
    const createTableSQL = `CREATE OR REPLACE TABLE ${tableName.toUpperCase()} (${columnDefinitions})`;
    
    await executeQuery(connection, createTableSQL);
    
    res.json({ success: true, message: `Table ${tableName} created successfully` });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ error: 'Failed to create table: ' + error.message });
  } finally {
    connection.destroy();
  }
});

// Get table data
app.get('/api/table/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const connection = createConnection();
  
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    const selectSQL = `SELECT * FROM ${tableName.toUpperCase()}`;
    const rows = await executeQuery(connection, selectSQL);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: 'Failed to fetch table data: ' + error.message });
  } finally {
    connection.destroy();
  }
});

// Insert rows into table
app.post('/api/table/:tableName/insert', async (req, res) => {
  const { tableName } = req.params;
  const { rows } = req.body;
  
  if (!rows || rows.length === 0) {
    return res.status(400).json({ error: 'Rows data is required' });
  }

  const connection = createConnection();
  
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    // Insert each row
    for (const row of rows) {
      const columns = Object.keys(row).map(key => key.toUpperCase()).join(', ');
      const values = Object.values(row).map(() => '?').join(', ');
      const insertSQL = `INSERT INTO ${tableName.toUpperCase()} (${columns}) VALUES (${values})`;
      
      await executeQuery(connection, insertSQL, Object.values(row));
    }
    
    res.json({ success: true, message: `${rows.length} rows inserted successfully` });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Failed to insert data: ' + error.message });
  } finally {
    connection.destroy();
  }
});

// Get table structure
app.get('/api/table/:tableName/structure', async (req, res) => {
  const { tableName } = req.params;
  const connection = createConnection();
  
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    const describeSQL = `DESCRIBE TABLE ${tableName.toUpperCase()}`;
    const structure = await executeQuery(connection, describeSQL);
    
    res.json({ success: true, structure: structure });
  } catch (error) {
    console.error('Error getting table structure:', error);
    res.status(500).json({ error: 'Failed to get table structure: ' + error.message });
  } finally {
    connection.destroy();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});