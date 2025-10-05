// ============================================================================
// SNOWFLAKE CONFIGURATION
// ============================================================================

// This object contains all the information needed to connect to Snowflake
// All values come from environment variables set in Heroku
const snowflakeConfig = {
  account: process.env.SNOWFLAKE_ACCOUNT,        // e.g., "abc12345" or "abc12345.us-east-1.aws"
  username: process.env.SNOWFLAKE_USERNAME,      // Your Snowflake username
  password: process.env.SNOWFLAKE_PASSWORD,      // Your Snowflake password
  database: process.env.SNOWFLAKE_DATABASE,      // Database name (e.g., "MY_DATABASE")
  schema: process.env.SNOWFLAKE_SCHEMA,          // Schema name (e.g., "PUBLIC")
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,    // Warehouse name (e.g., "COMPUTE_WH")
  role: process.env.SNOWFLAKE_ROLE               // Role name (e.g., "PUBLIC")
};

// ============================================================================
// VALIDATE ENVIRONMENT VARIABLES
// ============================================================================

/**
 * ============================================================================
 * TABLEAU SNOWFLAKE EXTENSION - SERVER
 * ============================================================================
 * 
 * This is the main Node.js server that provides the backend API for the 
 * Tableau Dashboard Extension. It handles all communication with Snowflake.
 * 
 * WHAT THIS FILE DOES:
 * - Creates a web server using Express.js
 * - Connects to Snowflake database
 * - Provides API endpoints for table operations (create, read, update, delete)
 * - Validates environment variables on startup
 * 
 * IMPORTANT: This file runs on Heroku, not on your local machine
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORT REQUIRED PACKAGES
// ============================================================================

const express = require('express');           // Web server framework
const cors = require('cors');                 // Allow cross-origin requests
const snowflake = require('snowflake-sdk');   // Snowflake database driver
const path = require('path');                 // File path utilities

// Load environment variables from .env file (for local development only)
// In Heroku, these are set via the dashboard or CLI
require('dotenv').config();

// ============================================================================
// INITIALIZE EXPRESS SERVER
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;  // Heroku sets PORT automatically

// ============================================================================
// CONFIGURE MIDDLEWARE
// ============================================================================

// Enable CORS - allows the extension to call this API from Tableau
app.use(cors());

// Parse JSON request bodies - allows us to receive JSON data from the frontend
app.use(express.json());

// Serve static files from 'public' folder - this serves index.html and manifest.trex
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// VALIDATE ENVIRONMENT VARIABLES
// ============================================================================

// Check that all required environment variables are set
// If any are missing, the server will exit with an error message
const requiredEnvVars = ['SNOWFLAKE_ACCOUNT', 'SNOWFLAKE_USERNAME', 'SNOWFLAKE_PASSWORD', 'SNOWFLAKE_DATABASE'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set these environment variables and restart the app.');
  console.error('Run: heroku config:set VARIABLE_NAME=value');
  process.exit(1);  // Exit the application
}

// Log successful configuration (without showing password)
console.log('✅ Snowflake configuration loaded:', {
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new Snowflake connection
 * @returns {Object} Snowflake connection object
 */
function createConnection() {
  try {
    return snowflake.createConnection(snowflakeConfig);
  } catch (error) {
    console.error('❌ Failed to create Snowflake connection:', error);
    throw error;
  }
}

/**
 * Execute a SQL query on Snowflake
 * @param {Object} connection - Snowflake connection object
 * @param {String} sqlText - SQL query to execute
 * @param {Array} binds - Array of values to bind to the query (for parameterized queries)
 * @returns {Promise<Array>} Promise that resolves with query results
 */
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

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * ENDPOINT: POST /api/create-table
 * 
 * PURPOSE: Creates a new table in Snowflake
 * 
 * REQUEST BODY:
 * {
 *   tableName: "MY_TABLE",
 *   columns: [
 *     { name: "ID", type: "INTEGER" },
 *     { name: "NAME", type: "VARCHAR(255)" }
 *   ]
 * }
 * 
 * RESPONSE:
 * { success: true, message: "Table MY_TABLE created successfully" }
 * 
 * ERROR RESPONSE:
 * { error: "Error message here" }
 */
