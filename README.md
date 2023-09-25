# auth
Super simple OAuth like authenication for any web app that needs to recognize a player.

## Progress
- [x] Plot access endpoints
- [x] Plot adding users
- [ ] Get user by key
- [ ] Delete user
- [ ] Plot delete user
- [ ] Regen key
### Page
- [ ] Page to fill cookie or storage
- [ ] Page to redirect with verify key
- [ ] Verify key check endpoint.

## How to use it
**this is all the plan.**
Send a user to `https://auth.dfonline.dev/verify?redirect=<url>`  
If the user verifies, you should get a search param `authkey`  
Send a request to `https://auth.dfonline.dev/authkey?authkey=<authkey>`  
This will send you the user info. It's up to you to store things like your own account key.  
This will get a players info once. Longer authentication is planned.  
