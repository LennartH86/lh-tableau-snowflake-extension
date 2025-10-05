# 🎯 Tableau Snowflake Extension

> A powerful Tableau Dashboard Extension that enables users to create, manage, and edit Snowflake tables directly from their Tableau dashboards.

![Tableau](https://img.shields.io/badge/Tableau-Extension-blue)
![Snowflake](https://img.shields.io/badge/Snowflake-Connected-00B4E6)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
- [Detailed Setup Instructions](#-detailed-setup-instructions)
  - [1. Getting the Code](#1-getting-the-code)
  - [2. Snowflake Configuration](#2-snowflake-configuration)
  - [3. Heroku Deployment](#3-heroku-deployment)
  - [4. Tableau Setup](#4-tableau-setup)
- [Using the Extension](#-using-the-extension)
- [Troubleshooting](#-troubleshooting)
- [File Structure](#-file-structure)
- [Configuration Reference](#-configuration-reference)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- 🆕 **Create Snowflake Tables** - Define custom tables with various data types directly from Tableau
- 📝 **Add Data** - User-friendly forms to add new rows with data type validation
- ✏️ **Edit Data** - Inline editing of existing rows with save/cancel options
- 🗑️ **Delete Data** - Remove rows with confirmation dialogs
- 🔄 **Table Persistence** - Automatically reconnects to previously created tables
- 📊 **Real-time Sync** - All changes instantly reflected in Snowflake

### User Experience
- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Works on desktop and tablet devices
- 🔍 Debug tools for troubleshooting
- ⚡ Fast and intuitive workflow
- 💾 Pending system - review before saving to database

---

## 🔧 Prerequisites

Before you begin, ensure you have:

### Required Accounts
1. **Snowflake Account** - [Sign up here](https://signup.snowflake.com/)
   - You'll need: Account name, username, password, database, schema, warehouse
   
2. **Heroku Account** - [Sign up here](https://signup.heroku.com/)
   - Free tier is sufficient to get started
   
3. **Tableau Desktop or Server** - Version 2018.2 or later
   - Must support Dashboard Extensions

### Required Software
1. **Git** - [Download here](https://git-scm.com/downloads)
   - For cloning the repository and deploying to Heroku
   
2. **Heroku CLI** - [Download here](https://devcenter.heroku.com/articles/heroku-cli)
   - For deploying and managing your Heroku application

### Optional (for local development)
- **Node.js** (version 18+) - [Download here](https://nodejs.org/)
- **Code Editor** (VS Code, Sublime Text, etc.)

---

## 🚀 Quick Start Guide

**Total Time: ~20 minutes**

### Step 1: Get the Code (2 minutes)
```bash
git clone https://github.com/yourusername/tableau-snowflake-extension.git
cd tableau-snowflake-extension
```

### Step 2: Deploy to Heroku (5 minutes)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Step 3: Configure Environment (3 minutes)
```bash
heroku config:set SNOWFLAKE_ACCOUNT=your-account
heroku config:set SNOWFLAKE_USERNAME=your-username
heroku config:set SNOWFLAKE_PASSWORD=your-password
heroku config:set SNOWFLAKE_DATABASE=your-database
heroku config:set SNOWFLAKE_SCHEMA=PUBLIC
heroku config:set SNOWFLAKE_WAREHOUSE=COMPUTE_WH
```

### Step 4: Setup Tableau (10 minutes)
1. Create parameters: `SNOWFLAKE_TABLE_NAME` and `SNOWFLAKE_TABLE_COLUMNS`
2. Update `manifest.trex` with your Heroku URL
3. Add extension to your dashboard

**🎉 You're ready to go!**

---

## 📚 Detailed Setup Instructions

### 1. Getting the Code

#### Option A: Clone from GitHub (Recommended)

1. **Open your terminal/command prompt**
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - Mac: Press `Cmd + Space`, type "Terminal", press Enter
   - Linux: Press `Ctrl + Alt + T`

2. **Navigate to your projects folder**
   ```bash
   cd ~/Documents/Projects  # Mac/Linux
   cd C:\Users\YourName\Documents\Projects  # Windows
   ```

3. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tableau-snowflake-extension.git
   cd tableau-snowflake-extension
   ```

#### Option B: Download ZIP

1. Go to the GitHub repository page
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your projects folder
5. Open terminal in that folder

---

### 2. Snowflake Configuration

#### 2.1 Find Your Snowflake Account Information

1. **Log in to Snowflake** at your organization's Snowflake URL

2. **Find Your Account Name**
   - Look at your browser URL: `https://ABC12345.snowflakecomputing.com`
   - Your account name is: `ABC12345`
   - If in a different region: `ABC12345.us-east-1.aws`

3. **Note Your Warehouse Name**
   - In Snowflake, go to **Admin** → **Warehouses**
   - Common name: `COMPUTE_WH` or `WH_TABLEAU`

4. **Note Your Database and Schema**
   - In the left panel, expand **Databases**
   - Note the database name (e.g., `MY_DATABASE`)
   - Expand it and note the schema (usually `PUBLIC`)

#### 2.2 Create Dedicated User (Recommended)

For security, create a dedicated user for this extension:

```sql
-- Run these commands in Snowflake

-- 1. Create the user
CREATE USER tableau_extension_user
PASSWORD = 'YourSecurePassword123!'
DEFAULT_ROLE = 'PUBLIC'
DEFAULT_WAREHOUSE = 'COMPUTE_WH';

-- 2. Grant necessary permissions
GRANT ROLE PUBLIC TO USER tableau_extension_user;
GRANT USAGE ON WAREHOUSE COMPUTE_WH TO USER tableau_extension_user;
GRANT USAGE ON DATABASE MY_DATABASE TO USER tableau_extension_user;
GRANT USAGE ON SCHEMA MY_DATABASE.PUBLIC TO USER tableau_extension_user;

-- 3. Grant table operations
GRANT CREATE TABLE ON SCHEMA MY_DATABASE.PUBLIC TO USER tableau_extension_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA MY_DATABASE.PUBLIC TO USER tableau_extension_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON FUTURE TABLES IN SCHEMA MY_DATABASE.PUBLIC TO USER tableau_extension_user;
```

**Important**: Replace `MY_DATABASE`, `PUBLIC`, and `COMPUTE_WH` with your actual values.

---

### 3. Heroku Deployment

#### 3.1 Install Heroku CLI

1. **Download Heroku CLI**
   - Visit: https://devcenter.heroku.com/articles/heroku-cli
   - Download the installer for your operating system
   - Run the installer

2. **Verify Installation**
   ```bash
   heroku --version
   # Should display: heroku/x.x.x
   ```

#### 3.2 Login to Heroku

```bash
heroku login
```
- This will open your web browser
- Click "Log in" to authenticate
- Return to your terminal

#### 3.3 Create Your Heroku Application

```bash
# Create a new Heroku app
heroku create your-tableau-extension

# Example: heroku create acme-tableau-snowflake
```

**Note**: The app name must be unique across all Heroku. If taken, try adding your company name or random numbers.

Your app URL will be: `https://your-tableau-extension.herokuapp.com`

#### 3.4 Set Environment Variables

**Copy and paste these commands one at a time**, replacing the values with your actual Snowflake credentials:

```bash
# Snowflake Account (e.g., ABC12345 or ABC12345.us-east-1.aws)
heroku config:set SNOWFLAKE_ACCOUNT=your-account-name

# Snowflake Username
heroku config:set SNOWFLAKE_USERNAME=tableau_extension_user

# Snowflake Password
heroku config:set SNOWFLAKE_PASSWORD=YourSecurePassword123!

# Snowflake Database
heroku config:set SNOWFLAKE_DATABASE=MY_DATABASE

# Snowflake Schema (usually PUBLIC)
heroku config:set SNOWFLAKE_SCHEMA=PUBLIC

# Snowflake Warehouse
heroku config:set SNOWFLAKE_WAREHOUSE=COMPUTE_WH

# Snowflake Role (usually PUBLIC)
heroku config:set SNOWFLAKE_ROLE=PUBLIC

# Node Environment
heroku config:set NODE_ENV=production
```

#### 3.5 Verify Environment Variables

```bash
heroku config
```

You should see all your environment variables listed (passwords will be shown).

#### 3.6 Deploy the Application

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial deployment"

# Add Heroku remote
heroku git:remote -a your-tableau-extension

# Deploy to Heroku
git push heroku main
```

**Wait for deployment to complete** (usually 1-2 minutes)

#### 3.7 Verify Deployment

```bash
# Open your app in browser
heroku open

# Check logs
heroku logs --tail
```

You should see:
```
🚀 Server is running on port XXXXX
✅ Snowflake configuration loaded
```

---

### 4. Tableau Setup

#### 4.1 Create Tableau Parameters

Parameters are essential for the extension to remember your tables between sessions.

**Steps:**

1. **Open Tableau Desktop**

2. **Create First Parameter**
   - Right-click in the **Data** pane (left side)
   - Select **Create Parameter...**
   - Configure:
     - **Name**: `SNOWFLAKE_TABLE_NAME` (exactly as shown)
     - **Data type**: String
     - **Current value**: (leave empty)
   - Click **OK**

3. **Create Second Parameter**
   - Right-click in the **Data** pane again
   - Select **Create Parameter...**
   - Configure:
     - **Name**: `SNOWFLAKE_TABLE_COLUMNS` (exactly as shown)
     - **Data type**: String
     - **Current value**: (leave empty)
   - Click **OK**

**✅ Verification**: You should now see both parameters in your Data pane.

#### 4.2 Update the Manifest File

The manifest file tells Tableau where to find your extension.

1. **Open the file** `public/manifest.trex` in a text editor

2. **Find this line** (around line 11):
   ```xml
   <url>https://your-heroku-app-name.herokuapp.com</url>
   ```

3. **Replace it** with your actual Heroku URL:
   ```xml
   <url>https://your-tableau-extension.herokuapp.com</url>
   ```

4. **Optional**: Update author information (lines 8-9)
   ```xml
   <author name="Your Name" email="your.email@company.com" organization="Your Company" website="https://yourcompany.com"/>
   ```

5. **Save the file**

6. **Deploy the updated manifest**
   ```bash
   git add public/manifest.trex
   git commit -m "Update manifest with Heroku URL"
   git push heroku main
   ```

#### 4.3 Add Extension to Tableau Dashboard

**Method 1: Using Local Manifest File (Recommended for Development)**

1. **Open or create a dashboard** in Tableau Desktop

2. **Drag "Extension"** from the Objects panel onto your dashboard

3. **Select "Access Local Extensions"**

4. **Browse** to your project folder

5. **Select** `public/manifest.trex`

6. **Click "OK"**

**Method 2: Using Hosted Manifest URL (Recommended for Production)**

1. **Open or create a dashboard** in Tableau Desktop

2. **Drag "Extension"** onto your dashboard

3. **Enter the URL**:
   ```
   https://your-tableau-extension.herokuapp.com/manifest.trex
   ```

4. **Click "OK"**

**🎉 The extension should now load!**

---

## 🎮 Using the Extension

### First Time Use: Creating a Table

1. **The extension loads** with the "Create New Table" section

2. **Enter a table name** (e.g., `SALES_DATA`)
   - Use uppercase letters, numbers, and underscores only
   - No spaces allowed

3. **Set number of columns** (e.g., 3)

4. **Click "Generate Column Fields"**

5. **Define each column**:
   - **Column 1**: Name: `ID`, Type: Integer
   - **Column 2**: Name: `PRODUCT_NAME`, Type: Text (VARCHAR)
   - **Column 3**: Name: `SALE_DATE`, Type: Date

6. **Click "Create Table"**

7. **Success!** The table is created in Snowflake and the interface switches to data management mode

### Adding Data

1. **Fill in the "Add New Row" form**
   - Each field corresponds to a column in your table
   - Data types are validated automatically

2. **Click "Add to Pending"**
   - Row is added to the "Pending Rows" section
   - You can add multiple rows before saving

3. **Review your pending rows**

4. **Click "💾 Save All Pending Rows"**
   - All pending rows are written to Snowflake
   - They appear in the "Saved Data" table below

### Editing Data

1. **Find the row** you want to edit in the "Saved Data" table

2. **Click "Edit"** on that row
   - The row becomes editable with input fields

3. **Modify the values** as needed

4. **Click "Save"** to update in Snowflake
   - Or **"Cancel"** to discard changes

### Deleting Data

1. **Find the row** you want to delete

2. **Click "Delete"**

3. **Confirm** in the popup dialog

4. **Row is permanently removed** from Snowflake

### Reconnecting to Existing Tables

When you reopen your Tableau dashboard:

1. **Reconnect dialog appears** showing your saved table

2. **Choose an option**:
   - **🔌 Reconnect**: Continue working with the existing table
   - **🆕 Create New**: Start fresh with a new table

### Creating Multiple Tables

1. **Click "Create Another Table"** at the bottom

2. **Follow the creation steps** again

3. **Switch between tables** by reconnecting through parameters

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Tableau Extensions API failed to load"

**Symptoms**: Extension shows error on load, debug button doesn't work

**Solutions**:
1. Check internet connection (API loads from CDN)
2. Clear browser cache in Tableau
3. Verify manifest URL is correct
4. Check Heroku app is running: `heroku ps`

---

#### Issue 2: "Cannot perform CREATE TABLE. This session does not have a current database"

**Symptoms**: Table creation fails with database error

**Solutions**:
1. Verify environment variables are set: `heroku config`
2. Check database and schema names are correct
3. Ensure Snowflake user has permissions
4. Test Snowflake connection directly

---

#### Issue 3: "Parameters not found"

**Symptoms**: Extension doesn't save table info, no reconnect dialog

**Solutions**:
1. Verify parameters are created in Tableau with exact names:
   - `SNOWFLAKE_TABLE_NAME`
   - `SNOWFLAKE_TABLE_COLUMNS`
2. Check parameter data type is "String"
3. Use debug button to see available parameters
4. Recreate parameters if necessary

---

#### Issue 4: "Could not save table settings"

**Symptoms**: Error message when creating table

**Solutions**:
1. Create the required Tableau parameters (see Section 4.1)
2. Click "🐛 Debug Settings" to diagnose
3. Click "Test Parameter Access" to verify write permissions
4. Check Tableau version supports parameter API

---

#### Issue 5: Data not appearing after save

**Symptoms**: Pending rows save successfully but don't show in table

**Solutions**:
1. Click "🔄 Refresh" button
2. Check Snowflake directly to verify data
3. Review Heroku logs: `heroku logs --tail`
4. Verify warehouse is running in Snowflake

---

### Debug Tools

#### Using the Debug Button

1. **Click "🐛 Debug Settings"** in the extension

2. **Review the information**:
   - Tableau API Status
   - Available parameters
   - Current table in memory
   - Column structure

3. **Test Features**:
   - **Force Save**: Manually save current table to parameters
   - **Test Parameter Access**: Verify write permissions
   - **Show Instructions**: View parameter creation guide

#### Checking Heroku Logs

```bash
# View real-time logs
heroku logs --tail

# View recent logs
heroku logs --num 100

# Search logs for errors
heroku logs | grep ERROR
```

#### Testing Snowflake Connection

```bash
# Test health endpoint
curl https://your-app-name.herokuapp.com/health

# Should return: {"status":"OK","timestamp":"..."}
```

---

## 📁 File Structure

```
tableau-snowflake-extension/
├── server.js                 # Main Node.js server (API endpoints)
├── package.json             # Node.js dependencies
├── Procfile                 # Heroku process configuration
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── LICENSE                 # MIT License
│
└── public/                 # Frontend files
    ├── index.html         # Extension UI (main interface)
    └── manifest.trex      # Tableau extension manifest
```

### File Descriptions

#### `server.js`
**Purpose**: Backend server that handles all Snowflake operations

**Key Features**:
- Express.js web server
- Snowflake connection management
- API endpoints for CRUD operations
- Environment variable validation

**Main Endpoints**:
- `POST /api/create-table` - Creates new Snowflake table
- `GET /api/table/:tableName` - Retrieves table data
- `POST /api/table/:tableName/insert` - Inserts new rows
- `PUT /api/table/:tableName/update/:rowIndex` - Updates existing row
- `DELETE /api/table/:tableName/delete/:rowIndex` - Deletes row
- `GET /health` - Health check endpoint

---

#### `public/index.html`
**Purpose**: Frontend interface for the extension

**Key Sections**:
- Table creation wizard
- Data entry forms
- Editable data table
- Debug tools
- Reconnect dialog

**Technologies**:
- Vanilla JavaScript
- Tableau Extensions API
- Tailwind CSS for styling

---

#### `public/manifest.trex`
**Purpose**: Tableau extension configuration file

**Important Settings**:
- `<url>` - Where Tableau loads the extension from
- `<permissions>` - What data the extension can access
- `<icon>` - Extension icon (base64 encoded)
- `<author>` - Your information

---

#### `package.json`
**Purpose**: Node.js project configuration

**Key Dependencies**:
- `express` - Web server framework
- `snowflake-sdk` - Snowflake database driver
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

---

#### `Procfile`
**Purpose**: Tells Heroku how to run your application

**Content**:
```
web: node server.js
```

---

#### `.env.example`
**Purpose**: Template for local environment variables

**Usage**: Copy to `.env` and fill in your values for local development

---

## ⚙️ Configuration Reference

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SNOWFLAKE_ACCOUNT` | Yes | Snowflake account identifier | `abc12345` or `abc12345.us-east-1.aws` |
| `SNOWFLAKE_USERNAME` | Yes | Snowflake username | `tableau_extension_user` |
| `SNOWFLAKE_PASSWORD` | Yes | Snowflake password | `SecurePass123!` |
| `SNOWFLAKE_DATABASE` | Yes | Database name | `MY_DATABASE` |
| `SNOWFLAKE_SCHEMA` | No | Schema name (default: PUBLIC) | `PUBLIC` |
| `SNOWFLAKE_WAREHOUSE` | Yes | Warehouse name | `COMPUTE_WH` |
| `SNOWFLAKE_ROLE` | No | Role name (default: PUBLIC) | `PUBLIC` |
| `PORT` | No | Server port (set by Heroku) | `3000` |
| `NODE_ENV` | No | Environment (default: production) | `production` |

### Supported Data Types

The extension supports the following Snowflake data types:

| Type | Description | UI Input | Example |
|------|-------------|----------|---------|
| `VARCHAR(255)` | Text/String | Text input | "Product Name" |
| `INTEGER` | Whole numbers | Number input | 42 |
| `FLOAT` | Decimal numbers | Number input (decimal) | 99.99 |
| `DATE` | Date only | Date picker | 2025-01-15 |
| `TIMESTAMP` | Date and time | DateTime picker | 2025-01-15 14:30 |
| `BOOLEAN` | True/False | Dropdown | true / false |

---

## ❓ FAQ

### General Questions

**Q: Is this extension free to use?**
A: Yes, the extension itself is open-source and free. You'll need accounts for Snowflake (paid) and Heroku (free tier available).

**Q: Can multiple users use the extension simultaneously?**
A: Yes, each user works with their own table instance. However, concurrent edits to the same table may cause conflicts.

**Q: Is my data secure?**
A: Yes. Data is transmitted over HTTPS, and Snowflake credentials are stored as environment variables in Heroku. Never commit credentials to Git.

**Q: Can I use this in Tableau Server?**
A: Yes, as long as your Tableau Server allows dashboard extensions and can reach your Heroku app URL.

---

### Technical Questions

**Q: Why Heroku instead of AWS/Azure?**
A: Heroku offers the simplest deployment process. The code can be adapted for any Node.js hosting platform.

**Q: Can I run this locally?**
A: Yes! See the [Local Development](#local-development) section below.

**Q: What happens if my Heroku app sleeps?**
A: Free Heroku apps sleep after 30 minutes of inactivity. First request may take 10-15 seconds to wake up.

**Q: Can I customize the UI?**
A: Absolutely! Edit `public/index.html` to modify the interface. The extension uses Tailwind CSS for styling.

**Q: How do I add more data types?**
A: Edit the `generateAddRowForm()` and `generateColumnFields()` functions in `public/index.html`.

---

### Tableau Questions

**Q: Which Tableau versions are supported?**
A: Tableau Desktop/Server 2018.2 or later (when Dashboard Extensions were introduced).

**Q: Can I use multiple extensions on the same dashboard?**
A: Yes, Tableau supports multiple extensions per dashboard.

**Q: Do parameters sync across workbooks?**
A: No, parameters are workbook-specific. Each workbook maintains its own table reference.

---

## 🔨 Local Development

Want to develop or test locally before deploying?

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env`** with your Snowflake credentials

4. **Run the server**
   ```bash
   npm start
   # Or for auto-reload during development:
   npm run dev
   ```

5. **Access locally**
   - Open browser: http://localhost:3000
   - Update manifest URL to `http://localhost:3000`

### Local Testing Tips

- Use ngrok to expose local server to Tableau: `ngrok http 3000`
- Check Snowflake query history to debug SQL issues
- Use browser DevTools console for JavaScript debugging
- Test with small tables first

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

### Reporting Issues

1. Check existing issues first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (Tableau version, OS, etc.)

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add amazing feature"`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use meaningful variable names
- Comment complex logic
- Follow existing code structure
- Test before submitting

---

## 🙏 Acknowledgments

- Tableau Extensions API Team
- Snowflake SDK Developers
- Open Source Community

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/tableau-snowflake-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/tableau-snowflake-extension/discussions)
- **Email**: your.email@company.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🗺️ Roadmap

Future enhancements being considered:

- [ ] Bulk data import from CSV
- [ ] Export table data to CSV
- [ ] Advanced filtering and search
- [ ] Column management (add/remove columns)
- [ ] Multi-table views
- [ ] Audit trail logging
- [ ] Data validation rules
- [ ] Scheduled data refresh
- [ ] Real-time collaboration features
- [ ] Integration with Tableau data sources

---

## 📊 Changelog

### Version 1.0.0 (2025-10-03)
- Initial release
- Create, read, update, delete Snowflake tables
- Tableau parameter integration
- Editable data interface
- Debug tools
- Comprehensive documentation

---

<div align="center">

**Made with ❤️ for the Tableau Community**

[⬆ Back to Top](#-tableau-snowflake-extension)

</div>