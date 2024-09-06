const http = require('http');
const fs = require('fs');
const qs = require('querystring');

// Port number
const PORT = 8080;

// Server
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/signup') {
            // Serve the signup form
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <body>
                        <h1>Signup Form</h1>
                        <form action="/signup" method="POST">
                            Username: <input type="text" name="username" required><br>
                            Password: <input type="password" name="password" required><br>
                            <button type="submit">Sign Up</button>
                        </form>
                    </body>
                </html>
            `);
        } else if (req.url === '/allusers') {
            // Display all users without showing passwords
            fs.readFile('user.txt', 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error reading users file');
                    return;
                }

                const users = data.split('\n').filter(line => line).map(line => {
                    const [username] = line.split(':'); // Assuming data format "username:password"
                    return username;
                });

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body>
                            <h1>All Users</h1>
                            <ul>
                                ${users.map(user => `<li>${user}</li>`).join('')}
                            </ul>
                        </body>
                    </html>
                `);
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Page Not Found');
        }
    } else if (req.method === 'POST') {
        if (req.url === '/signup') {
            // Collect data from the form
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const parsedData = qs.parse(body);
                const { username, password } = parsedData;

                // Store the username and password in user.txt
                fs.appendFile('user.txt', `${username}:${password}\n`, err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error storing user information');
                        return;
                    }
                    
                    // Respond to the user after signup
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Thank You for Signup...!!!');
                });
            });
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
