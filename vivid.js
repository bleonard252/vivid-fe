var v = {
    cfg: { //Config Functions: get(key), set(key, value)
        get: function(x){try {let y = JSON.parse(localStorage.getItem("config"))[x]; return y;}
            catch(e) {console.warn("config get failed: "+e)}},
        set: function(x,y){try {let z = JSON.parse(localStorage.getItem("config"));
            z[x] = y; localStorage.setItem("config", JSON.stringify(z));} 
            catch(e) {console.warn("config set failed: "+e)}}
    },
    feeds: { //Timeline Functions: getall(posts_id, api), change(posts_id,api,type)
        getAll: function(posts_id, api) {api.get("timelines/"+vi.feed_type,{local: vi.feed_local},function(data){
            data.forEach(function(status){
                content = status.content.replace('class="invisible"','class="link-invis"');
                document.getElementById(posts_id).innerHTML = document.getElementById(posts_id).innerHTML +
            `
            <div class="demo-card-square mdl-card mdl-shadow--2dp" id="postcard-${status.id}">
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
            `;console.log(status); //for debugging purposes, log each status
            if (status.favourited == true) {
                $("#post_like_"+status.id).removeClass("mdl-color-text--grey");
                $("#post_like_"+status.id).addClass("mdl-color-text--red");
            }
            if (status.reblogged == true) {
                $("#post_reblog_"+status.id).removeClass("mdl-color-text--grey");
                $("#post_reblog_"+status.id).addClass("mdl-color-text--green-400");
            }
            if (status.account.bot == true) {document.getElementById("postcard-"+status.id+"-title").innerHTML = document.getElementById("postcard-"+status.id+"-title").innerHTML +
            `&nbsp;<span class="mdl-chip">
                <span class="mdl-chip__text">Bot</span>
            </span>`;}})})},
        change: function(x) {if (x == "local") {vi.feed_type = "public"; vi.feed_local = true;} else {vi.feed_type = x; vi.feed_local = false;}} //x must be one of ["home", "local", "public"]
    },
    status: { //Status manipulators: like(ename, api), repost(ename, api)
        like: function(ename,api) {
            if ($("#post_like_"+ename).hasClass("mdl-color-text--grey")) { //TODO: get ids and check the post
				//Favorite
				$("#post_like_"+ename).removeClass("mdl-color-text--grey");
				$("#post_like_"+ename).addClass("mdl-color-text--red");
				api.post("statuses/"+ename+"/favourite");
			} else {
				//Un-favorite
				$("#post_like_"+ename).addClass("mdl-color-text--grey");
				$("#post_like_"+ename).removeClass("mdl-color-text--red");
				api.post("statuses/"+ename+"/unfavourite");
			}
        },
        repost: function(ename, api) {
            if ($("#post_reblog_"+ename).hasClass("mdl-color-text--grey")) { //TODO: get ids and check the post
				//Favorite
				$("#post_reblog_"+ename).removeClass("mdl-color-text--grey");
				$("#post_reblog_"+ename).addClass("mdl-color-text--green-400");
				api.post("statuses/"+ename+"/reblog");
			} else {
				//Un-favorite
				$("#post_reblog_"+ename).addClass("mdl-color-text--grey");
				$("#post_reblog_"+ename).removeClass("mdl-color-text--green-400");
				api.post("statuses/"+ename+"/unreblog");
			}
        }
    }
}
let vi = {
    feed_type: "home",
    feed_local: false
}