# auth
Super simple OAuth like authentication for any web app that needs to recognize a player.

## Progress
- [x] Plot access endpoints
- [x] Plot adding users
- [x] Get user by key
- [x] Delete user
- [ ] Plot delete user (this needs to be done on the plot)
- [ ] Re-gen key (this needs to be done on the plot)
### Page
- [x] Page to fill cookie or storage
- [x] Page to redirect with verify key
- [x] Verify key check endpoint.

## How to use it
### Server
Since this uses bun, it must run on linux, macos or wsl.  
To run, just install [bun](https://bun.sh), install packages with `bun i` and run `bun run index.ts`.  
#### Enviroment Variables
You can use `.env`:
- DB_PATH: sqlite path
- PLOT_ID: The plot on diamondfire to show on the main page, also used for authentication.
- PLOT_OWNER: The owner's username, used for authentication
- AUTH_KEY: A secret shared with the plot, used for authentication
### Plot
- [ ] **TODO**: Dump some templates here, probably dfonline and a `.dft` zip folder.
### OAuth
- [ ] **TODO**: Check this is accuurate.
Send a user to `https://auth.dfonline.dev/verify?redirect=<url>`  
If the user verifies, you should get a search param `authkey`  
Send a request to `https://auth.dfonline.dev/authkey?authkey=<authkey>`  
This will send you the user info. It's up to you to store things like your own account key.  
This will get a players info once. Longer authentication is planned.  
