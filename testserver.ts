import Elysia from "elysia";

new Elysia()
    .get('/', req => {
        req.set.redirect = 'http://localhost:3000/auth?redirect=http://localhost:3001/login';
    })
    .get('/login', async req => {
        const res = await fetch(`http://localhost:3000/auth?code=${req.query['code']}`, {
            method: 'POST'
        });
        const json = await res.json();
        return `${json.username} (${json.uuid})`;
    })
    .listen(3001)