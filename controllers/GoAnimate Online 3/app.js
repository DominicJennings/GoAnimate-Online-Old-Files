/**
 * app routes
 */
// modules
const httpz = require("@octanuary/httpz")
let discord;
require("../../utils/discord")
	.then((f) => discord = f);
// vars
const { SWF_URL, STORE_URL, CLIENT_URL } = process.env;
let usrid = "";
// stuff
const database = require("../../data/database"), DB = new database(true);
const reqIsStudio = require("../middlewares/req.isStudio");
const { VERSION } = DB.select();
const typ = VERSION;
function toAttrString(table) {
	return typeof (table) == "object" ? new URLSearchParams(table).toString() : table.replace(/"/g, "\\\"");
}
function toParamString(table) {
	return Object.keys(table).map(key =>
		`<param name="${key}" value="${toAttrString(table[key])}">`
	).join(" ");
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs).map(key =>
		`${key}="${attrs[key].replace(/"/g, "\\\"")}"`
	).join(" ")}>${toParamString(params)}</object>`;
}
//Double check because it freakin hates me
// create the group
const group = new httpz.Group();

group
	.add(reqIsStudio)
	// video list
	.route("*", "/", (req, res) => {
		discord("Video List");
		res.render("list", {});
	})
	.route("*", "/projects", (req, res) => {
		discord("Video List SkoleTube");
		res.render("projects", {});
	})
	.route("*", "/youtube", (req, res) => {
		discord("Old Youtube");
		res.render("UTube", {});
	})
	.route("*", "/go/gib", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=Comm`);
	})
	.route("*", "/make", (req, res) => {
		discord("Making a Character");
		res.render("make", {});
	})
	.route("*", "/character_creator", (req, res) => {
		discord("Character Creator");
		res.redirect(`/oldcc?themeId=family`);
	})
	.route("*", "/logOut", (req, res) => {
		res.render("logOut", {});
	})
	.route("*", "/reflex", (req, res) => {
		res.render("app/My testing is my japanese", {});
	})
	// settings
	.route("*", "/settings", (req, res) => {
		discord("Settings");
		res.render("settings", {});
	})
	// themelist page
	.route("GET", "/create", (req, res) => {
		discord("Choosing a Theme");
		if (req.query.qvmmode)
		{
		res.render("create_qvm", {});
		}
		else
		{
			res.render("create", {});		
		}
	})
	// themelist page
	.route("GET", "/create_qvm", (req, res) => {
		discord("Choosing a Theme");
		if (req.query.qvmmode)
		{
		res.render("create_qvm", {});
		}
		else
		{
			res.render("create_qvm", {});		
		}
	})
	// themelist page
	.route("GET", "/creator", (req, res) => {
		discord("Choosing a Theme");
		if (req.query.qvmmode)
		{
		res.render("creator", {});
		}
		else
		{
			res.render("creator", {});		
		}
	})
	.route("GET", "/watch", (req, res) => {
		discord("WATCHING A VIDEO ON WRAPPER JYVEE EDITION RETRO!!!");
		res.render("watch", {});
	})
	.route("GET", "/logIn", (req, res) => {
		discord("Video List");
		res.render("logIn", {});
	})
	.route("GET", "/qvm", (req, res) => {
		discord("Making a QVM: " + req.query.theme);
		let themeid = req.query.theme;
		res.assert(themeid, 400, { status: "afghajkjhagfdfgahjklkjhgf" });
		res.render(`qvm_${themeid}`, {});
	})
	.route("*", "/home", (req, res) => {
		discord("Home");
		res.render("home", {});
	})
	.route("*", "/yourvideos", (req, res) => {
		discord("Your Videos");
		res.render("yourvideos", {});
	})
	.route("*", "/videomaker", (req, res) => {
		discord("Videomaker");
		res.render("videomaker", {});
	})
	.route("*", "/creator", (req, res) => {
		discord("Creator");
		res.render("creator", {});
	})
	.route("*", "/businessvideoplans", (req, res) => {
		discord("Plans & Pricing");
		res.redirect(`/businessvideoplans`);
	})
	.route("*", "/personalvideoplans", (req, res) => {
		discord("Plans & Pricing");
		res.redirect(`/personalvideoplans`);
	})
	.route("*", "/create_qvm", (req, res) => {
		discord("Create_QVM");
		res.render("create_qvm", {});
	})
	.route("*", "/go/studio/theme/custom", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=custom`);
	})
	.route("*", "/go/studio/theme/anime", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=anime`);
	})
	.route("*", "/go/studio/theme/ninjaanime", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=ninjaanime`);
	})
	.route("*", "/go/studio/theme/spacecitizen", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=spacecitizen`);
	})
	.route("*", "/go/studio/theme/cctoonadventure", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=cctoonadventure`);
	})
	.route("*", "/go/studio/theme/business", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=business`);
	})
	.route("*", "/go/studio/theme/whiteboard", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=whiteboard`);
	})
	.route("*", "/go/studio/theme/infographics", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=infographics`);
	})
	.route("*", "/go/studio/theme/action", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=action`);
	})
	.route("*", "/go/studio/theme/chibi", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=chibi`);
	})
	.route("*", "/go/studio/theme/ninja", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=ninja`);
	})
	.route("*", "/go/studio/theme/botdf", (req, res) => {
		discord("Video List");
		res.redirect(`/go_full?tray=botdf`);
	})
	.route("*", "/videos", (req, res) => {
		discord("Videos");
		res.render("videos", {});
	})
	// flash pages
   group.route("GET", "/oldcc", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord("Character Creator");
		let flashvars = {
			appCode: "go",
			ctc: "go",
			isEmbed: 1,
			isLogin: "Y",
            		userId: 4580,
			m_mode: "school",
			page: "",
			siteId: "0",
			tlang: "en_US",
			ut: 60,
			// options
			bs: "adam",
			original_asset_id: req.query["id"] || "",
			themeId: "family",
			// paths
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/char", {
			title: "Character Creator",
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/cc_old.swf",
				type: "application/x-shockwave-flash", 
				id: "char_creator", 
				width: "960", 
				height: "600", 
				class: "char_object"
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/cc_old.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/cc", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord("Character Creator");
		let flashvars = {
			appCode: "go",
			ctc: "go",
			isEmbed: 1,
			isLogin: "Y",
            		userId: 4580,
			m_mode: "school",
			page: "",
			siteId: "0",
			tlang: "en_US",
			ut: 60,
			// options
			bs: "adam",
			original_asset_id: req.query["id"] || "",
			themeId: "family",
			// paths
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/char", {
			title: "Character Creator",
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/cc.swf",
				type: "application/x-shockwave-flash", 
				id: "char_creator", 
				width: "960", 
				height: "600", 
				class: "char_object"
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/cc.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/cc_offline", async (req, res) => {
		checkMe();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord("Character Creator");
		let flashvars = {
			appCode: "go",
			ctc: "go",
			isEmbed: 1,
			isLogin: "Y",
            		userId: 4580,
			m_mode: "school",
			page: "",
			siteId: "0",
			tlang: "en_US",
			ut: 60,
			// options
			bs: "adam",
			original_asset_id: req.query["id"] || "",
			themeId: "family",
			// paths
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/charoffline", {
			title: "Character Creator",
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/cc.swf",
				type: "application/x-shockwave-flash", 
				id: "char_creator", 
				width: "960", 
				height: "600", 
				class: "char_object"
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/cc.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/character/creator", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord("Character Creator");
		let flashvars = {
			appCode: "go",
			ctc: "go",
			isEmbed: 1,
			isLogin: "Y",
            		userId: 4580,
			m_mode: "school",
			page: "",
			siteId: "12",
			tlang: "en_US",
			ut: 60,
			// options
			bs: "adam",
			original_asset_id: req.query["id"] || "",
			themeId: "family",
			// paths
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/skoletube char", {
			title: "Character Creator",
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/cc.swf",
				type: "application/x-shockwave-flash", 
				id: "char_creator", 
				width: "960", 
				height: "600", 
				class: "char_object"
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/cc.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/cc_browser", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord("Character Browser");
		let flashvars = {
			appCode: "go",
			ctc: "go",
			isEmbed: 1,
			isLogin: "Y",
			m_mode: "school",
			page: "",
			siteId: "0",
			tlang: "en_US",
			ut: 60,
			// options
			themeId: "family",
			// paths
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/char", {
			title: "Character Browser",
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/cc_browser.swf",
				type: "application/x-shockwave-flash", 
				id: "char_creator", 
				width: "100%", 
				height: "600", 
				class: "char_object"
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/cc_browser.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/offline_browser", async (req, res) => {
		checkMe();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord("Character Browser");
		let flashvars = {
			appCode: "go",
			ctc: "go",
			isEmbed: 1,
			isLogin: "Y",
			m_mode: "school",
			page: "",
			siteId: "0",
			tlang: "en_US",
			ut: 60,
			// options
			themeId: "family",
			// paths
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/charoffline", {
			title: "Character Browser",
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/cc_browser.swf",
				type: "application/x-shockwave-flash", 
				id: "char_creator", 
				width: "100%", 
				height: "600", 
				class: "char_object"
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/cc_browser.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/character/browser", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord("Character Browser");
		let flashvars = {
			appCode: "go",
			ctc: "go",
			isEmbed: 1,
			isLogin: "Y",
			m_mode: "school",
			page: "",
			siteId: "12",
			tlang: "en_US",
			ut: 60,
			// options
			themeId: "family",
			// paths
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/skoletube char", {
			title: "Character Browser",
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/cc_browser.swf",
				type: "application/x-shockwave-flash", 
				id: "char_creator", 
				width: "100%", 
				height: "600", 
				class: "char_object"
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/cc_browser.swf",
			},
			object: toObjectString
		});
	})
	//Old go_full!
   group.route("GET", "/old_full", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/oldstudio", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/old_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/old_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/go_full", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/studio", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/studio_full", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 1,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 10,
			has_asset_bg: "0",
			has_asset_char: "1",
			nextUrl: "http://localhost:4343/projects",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "12",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/skoletube studio", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/offline_full", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/studiooffline", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/retro_full", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/studioretro", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/studio", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/newstudio", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/desktop", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 0,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/list",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 1,
			siteId: "go",
			tray: "custom",
			tlang: "en_US",
			ut: 60,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/desktop", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/dx", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 0,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 1,
			siteId: "go",
			tray: "custom",
			tlang: "en_US",
			ut: 60,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/dx", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/oldstudio", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/oldstudio2013", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/flashthemes", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/flashthemes", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/localhost", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/localhoststudio", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/ga4sr112", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/studioga4sr112", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/old/videomaker/full", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/oldlvm", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/videomaker/full", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/lvm", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/videomaker/full/custom", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/videomaker/full/custom", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/videomaker/full/business-friendly", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/videomaker/full/business-friendly", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/videomaker/full/retro", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/videomaker/full/retro", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/videomaker/full/startrek", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/videomaker/full/startrek", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/videomaker/full/stick", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord( VERSION + " Video Maker");
		let flashvars = {
            		tts_enabled: 1,
			upl: 1,
			hb: 1,
			pts: 0,
			credits: 100,
			themeColor: "silver",
			uisa: "Y",
			ve: "Y",
			ctc: CLIENT_THEME,
			isEmbed: 1,
			isVideoRecord: 1,
		        userId: 4580,
			m_mode: "Y",
			appCode: "go",
			is_golite_preview: 0,
			collab: 0,
			ctc: "go",
			goteam_draft_only: 0,
			isLogin: "Y",
			isWide: IS_WIDE,
			stutype: "tiny_studio",
			tutorial: 1,
			lid: 13,
			movieLid: 0,
			has_asset_bg: "0",
			has_asset_char: "0",
			nextUrl: "http://localhost:4343/",
                        gocoins: 100,
			page: "",
		        // loads community library on newer lvms
		        // loads skoletubes samling on newer lvms
                        school_group_id: "1",
                        group_name: "Select group...",
			is_private_shared: 0,
			is_published: 1,
			retut: 0,
			siteId: "0",
			tray: "custom",
			tlang: "en_US",
			ut: 30,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/videomaker/full/stick", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				movie: "http://localhost:4343/animation/" + VERSION + "/go_full.swf",
			},
			object: toObjectString
		});
	})
   group.route("GET", "/player", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord("Video Player");
		let flashvars = {
            		userName:"Dominic Jennings",
            		userEmail:"dominicmoffatt95@gmail.com",
			userId: "4580",
			lid: 13,
			siteId: "0",
			autostart: 0,
			isEmbed: 1,
			exportmode: req.query.exportmode || false,
			isWide: IS_WIDE,
			ut: 30,
			thumbnailURL: "http://localhost:4343/file/movie/thumb/" + req.query.movieId,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/player", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/player.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				allowFullScreen: "true",
				movie: "http://localhost:4343/animation/" + VERSION + "/player.swf",
			},
			object: toObjectString
		});
	});
   group.route("GET", "/player_offline", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { VERSION } = DB.select();
		const { CLIENT_THEME } = DB.select();
		discord("Video Player");
		let flashvars = {
            		userName:"Dominic Jennings",
            		userEmail:"dominicmoffatt95@gmail.com",
			userId: "4580",
			lid: 13,
			siteId: "0",
			autostart: 0,
			isEmbed: 1,
			exportmode: req.query.exportmode || false,
			isWide: IS_WIDE,
			ut: 30,
			thumbnailURL: "http://localhost:4343/file/movie/thumb/" + req.query.movieId,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/playeroffline", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/player.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				allowFullScreen: "true",
				movie: "http://localhost:4343/animation/" + VERSION + "/player.swf",
			},
			object: toObjectString
		});
	});
   group.route("GET", "/movie", async (req, res) => {
		checkMe();
		const { IS_WIDE } = DB.select();
		const { CLIENT_THEME } = DB.select();
		const { IS_LOGGED_IN } = DB.select();
		const { VERSION } = DB.select();
		discord("Video Player");
		let flashvars = {
            		userName:"Dominic Jennings",
            		userEmail:"dominicmoffatt95@gmail.com",
			userId: "4580",
			lid: 13,
			siteId: "12",
			autostart: 1,
			isEmbed: 1,
			exportmode: req.query.exportmode || false,
			isWide: IS_WIDE,
			ut: 30,
			thumbnailURL: "http://localhost:4343/file/movie/thumb/" + req.query.movieId,
			apiserver: "http://localhost:4343/",
			storePath: "http://localhost:4343/static/store/<store>",
			clientThemePath: CLIENT_URL + "/<client_theme>"
		};
		Object.assign(flashvars, req.query);
		res.render("app/skoletube player", {
			attrs: {
				data: "http://localhost:4343/animation/" + VERSION + "/player.swf",
				type: "application/x-shockwave-flash", width: "100%", height: "100%",
			},
			params: {
				flashvars,
				allowScriptAccess: "always",
				allowFullScreen: "true",
				movie: "http://localhost:4343/animation/" + VERSION + "/player.swf",
			},
			object: toObjectString
		});
	});
module.exports = group;

function checkMe() {
	const { IS_LOGGED_IN } = DB.select();
	if (IS_LOGGED_IN == 60) {
		usrid = "e9Vusx9Gv8";
	}
	else {
		usrid = "";
	}
}

function checkMe2() {
	const { SELECTION } = DB.select();
	const { SELSION } = DB.select();
	const { VERSION } = DB.select();
	if (SELECTION == true) {
		return SELSION;
	}
	else {
		return VERSION;
	}
}