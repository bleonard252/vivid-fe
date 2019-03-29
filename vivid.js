//TODO: "consistency": get the post things and such into one form

/* special var names
api: always (the) api variable
ename: post id
v: root variable for vivid.js
*/
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
            try {
                $.get("./config.json").done(function (vx) {
                    try { cj = vx }
                    catch (f) { console.warn("config set failed: " + e) }

                    // Use config
                    try { let y = cj[x]; return y; }
                    catch (e) { console.warn("config get failed: " + e) }
                }).fail(function(vw, vy, vz) {
                    console.error(vz);
                    console.debug(vw); console.debug(vy);
                })
            }
            catch (e) { console.warn("config fetch failed: " + e) };
        },
    },
    feeds: { //Timeline Functions: getAll(posts_id, api), change(posts_id,api,type)
        getAll: async function (posts_id, api) {
            console.info("Updating home: " + vi.feed_type + " with local? " + JSON.stringify(vi.feed_local));
            api.get("timelines/" + vi.feed_type, { local: vi.feed_local }, function (data) {
                data.forEach(function (status) {
                    v.status.eval(posts_id, status, "feed", {});
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
        getStatuses: async function (x, api) {
            return api.get("accounts/" + x + "/statuses")
        },
        getMy: async function (api) {
            return api.get("accounts/verify_credentials")
        },
        updateMy: async function (x, api) {
            console.info("Updating current user's profile")
            let y = await v.profile.getMy(api);
            let z = await v.profile.getStatuses(y.id, api)
            document.getElementById(x).innerHTML =
                `<div class="demo-card-square mdl-card mdl-shadow--2dp profile-head-postcard" id="profile-head-postcard">
            <div class="mdl-card__title mdl-card--expand" style="background:url('${y.header}') no-repeat center #cccccc; background-size:cover; margin:0; height:150px">
                <h2 class="mdl-card__title-text" style="width: 100%;background-color: rgba(0,0,0,0.5);"><img class="mdl-chip__contact"
                        style="height: 64px; width: 64px; border-radius: 32px; margin: 16px; font-size: 36px; line-height: 64px;"
                        src="${y.avatar}">
                        <span style="color: white;margin: 32px 0;">${v.profile.name(y)}</span></h2>
            </div><span class="v-profile-head-last">
            <div class="mdl-card__supporting-text">
                ${y.note}
            </div></span>
        </div><br />`;
            z.forEach(function (status) {
                v.status.eval(x, status, "profile", { isMyProfile: true });
            });
        },
        getAll: async function (x, w, api) {
            console.info("Updating " + w + "'s profile");
            let y = await v.profile.get(w, api);
            let z = await v.profile.getStatuses(y.id, api);
            document.getElementById(x).innerHTML =
                `<div class="demo-card-square mdl-card mdl-shadow--2dp profile-head-postcard" id="subprofile-head-postcard">
            <div class="mdl-card__title mdl-card--expand" style="background:url('${y.header}') no-repeat center #cccccc; background-size:cover; margin:0; height:150px">
                <h2 class="mdl-card__title-text" style="width: 100%;background-color: rgba(0,0,0,0.5);"><img class="mdl-chip__contact"
                        style="height: 64px;width: 64px;border-radius: 32px;margin: 16px;font-size: 36px;line-height: 64px;"
                        src="${y.avatar}">
                        <span style="color: white;margin: 32px 0;">${v.profile.name(y)}</span></h2>
            </div><span class="v-profile-head-last">
            <div class="mdl-card__supporting-text">
                ${y.note}
            </div></span>
        </div><br />`;
            z.forEach(function (status) {
                v.status.eval(x, status, "subprofile", {})
            });
        }
    },
    status: { //Status functions: like(id, api, prefix), repost(id, api, prefix), getAll(status_id, elem_id, api)
        like: function (ename, api, pfx) {
            if (pfx == undefined) { pfx = "" };
            if ($("#" + pfx + "post_like_" + ename).hasClass("mdl-color-text--grey")) { //TODO: get ids and check the post
                //Favorite
                $("#" + pfx + "post_like_" + ename).removeClass("mdl-color-text--grey");
                $("#" + pfx + "post_like_" + ename).addClass("mdl-color-text--red");
                api.post("statuses/" + ename + "/favourite");
            } else {
                //Un-favorite
                $("#" + pfx + "post_like_" + ename).addClass("mdl-color-text--grey");
                $("#" + pfx + "post_like_" + ename).removeClass("mdl-color-text--red");
                api.post("statuses/" + ename + "/unfavourite");
            }
        },
        repost: function (ename, api, pfx) {
            if (pfx == undefined) { pfx = "" };
            if ($("#" + pfx + "post_reblog_" + ename).hasClass("mdl-color-text--grey")) { //TODO: get ids and check the post
                //Reblog
                $("#" + pfx + "post_reblog_" + ename).removeClass("mdl-color-text--grey");
                $("#" + pfx + "post_reblog_" + ename).addClass("mdl-color-text--green-400");
                api.post("statuses/" + ename + "/reblog");
            } else {
                //Un-reblog
                $("#" + pfx + "post_reblog_" + ename).addClass("mdl-color-text--grey");
                $("#" + pfx + "post_reblog_" + ename).removeClass("mdl-color-text--green-400");
                api.post("statuses/" + ename + "/unreblog");
            }
        },
        getAll: async function (x, ename, api) {
            console.info("Getting status page for " + ename);
            var op = await api.get("statuses/" + ename);
            api.get("statuses/" + ename + "/context", function (predata) {
                let data = predata.descendants;
                console.log(data)
                //TODO: insert op here with biggerness
                data.forEach(function (status) {
                    v.status.eval(x, status, "substatus", {})
                })
            })
        },
        format: {
            std: function (body) {
                //Remove RT prefix
                var x = body.replace(/RT\s[<]span.*?[<][/]span[>]\s/, "");
                //Change mentions to internal links
                /*body.match(/<a href=\"https:\/\/(.*?)\/@(.*?)\" class=\"u-url mention\">@<span>.*?<\/span><\/a>/g).forEach(function(match) {
                  //Not yet  
                });*/
                //TODO: webfinger lookup for each link
                return x;
            }
        },
        eval: async function (posts_id, status, pfx, options) {
            if (pfx == null) { pfx = "" }
            document.getElementById(posts_id).innerHTML = document.getElementById(posts_id).innerHTML +
                `<div class="demo-card-square mdl-card mdl-shadow--2dp" id="${pfx}-postcard-${status.id}">
                <div class="mdl-card__title ttk-card-title" id="${pfx}-postcard-${status.id}-title">
                <span class="mdl-chip mdl-chip--contact" onClick='window.location.hash = "profile/${status.account.id}";v.over.show("sub/profile.html");vsub.profile()'>
                    <img class="mdl-chip__contact" src="${status.account.avatar}"></img>
                    <span class="mdl-chip__text">${v.profile.name(status.account)}</span>
                </span>
                </div>
                <div class="mdl-card__supporting-text" id="${pfx}-postcard-${status.id}-content">
                    ${v.status.format.std(status.content)}
                </div>
                <div class="mdl-card__actions mdl-card--border">
                <a class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-color-text--grey" id="${pfx}_post_like_${status.id}" onclick="v.status.like('${status.id}',api,'${pfx}')">
                    <i class="material-icons">favorite</i>
                </a>
                <a class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-color-text--grey" id="${pfx}_post_reblog_${status.id}" onclick="v.status.repost('${status.id}',api,'${pfx}')">
                    <i class="material-icons">autorenew</i>
                </a>
                <div class="mdl-layout-spacer"></div>
                <a class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-color-text--primary" id="${pfx}_post_readmore_${status.id}"  onClick='window.location.hash = "status/${status.id}";v.over.show("sub/status.html");vsub.status()'>
                    <i class="material-icons">more</i>
                </a>
                </div>
            </div><br />
            `; console.log(status); //for debugging purposes, log each status
            if (status.favourited == true) {
                $("#" + pfx + "_post_like_" + status.id).removeClass("mdl-color-text--grey");
                $("#" + pfx + "_post_like_" + status.id).addClass("mdl-color-text--red");
            }
            if (status.reblogged == true) {
                $("#" + pfx + "_post_reblog_" + status.id).removeClass("mdl-color-text--grey");
                $("#" + pfx + "_post_reblog_" + status.id).addClass("mdl-color-text--green-400");
            }
            if (status.reblog !== null) {
                if (status.reblogged === false) {
                    document.getElementById(pfx + "-postcard-" + status.id + "-title").innerHTML =
                        `<span class="mdl-chip mdl-chip--contact" onClick='window.location.hash = "profile/${status.reblog.account.id}";v.over.show("sub/profile.html");vsub.profile()'>
                    <img class="mdl-chip__contact" src="${status.reblog.account.avatar}"></img>
                    <span class="mdl-chip__text">${v.profile.name(status.reblog.account)}</span>
                    </span>`;
                    document.getElementById(pfx + "-postcard-" + status.id + "-title").outerHTML =
                        document.getElementById(pfx + "-postcard-" + status.id + "-title").outerHTML +
                        `<div class="mdl-card__title vivid-t-topaz vivid-emo mdl-color-text--grey">
                    <i class="material-icons mdl-color-text--green-400">autorenew</i> Boosted by&nbsp;<strong onclick="window.location.hash = 'profile/${status.account.id}'; v.over.show('sub/profile')">${v.profile.name(status.account)}</strong></div>`
                }
            }
            if (status.account.bot == true) {
                document.getElementById(pfx + "postcard-" + status.id + "-title").innerHTML = document.getElementById("postcard-" + status.id + "-title").innerHTML +
                    `&nbsp;<span class="mdl-chip">
                <span class="mdl-chip__text">Bot</span>
            </span>`;
            }
            try {
                if (options.isMyProfile) {
                    if (!status.reblog !== null) {
                        //delete interactivity: for your own sake
                        document.getElementById(pfx + "post_like_" + status.id).outerHTML = "";
                        document.getElementById(pfx + "post_reblog_" + status.id).outerHTML = "";
                    }
                }
            } catch (e) { console.error("v.status.eval failed at options.isMyProfile: " + e); console.log("v.status.eval: if it relates to isMyProfile or options being undefined or null, it's not a problem.") }
        }
    },
    over: { //Overlay functions: show(source), hide(), isShown()
        show: function (src) {
            return $.get(src).done(function (x) {
                if (!$(document.body).hasClass("v-hasover")) {
                    $(document.body).addClass("v-hasover");
                    //document.getElementsByClassName("mdl-layout")[0].innerHTML += `<iframe src="sub/wrap.htm?${src}${window.location.hash}" class="v-over" id="v-over"></iframe>`;
                    document.getElementsByClassName("mdl-layout")[0].innerHTML += `<div class="v-over" id="v-over">${x}</div>`;
                } else {
                    document.getElementById("v-over").src = src;
                    console.info("v.over.show(): Showing in place of old overlay");
                }
            })
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
        },
        snack: {
            show: function (text, timeout) {
                'use strict';
                var snackbarContainer = document.querySelector('#vivid-snacker');
                var data = {
                    message: text,
                    timeout: timeout
                };
                snackbarContainer.MaterialSnackbar.showSnackbar(data);
            }
        }
    }
}
let vi = {
    feed_type: "home",
    feed_local: false,
    tmp_val: null
}
let vsub = {
    profile: async function () {
        let zxhash = window.location.hash;
        console.log("ZXHASH (URL extension): " + zxhash);
        zxhash = zxhash.replace("#profile/", "");
        console.log("ZXHASH (profile ID): " + zxhash);
        v.profile.getAll("SUBPROFILE", zxhash, api)
    },
    status: async function () {
        let zxhash = window.location.hash;
        console.log("ZXHASH (URL extension): " + zxhash);
        zxhash = zxhash.replace("#status/", "");
        console.log("ZXHASH (status ID): " + zxhash);
        await v.status.getAll("SUBSTATUS", zxhash, api);
        api.get("statuses/" + zxhash).then(function (xstatus) {
            api.get("accounts/verify_credentials").then(function (acct) {
                if (xstatus.account.id !== acct.id) {
                    //IDs are different, status not user's
                    let i; let j = document.getElementsByClassName("stat-mine-only");
                    for (i = 0; i < j.length; i++) {
                        j[i].outerHTML = ""
                    }
                };
            });
            //todo: delete all elements with .stat-mine-only
        });
        api.get("accounts/verify_credentials").then(function (udat) {
            document.getElementById("substatus-postcard-writer-title").innerHTML =
                `<img class="mdl-chip__contact" src="${udat.avatar_static}"></img>
            <span class="mdl-chip__text writerchip">${udat.display_name}</span>`;
            if (udat.bot == true) {
                document.getElementById("substatus-postcard-writer-title").innerHTML = document.getElementById("substatus-postcard-writer-title").innerHTML +
                    `&nbsp;<span class="mdl-chip">
                <span class="mdl-chip__text">Bot</span>
            </span>`;
            }
        });
    },
    deletestatsuccess: function () {
        v.over.snack.show("Deleted successfully!")
    },
    deletestatfail: function () {
        v.over.snack.show("Delete failed.")
    }
}
