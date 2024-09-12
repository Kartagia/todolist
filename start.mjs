
/**
 * The express based main program.
 */

import express from 'express';
import { readFile } from 'fs/promises';
import apiService from './dummyApiService.mjs';
import { AccessForbiddenException, HttpStatusException } from './errors.mjs';
import cookieParser from 'cookie-parser';
import { rmSync } from 'fs';

const port = process.env.PORT || 6001;
const host = process.env.HOST || "localhost";

const app = express();

app.get("/", (req, res) => {
    // Sending the React app.
    res.append("title", "Todo List Application");
    res.append("Content-Type", "text/html;charset=UTF-8");
    res.send("<div id=\"app\"></div><script type=\"module\" src=\"serverStart.mjs\"></script>");
});

app.get("/serverStart.mjs", (req, res) => {
    if (req.hostname === "localhost" ||req.hostname === "127.0.0.1") {
        // Localhost.
        readFile("./serverStart.mjs").then( (content) => {
            res.send(content);
        });
    } else {
        // Invalid request host.
        res.status(404).send("<h1>Not Found</h1>");
    }
});

/**
 * The API service cookie parser.
 */
const apiCookieParser = cookieParser(apiService.cookieSecret);

app.route("/api")
.all(express.json())
.all(apiCookieParser);

app.route("/api/login")
.post(function (req, res) {
    if (validHost(req.url)) {
        if (typeof req.body !== "object" && !["userId", "sessionId"].every( field => (field in req.body))) {
            res.status(400).send(`<h1>Bad Request</h1><p>Invalid login request</p>`)
        } else {
            const userId = req.body.userId;
            const sessionId = req.body.sessionId;
            apiService.login(sessionId, userId, userSecret).then(
                (credentials) => {
                    res.cookie("userId", credentials.userId, {path: "/api", signed: true});
                    res.cookie("sessionId", credentials.sessionId, {path: "/api", signed: true});
                    res.json(credentials.content);
                },
                (error) => {
                    if (error instanceof HttpStatusException) {
                        res.status(error.statusCode).send(error.statusMessage);
                    } else {
                        res.status(400).send("<p>Bad Request</p>");
                    }
                }
            )
        }
    } else {
        const error = new AccessForbiddenException("API not available for the host");
        res.status(error.statusCode).send(`<h1>${error.statusMessage}</h1><p>${error.message}</p>`);
    }
});

app.route("/api/todo/:id")
.get(function (req, res) {
    const id = req.params["id"];
    // Todo: Get cookie for user.
    const userId = req.signedCookie("userId", apiService.cookieSecret);
    // Todo: Get cookie for session.
    const sessionId = req.signedCookie("sessionId", apiService.cookieSecret);
    const now = Date.now();
    const session = apiService.updateSession(sessionId, now);
    if (session && session.userId == userId && userId in apiService.todos && id in apiService.todos[userId]) {
        apiService.getTodo(sessionId, userId, id).then(
            (result) => { req.json(result);},
            (error) => {
                req.status(error.statusCode).send(`<h1>${error.statusMessage}</h1><p>${error.message || error.statusMessage}</p>`)
            }
        );
    } else {
        // Not found.
        res.status(404).end();
    }
})
.post(function (req, res) {
    res.status(501).send(`<h1>Not Implemented</h1><p>Creating new todo not implemented</p>`)
})
.put(function (req, res) {
    res.status(501).send(`<h1>Not Implemented</h1><p>Updating existing todo not implemented</p>`)
})
.delete(function (req, res) {
    res.status(501).send(`<h1>Not Implemented</h1><p>Deleteing existing todo not implemented</p>`)
});

app.get("/api/todo/:id", (req, res) => {
    // The api todo list acquisition.
    const todoId = req.params.id;
    const sessionId = req.signedCookies.sessionId;
    const userId = req.signedCookies.userId;
    apiService.getTodo(sessionId, userId, todoId).then(
        (todo) => {
            res.json(todo);
        }, 
        (error) => {
            res.status(error.statusCode ?? 400).json(error);
        }
    )
});

app.post("/api/login", (req, res) => {
    // The API login.
    const user = req.body?.user;
    const secret = req.body?.secret;
    if (user == null) {
        res.status(400).json("Bad request");
        return;
    }
    if (secret == null) {
        res.status(400).json("Bad request");
        return;
    }
    const sessionId = req.signedCookies.sessionId;
    const userId = req.signedCookies.userId;
    apiService.login(user, secret).then(
        (sessionInfo) => {
            if (sessionId != null) {
                // Close session before sending reply.
                apiService.closeSession(sessionId).then( () => {
                    const cookieOptions = {
                        expires: new Date(sessionInfo.expires),
                        signed: true,
                        path: "/api"
                    };
                    res.signedCookie("userId", sessionInfo.userId, cookieOptions);
                    res.signedCookie("sessionId", sessionInfo.sessionId, cookieOptions);
                    res.json(sessionInfo.content);
                }, (err) => {
                    const cookieOptions = {
                        expires: new Date(sessionInfo.expires),
                        signed: true,
                        path: "/api"
                    };
                    res.signedCookie("userId", sessionInfo.userId, cookieOptions);
                    res.signedCookie("sessionId", sessionInfo.sessionId, cookieOptions);
                    res.json(sessionInfo.content);                    
                });
            } else {
                // No session to close.
                const cookieOptions = {
                    expires: new Date(sessionInfo.expires),
                    signed: true,
                    path: "/api"
                };
                res.signedCookie("userId", sessionInfo.userId, cookieOptions);
                res.signedCookie("sessionId", sessionInfo.sessionId, cookieOptions);
                res.json(sessionInfo.content);
            }
        }, 
        (error) => {
            res.status(error.statusCode ?? 400).json(error);
        }
    )  
});

const serverHook = app.listen(port, host, () => {
    console.log("Server started at port: ", port);
});