app.post('/api/create-table', async (req, res) => {
  console.log('📝 Create table request received:', req.body);
  
  const { tableName, columns } = req.body;
  
  // Validate request data
  if (!tableName || !columns || columns.length === 0) {
    console.error('❌ Invalid request: missing tableName or columns');
    return res.status(400).json({ error: 'Table name and columns are required' });
  }

  let connection;
  
  try {
    // Step 1: Create connection to Snowflake
    console.log('🔌 Creating Snowflake connection...');
    connection = createConnection();
    
    // Step 2: Connect to Snowflake
    console.log('🤝 Connecting to Snowflake...');
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) {
          console.error('❌ Snowflake connection failed:', err);
          reject(err);
        } else {
          console.log('✅ Successfully connected to Snowflake');
          resolve(conn);
        }
      });
    });

    // Step 3: Set the database, schema, and warehouse context
    // This tells Snowflake which database and schema to use for this session
    const useDbSQL = `USE DATABASE ${process.env.SNOWFLAKE_DATABASE}`;
    const useSchemaSQL = `USE SCHEMA ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`;
    const useWarehouseSQL = `USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE}`;
    
    console.log('🏢 Setting database context:', useDbSQL);
    await executeQuery(connection, useDbSQL);
    
    console.log('📂 Setting schema context:', useSchemaSQL);
    await executeQuery(connection, useSchemaSQL);
    
    console.log('🏭 Setting warehouse context:', useWarehouseSQL);
    await executeQuery(connection, useWarehouseSQL);

    // Step 4: Build the CREATE TABLE SQL statement
    // Example: CREATE OR REPLACE TABLE MY_TABLE (ID INTEGER, NAME VARCHAR(255))
    const columnDefinitions = columns.map(col => 
      `${col.name.toUpperCase()} ${col.type.toUpperCase()}`
    ).join(', ');
    
    const createTableSQL = `CREATE OR REPLACE TABLE ${tableName.toUpperCase()} (${columnDefinitions})`;
    console.log('📄 Executing SQL:', createTableSQL);
    
    // Step 5: Execute the CREATE TABLE statement
    await executeQuery(connection, createTableSQL);
    
    console.log('✅ Table created successfully:', tableName);
    res.json({ success: true, message: `Table ${tableName} created successfully` });
    
  } catch (error) {
    console.error('❌ Error in create-table endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to create table: ' + (error.message || error),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Always close the connection when done
    if (connection) {
      console.log('🔌 Closing Snowflake connection...');
      connection.destroy();
    }
  }
});

// Get table data
app.get('/api/table/:tableName', async (req, res) => {
  const { tableName } = req.params;
  let connection;
  
  try {
    connection = createConnection();
    
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    // Set context
    await executeQuery(connection, `USE DATABASE ${process.env.SNOWFLAKE_DATABASE}`);
    await executeQuery(connection, `USE SCHEMA ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`);
    await executeQuery(connection, `USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE}`);

    const selectSQL = `SELECT * FROM ${tableName.toUpperCase()}`;
    const rows = await executeQuery(connection, selectSQL);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: 'Failed to fetch table data: ' + error.message });
  } finally {
    if (connection) connection.destroy();
  }
});

// Insert rows into table
app.post('/api/table/:tableName/insert', async (req, res) => {
  const { tableName } = req.params;
  const { rows } = req.body;
  
  if (!rows || rows.length === 0) {
    return res.status(400).json({ error: 'Rows data is required' });
  }

  let connection;
  
  try {
    connection = createConnection();
    
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    // Set context
    await executeQuery(connection, `USE DATABASE ${process.env.SNOWFLAKE_DATABASE}`);
    await executeQuery(connection, `USE SCHEMA ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`);
    await executeQuery(connection, `USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE}`);

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
    if (connection) connection.destroy();
  }
});

