import { env } from "bun";
import Elysia from "elysia";
import { setUser } from "./store";


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
    .get('/', () => `Hello World!`)
    .put('/user', async (req) => {
        if(!isValidPlot(req)) {
            req.set.status = "Forbidden";
            // log the requesters ip 🤨📸
            // for legal reasons this is a joke.
            return "403 Forbidden.";
        }
        const {uuid, username, key} = req.body as any; // we will error, and we will cope, and we will seethe, and we will cope, and we will seethe
        setUser(uuid, username, key)
        return; // Only DF is supposed to be here, and it doesn't use response bodies.
    })
    .delete('/user', async (req) => {
        
    })
    .listen(3000)