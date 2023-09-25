import { env, file } from "bun";
import Elysia from "elysia";
import { authUser, deleteUser, setUser } from "./store";


type Store = Record<string, string | null>;
function isValidPlot(req: {'headers': Store, 'query': Store}) {
    if(req.query['auth'] != env.AUTH_KEY) return false;
    const match = (req.headers['user-agent']?.match(/DiamondFire\/(?<version>\d(?:\.\d)+) \((?<plotid>\d+), (?<plotowner>\w{3,16})\)/));
    if(match == null) return false;
    const [matched, dfversion, plotid, plotowner] = match;
    if(plotid != env.PLOT_ID) return false;
    
    if(plotowner != env.PLOT_OWNER) return false;
    return true;
}

new Elysia()
    .get('/', () => file('./html/index.html'))
    .get('/style.css', () => file('./html/style.css'))
    .get('/login', req => {
        const auth = authUser(req.query['key'] as string);
        if(auth != null) {
            req.cookie['key'].value = req.query['key'];
            req.cookie['uuid'].value = auth.uuid;
            req.cookie['username'].value = auth.username
        }
        return file('./html/login.html');
    })
    .put('/user', (req) => {
        if(!isValidPlot(req)) {
            req.set.status = "Forbidden";
            // log the requesters ip 🤨📸
            // for legal reasons this is a joke.
            return "403 Forbidden.";
        }
        const {uuid, username, key} = req.body as any; // we will error, and we will cope, and we will seethe, and we will cope, and we will seethe
        setUser(uuid, username, key)
        req.set.status = "No Content";
        return; // Only DF is supposed to be here, and it doesn't use response bodies.
    })
    .delete('/user', (req) => {
        if(isValidPlot(req)) {
            deleteUser(req.body as string);
            req.set.status = "No Content";
            return;
        }
        const auth = authUser(req.query['auth'] as any) ?? authUser(req.body as any);
        if(auth == null) {
            req.set.status = "Unauthorized";
            return "401 Unauthorized.\nA user can delete themselves by\nputting the token in a search query: ?auth=<token>\nOR put it as the body.";
        }
        deleteUser(auth.uuid);
        return {"status":"deleted",...auth};
    })
    .get('/user', (req) => {
        req.set.headers['Access-Control-Allow-Origin'] = '*';
        // the plot will never get info, so it doesn't have access.
        const auth = authUser(req.query['auth'] as any);
        if(auth == null) {
            req.set.status = "Unauthorized";
            return "401 Unauthorized.\nPut the token in a search query: ?auth=<token>\nOR put it as the body.";
        }
        return auth;
    })
    .listen(3000, () => {
        console.log('Listening.');
    });