// Get table structure
app.get('/api/table/:tableName/structure', async (req, res) => {
  const { tableName } = req.params;
  let connection;
  
  try {
    connection = createConnection();
    
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    // Set context
    await executeQuery(connection, `USE DATABASE ${process.env.SNOWFLAKE_DATABASE}`);
    await executeQuery(connection, `USE SCHEMA ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`);
    await executeQuery(connection, `USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE}`);

    const describeSQL = `DESCRIBE TABLE ${tableName.toUpperCase()}`;
    const structure = await executeQuery(connection, describeSQL);
    
    res.json({ success: true, structure: structure });
  } catch (error) {
    console.error('Error getting table structure:', error);
    res.status(500).json({ error: 'Failed to get table structure: ' + error.message });
  } finally {
    if (connection) connection.destroy();
  }
});

// Update a specific row
app.put('/api/table/:tableName/update/:rowIndex', async (req, res) => {
  const { tableName, rowIndex } = req.params;
  const { data } = req.body;
  
  if (!data) {
    return res.status(400).json({ error: 'Update data is required' });
  }

  let connection;
  
  try {
    connection = createConnection();
    
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    // Set context
    await executeQuery(connection, `USE DATABASE ${process.env.SNOWFLAKE_DATABASE}`);
    await executeQuery(connection, `USE SCHEMA ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`);
    await executeQuery(connection, `USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE}`);

    // First, get the current data to find the row to update
    // Note: This is a simplified approach. In production, you'd want to use a proper primary key
    const selectSQL = `SELECT * FROM ${tableName.toUpperCase()}`;
    const rows = await executeQuery(connection, selectSQL);
    
    if (parseInt(rowIndex) >= rows.length) {
      return res.status(400).json({ error: 'Row index out of range' });
    }
    
    const targetRow = rows[parseInt(rowIndex)];
    
    // Create UPDATE statement
    const updateColumns = Object.keys(data).map(key => 
      `${key.toUpperCase()} = ?`
    ).join(', ');
    
    // Use all original columns as WHERE conditions to identify the specific row
    const whereConditions = Object.keys(targetRow).map(key => 
      targetRow[key] === null ? `${key} IS NULL` : `${key} = ?`
    ).join(' AND ');
    
    const whereValues = Object.values(targetRow).filter(val => val !== null);
    
    const updateSQL = `UPDATE ${tableName.toUpperCase()} SET ${updateColumns} WHERE ${whereConditions}`;
    
    console.log('🔄 Executing UPDATE:', updateSQL);
    
    await executeQuery(connection, updateSQL, [...Object.values(data), ...whereValues]);
    
    res.json({ success: true, message: 'Row updated successfully' });
    
  } catch (error) {
    console.error('Error updating row:', error);
    res.status(500).json({ error: 'Failed to update row: ' + error.message });
  } finally {
    if (connection) connection.destroy();
  }
});

// Delete a specific row
app.delete('/api/table/:tableName/delete/:rowIndex', async (req, res) => {
  const { tableName, rowIndex } = req.params;

  let connection;
  
  try {
    connection = createConnection();
    
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    // Set context
    await executeQuery(connection, `USE DATABASE ${process.env.SNOWFLAKE_DATABASE}`);
    await executeQuery(connection, `USE SCHEMA ${process.env.SNOWFLAKE_SCHEMA || 'PUBLIC'}`);
    await executeQuery(connection, `USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE}`);

    // First, get the current data to find the row to delete
    const selectSQL = `SELECT * FROM ${tableName.toUpperCase()}`;
    const rows = await executeQuery(connection, selectSQL);
    
    if (parseInt(rowIndex) >= rows.length) {
      return res.status(400).json({ error: 'Row index out of range' });
    }
    
    const targetRow = rows[parseInt(rowIndex)];
    
    // Create DELETE statement using all columns as WHERE conditions
    const whereConditions = Object.keys(targetRow).map(key => 
      targetRow[key] === null ? `${key} IS NULL` : `${key} = ?`
    ).join(' AND ');
    
    const whereValues = Object.values(targetRow).filter(val => val !== null);
    
    const deleteSQL = `DELETE FROM ${tableName.toUpperCase()} WHERE ${whereConditions}`;
    
    console.log('🗑️ Executing DELETE:', deleteSQL);
    
    await executeQuery(connection, deleteSQL, whereValues);
    
    res.json({ success: true, message: 'Row deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ error: 'Failed to delete row: ' + error.message });
  } finally {
    if (connection) connection.destroy();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏠 Access the app at: http://localhost:${PORT}`);
});