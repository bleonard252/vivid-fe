# vivid-fe
Vivid, a WIP Material Design frontend for Mastodon/Pleroma instances

**WARNING:** Vivid is not ready yet. It will recieve a Release when the first of its features are available.

## To install
Clone it to your computer (for ease of updating) and add it to a webserver. 

Best practice:
1. `cd /var/www` (may need `sudo`)
  * On Windows, use `cd C:/www` or change out `C:` after `cd`ing drives. Windows lacks sudo.
2. `git clone https://github.com/bleonard252/vivid-fe.git`
3. Edit `config.json` (may show as `config`) to your liking. **Don't put sensitive data,** i.e. secrets, keys, in these files. **They ARE WEB ACCESSIBLE.**
4. Configure your favorite webserver to have the `vivid-fe` folder as a site
5. (Re)start your favorite webserver.
6. Load it up in a web browser (maybe use [`localhost`](http://localhost)). Profit!

## To update
Run `git pull` from within the site folder.
