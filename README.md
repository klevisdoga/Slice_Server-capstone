# Getting Started with Slice App Server

To run the Slice App on your local host:

1. Clone Repository in VScode or preffered code editor
2. Open internal or external terminal
3. cd to Slice App Server directory
4. In the command line run "npm i"
5. Once all the dependencies have downloaded and you see your "node_modules" folder run "node index.js" in the terminal to begin the server

# Connect to you Database

1. Make sure you have a MYSQL DB ready
2. In the "knexfile.js" be sure to update values accordingly (username, password, database name)
3. In internal or external terminal, cd to Slice App Server directory, and run "npm run migrate" in the terminal to create the needed tables
