var v = {
    cfg: { //Config Functions: get(key), set(key, value)
        get: function (x) {
            let y = v.sitecfg.get("default_config")[x]; try { y = JSON.parse(localStorage.getItem("config"))[x]; return y }
                catch (e) {
                    console.info("could not get user config for " + x + ", used default value of \"" + y + "\" instead");
                    console.warn("config get failed: " + e); return null
                }
        },
        set: function (x, y) {
            try {
                let z = JSON.parse(localStorage.getItem("config"));
                z[x] = y; localStorage.setItem("config", JSON.stringify(z)); return true
            }
            catch (e) { console.warn("config set failed: " + e); return false }
        }
    },
    sitecfg: { //Site Config Functions: get(key)
        get: function (x) {
            // Set default defaults (if config has errors, these values will be used instead)
            let cj = {
                "sitename": "Vivid for Mastodon",
                "default_instance": null,
                "index_url": location.origin + location.pathname,
                "default_config": {
                    "darkmode": false,
                    "pinkmode": false
                }
            };
            // Fetch file (REQUIRES JQUERY)
            try { $.get("config.json", {}, function (vx) { cj = JSON.parse(vx) }); }
            catch (e) { console.warn("config fetch failed: " + e) };

            // Use config
            try { let y = JSON.parse(cj)[x]; return y; }
            catch (e) { console.warn("config get failed: " + e) }
        },
    },
    feeds: { //Timeline Functions: getAll(posts_id, api), change(posts_id,api,type)
        getAll: async function (posts_id, api) {
            console.info("Updating home: " + vi.feed_type + " with local? " + JSON.stringify(vi.feed_local));
            api.get("timelines/" + vi.feed_type, { local: vi.feed_local }, function (data) {
                data.forEach(function (status) {
                    document.getElementById(posts_id).innerHTML = document.getElementById(posts_id).innerHTML +
                        `<div class="demo-card-square mdl-card mdl-shadow--2dp" id="postcard-${status.id}">
                <div class="mdl-card__title ttk-card-title" id="postcard-${status.id}-title">
                <span class="mdl-chip mdl-chip--contact">
                    <img class="mdl-chip__contact" src="${status.account.avatar}"></img>
                    <span class="mdl-chip__text">${status.account.display_name}</span>
                </span>
                </div>
                <div class="mdl-card__supporting-text">
                        ${status.content}
                </div>
                <div class="mdl-card__actions mdl-card--border">
                <a class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-color-text--grey" id="post_like_${status.id}" onclick="toggle_like('${status.id}')">
                    <i class="material-icons">favorite</i>
                </a>
                <a class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-color-text--grey" id="post_reblog_${status.id}" onclick="toggle_reblog('${status.id}')">
                    <i class="material-icons">autorenew</i>
                </a>
                </div>
            </div><br />
            `; console.log(status); //for debugging purposes, log each status
                    if (status.favourited == true) {
                        $("#post_like_" + status.id).removeClass("mdl-color-text--grey");
                        $("#post_like_" + status.id).addClass("mdl-color-text--red");
                    }
                    if (status.reblogged == true) {
                        $("#post_reblog_" + status.id).removeClass("mdl-color-text--grey");
                        $("#post_reblog_" + status.id).addClass("mdl-color-text--green-400");
                    }
                    if (status.account.bot == true) {
                        document.getElementById("postcard-" + status.id + "-title").innerHTML = document.getElementById("postcard-" + status.id + "-title").innerHTML +
                            `&nbsp;<span class="mdl-chip">
                <span class="mdl-chip__text">Bot</span>
            </span>`;
                    }
                })
            })
        },
        change: function (x) { if (x == "local") { vi.feed_type = "public"; vi.feed_local = true; } else { vi.feed_type = x; vi.feed_local = false; } } //x must be one of ["home", "local", "public"]
    },
    profile: {//Profile Functions: get(id, api), getMy(api), updateMy(profile_posts_id, api), getStatuses(account,api), name(account)
        get: async function (x, api) {
            return api.get("accounts/" + x)
        },
        name: function (x) {
            if (x.display_name == "") {
                return x.acct;
            } else {
                return x.display_name;
            }
        },
        getStatuses: async function(x, api) {
            return api.get("accounts/" + x + "/statuses")
        },
        getMy: async function (api) {
            return api.get("accounts/verify_credentials")
        },
        updateMy: async function (x, api) {
            console.info("Updating current user's profile")
            let y = await v.profile.getMy(api);
            let z = await v.profile.getStatuses(y.id, api)
            document.getElementById(x).innerHTML = "";
            z.forEach(function (status) {
                document.getElementById(x).innerHTML = document.getElementById(x).innerHTML +
                    `<div class="demo-card-square mdl-card mdl-shadow--2dp" id="profile-postcard-${status.id}">
						<div class="mdl-card__title ttk-card-title" id="profile-postcard-${status.id}-title">
						<span class="mdl-chip mdl-chip--contact">
							<img class="mdl-chip__contact" src="${status.account.avatar}"></img>
							<span class="mdl-chip__text">${status.account.display_name}</span>
						</span>
						</div>
						<div class="mdl-card__supporting-text">
								${status.content}
						</div>
                    </div><br />`; console.log(status);
                    if (status.reblog !== null) {
                        document.getElementById("profile-postcard-"+status.id+"-title").innerHTML = 
                        `<span class="mdl-chip mdl-chip--contact">
                        <img class="mdl-chip__contact" src="${status.reblog.account.avatar}"></img>
                        <span class="mdl-chip__text">${v.profile.name(status.reblog.account)}</span>
                        </span>`;
                        document.getElementById("profile-postcard-"+status.id+"-title").outerHTML = 
                         document.getElementById("profile-postcard-"+status.id+"-title").outerHTML +
                        `<div class="mdl-card__title ttk-card-padless vivid-emo mdl-color-text--grey">
						<i class="material-icons mdl-color-text--green-400">autorenew</i> Boosted by &nbsp;<strong>${v.profile.name(status.account)}</strong></div>`
                    }
            });
        }
    },
    status: { //Status functions: like(id, api), repost(id, api)
        like: function (ename, api) {
            if ($("#post_like_" + ename).hasClass("mdl-color-text--grey")) { //TODO: get ids and check the post
                //Favorite
                $("#post_like_" + ename).removeClass("mdl-color-text--grey");
                $("#post_like_" + ename).addClass("mdl-color-text--red");
                api.post("statuses/" + ename + "/favourite");
            } else {
                //Un-favorite
                $("#post_like_" + ename).addClass("mdl-color-text--grey");
                $("#post_like_" + ename).removeClass("mdl-color-text--red");
                api.post("statuses/" + ename + "/unfavourite");
            }
        },
        repost: function (ename, api) {
            if ($("#post_reblog_" + ename).hasClass("mdl-color-text--grey")) { //TODO: get ids and check the post
                //Reblog
                $("#post_reblog_" + ename).removeClass("mdl-color-text--grey");
                $("#post_reblog_" + ename).addClass("mdl-color-text--green-400");
                api.post("statuses/" + ename + "/reblog");
            } else {
                //Un-reblog
                $("#post_reblog_" + ename).addClass("mdl-color-text--grey");
                $("#post_reblog_" + ename).removeClass("mdl-color-text--green-400");
                api.post("statuses/" + ename + "/unreblog");
            }
        }
    },
    over: { //Overlay functions: show(source), hide(), isShown()
        show: function (src) {
            let smooth = "";
            $.get(src).done(function (x) { smooth = x.responseText; })
            if (!$(document.body).hasClass("v-hasover")) {
                $(document.body).addClass("v-hasover");
                document.body.innerHTML += `<div class="v-over" id="v-over">${smooth}</div>`;
            } else {
                document.getElementById("v-over").innerHTML = smooth;
                console.info("v.over.show(): Showing in place of old overlay");
            }
        },
        hide: function () {
            if ($(document.body).hasClass("v-hasover")) {
                $(document.body).removeClass("v-hasover");
                document.getElementById("v-over").outerHTML = "";
            } else {
                console.warn("v.over.hide(): Nothing to hide");
            }
        },
        isShown: function () {
            if ($(document.body).hasClass("v-hasover")) {
                if (document.getElementById("v-over") !== null) { return true; } else { console.error("v.over.isShown(): Inconsistent class + element!") }
            }
            else { return false; }
        }
    }
}
let vi = {
    feed_type: "home",
    feed_local: false,
    tmp_val: null
}