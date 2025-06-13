/**
 * character routes
 */
// modules
const fs = require("fs");
const httpz = require("@octanuary/httpz");
const path = require("path");
const fold = path.join(__dirname, "../../", "_ASSETS");
const database = require("../../data/database"), DB = new database();
const nodezip = require("node-zip");
let isAction = false;
let charpart;
let whatCCTheme;
// vars
const base = Buffer.alloc(1, "0");
const defaultTypes = {
	anime: "guy",
	cctoonadventure: "default",
	family: "adam",
};
const bfTypes = {
	man: "default&ft=_sticky_filter_guy",
	woman: "default&ft=_sticky_filter_girl",
	boy: "kid&ft=_sticky_filter_littleboy",
	girl: "kid&ft=_sticky_filter_littlegirl",
	heavy_man: "heavy&ft=_sticky_filter_heavyguy",
	heavy_woman: "heavy&ft=_sticky_filter_heavygirl",
};
const wbTypes = {
	man: "default&ft=_sticky_filter_guy",
	woman: "default&ft=_sticky_filter_girl",
	boy: "kid&ft=_sticky_filter_littleboy",
	girl: "kid&ft=_sticky_filter_littlegirl",
};
// stuff
const Char = require("../models/char");
const { exists } = require("../models/asset");
const folder = path.join(__dirname, "../../server", "/static/store/cc_store/family/emotions");
const sfolder = path.join(__dirname, "../../server", "/static/store/cc_store");
// create the group
const group = new httpz.Group();
const fUtil = require("../../utils/fileUtil");
let trim;
let trim2;
let isCC = false;
let is2010 = false;
let whereWeAt = -1;
function makeACCCharComponentsGoInAnArrayThatIsFormattedLikeThe2010LVMSupports(component) {
	console.log(component);
	let arrary = [];
	for (let i = 0; i < component.length; i++) {
		arrary.push(`${component[i]._attributes.theme_id}.${component[i]._attributes.type}.${component[i]._attributes.component_id}.swf`);
	}
	return arrary;
}
function meta2libraryXml(w) {
	let xml;
	xml = `<library type="${w._attributes.type}" file="${w._attributes.component_id}" path="${w._attributes.component_id}" component_id="${w._attributes.component_id}" theme_id="${w._attributes.theme_id}"/>`
	return xml;
}
function meta2componentXml(v) {
	let xml;
	let ty = v._attributes.type;

	if (ty == "eye" || ty == "eyebrow" || ty == "mouth") {
		let animetype = v._attributes.theme_id == "anime" ? "side_" + trim2[ty] : v._attributes.theme_id == "business" ? "front_" + trim2[ty] : trim2[ty];
		xml = `<component type="${v._attributes.type}" ${isAction ? `component_id="${v._attributes.component_id}"` : ``} theme_id="${v._attributes.theme_id}" file="${animetype}.swf" path="${v._attributes.component_id}" x="${v._attributes.x}" y="${v._attributes.y}" xscale="${v._attributes.xscale}" yscale="${v._attributes.yscale}" offset="${v._attributes.offset}" rotation="${v._attributes.rotation}" ${v._attributes.split ? `split="N"` : ``}/>`;
	}
	else {
		if (v._attributes.id) xml = `<component id="${v._attributes.id}" ${isAction ? `file="default.swf"` : ``} type="${v._attributes.type}" theme_id="${v._attributes.theme_id}" ${isAction ? `component_id="${v._attributes.component_id}"` : ``} path="${v._attributes.component_id}" x="${v._attributes.x}" y="${v._attributes.y}" xscale="${v._attributes.xscale}" yscale="${v._attributes.yscale}" offset="${v._attributes.offset}" rotation="${v._attributes.rotation}" />`;
		else if (v._attributes.type != "skeleton" && v._attributes.type != "bodyshape" && v._attributes.type != "freeaction") xml = `<component type="${v._attributes.type}" theme_id="${v._attributes.theme_id}" ${isCC || isAction && v._attributes.theme_id != "business" ? `file="default.swf"` : v._attributes.theme_id == "business" ? `file="front_default.swf"` : ``} ${isAction ? `component_id="${v._attributes.component_id}"` : ``} path="${v._attributes.component_id}" x="${v._attributes.x}" y="${v._attributes.y}" xscale="${v._attributes.xscale}" yscale="${v._attributes.yscale}" offset="${v._attributes.offset}" rotation="${v._attributes.rotation}" />`;
		else xml = `<component type="${v._attributes.type}" theme_id="${v._attributes.theme_id}" ${v._attributes.type == "skeleton" ? `file="stand.swf"` : v._attributes.type == "freeaction" && v._attributes.theme_id == "cc2" ? `file="stand.swf"` : v._attributes.type == "freeaction" && v._attributes.theme_id == "business" ? `file="stand01.swf"` : `file="thumbnail.swf"`} path="${v._attributes.component_id}" ${isAction ? `component_id="${v._attributes.component_id}"` : ``} x="${v._attributes.x}" y="${v._attributes.y}" xscale="${v._attributes.xscale}" yscale="${v._attributes.yscale}" offset="${v._attributes.offset}" rotation="${v._attributes.rotation}" />`;
	}
	return xml;
}

group
	// load
	.route("POST", "/goapi/getCcCharCompositionXml/", (req, res) => {
		const id = req.body.assetId;
		res.assert(id, 400, "Missing one or more fields.");

		console.log(`Loading character #${id}...`);
		try {
			const buf = Char.load(id);
			res.setHeader("Content-Type", "application/xml");
			res.end(Buffer.concat([base, buf]));
		} catch (e) {
			console.log("But nobody came.");
			res.status(404);
			res.end("1");
		}
	})
	// premade
	.route("POST", "/ajax/getCCPreMadeCharacters", (req, res) => {
		if (req.body.cat == "*" || req.body.cat == "ugc") {
			let themeId = req.body.theme_code;
			let response = [];
			const filters = {
				themeId,
				type: "char"
			};
			let files = DB.select("assets", filters);
			// Reconstruct the cc list
			for (const v of files) {
				response.push({ "id": v.id, "tid": v.id, "tags": "ugc", "url": `assets/${v.id}.png`, "money": "0", "sharing": "0" });
			}
			res.json(response);
		}
		else {
			res.json({ error: "No stock chars exist yet" });
		}
	})
	.route("POST", "/goapi/getCCPreMadeCharacters", (req, res) => res.end())
	// redirect
	.route("GET", /\/go\/character_creator\/(\w+)(\/\w+)?(\/.+)?$/, (req, res) => {
		let [, theme, mode, id] = req.matches;
			
		let redirect;
		switch (mode) {
			case "/copy": {
				redirect = `/cc?themeId=${theme}&original_asset_id=${id.substring(1)}`;
				break;
			} default: {
				const type = theme == "business" ?
					bfTypes[req.query.type || ""] || "":
					req.query.type | theme == "whiteboard" ?
					wbTypes[req.query.type || ""] || "":
					req.query.type || defaultTypes[theme] || "";
				redirect = `/cc?themeId=${theme}&bs=${type}`;
				break;
			}
		}
		
		res.redirect(redirect);
	})
	.route("GET", /^\/static\/store\/custom\/char\/(\d+)\/(\w+\.xml)$/, async (req, res) => {
		var convert = require('xml-js');
		isAction = true;
		whereWeAt++;
		const zip = nodezip.create();
		const filters = {
			themeId: "family",
			type: "char"
		};
		const files = DB.select("assets", filters);
		let hasFoundItYet = false;
		//Filter by POS
		for (const file in files) {
			if (files[file].id == req.matches[1]) {
				whereWeAt = file;
				hasFoundItYet = true;
				console.log("WE FOUD IT!");
				break;
			}
		}
		charpart = [];
		if (!hasFoundItYet) {
			const buf = await Char.load(req.matches[1]);
			let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
			const realresult = JSON.parse(result);
			charpart.push(makeACCCharComponentsGoInAnArrayThatIsFormattedLikeThe2010LVMSupports(realresult.cc_char.component));
			whereWeAt = charpart.length - 1;
		}
		let cid;
		if (hasFoundItYet) {
			cid = files[whereWeAt].id;
		}
		else {
			cid = req.matches[1];
		}
		console.log(charpart[charpart.length - 1]);
		console.log(cid);
		const desc = Char.load(cid);
		fUtil.addToZip(zip, "desc.xml", Buffer.from(desc),);
		for (let i = 0; i < charpart[whereWeAt].length; i++) {
			let pieces = charpart[whereWeAt][i].split(".");
			fUtil.addToZip(zip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../server`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" ? `stand` : pieces[1] == "bodyshape" ? `thumbnail` : `default`}.swf`,)));
		}
		res.end(await zip.zip());
	})
	// save
	//  #all
	.route("POST", "/goapi/saveoldCCCharacter/", (req, res) => {
		res.assert(
			req.body.body,
			req.body.imagedata,
			req.body.themeId,
			400, "Missing one or more fields."
		);
		const body = req.body.body;
		const thumb = Buffer.from(req.body.imagedata, "base64");

		const meta = {
			type: "char",
			subtype: 0,
			title: req.body.title,
			themeId: req.body.themeId
		};
		const id = Char.save(body, meta);
		Char.saveThumb(id, thumb);
		res.end("0" + id);
	})
	.route("POST", "/ajax/saveCCCharacterTemplate", (req, res) => {
		const id = req.body.assetId;
		res.assert(id, 400, "Missing one or more fields.");
		console.log(`Loading character #${id}...`);
		try {
			res.setHeader("Content-Type", "text/xml");
			res.end(`0<asset><type>char</type><file>${id.slice(0, -4)}</file><id>${id.slice(0, -4)}</id><asset_id>${id.slice(0, -4)}</asset_id></asset>`);
		} catch (e) {
			console.log("But nobody came.");
			res.status(404);
			res.end("1");
		}
	})
	.route("POST", "/goapi/saveCCCharacter/", (req, res) => {
		res.assert(
			req.body.body,
			req.body.thumbdata,
			req.body.themeId,
			400, "Missing one or more fields."
		);
		const body = Buffer.from(req.body.body);
		const thumb = Buffer.from(req.body.thumbdata, "base64");
		const head = Buffer.from(req.body.imagedata, "base64");

		const meta = {
			type: "char",
			subtype: 0,
			title: "Untitled",
			themeId: req.body.themeId
		};
		const id = Char.save(body, meta);
		Char.saveThumb(id, thumb, head);
		res.end("0" + id);
	})
	//  #thumbs
	.route("POST", "/goapi/saveCCThumbs/", (req, res) => {
		const id = req.body.assetId;
		res.assert(
			req.body.thumbdata,
			id,
			400, "Missing one or more fields."
		);
		const thumb = Buffer.from(req.body.thumbdata, "base64");

		if (exists(`${id}.xml`)) {
			Char.saveThumb(id, thumb);
			res.end("0" + id);
		} else {
			res.end("1");
		}
	})
	.route("POST", "/goapi/saveCCThumbs/", (req, res) => {
		const id = req.body.assetId;
		res.assert(
			req.body.thumbdata,
			id,
			400, "Missing one or more fields."
		);
		const thumb = Buffer.from(req.body.thumbdata, "base64");

		if (exists(`${id}.xml`)) {
			Char.saveThumb(id, thumb);
			res.end("0" + id);
		} else {
			res.end("1");
		}
	})
	.route("POST", "/goapi/getCharacter/", async (req, res) => {
		//Check first to see if its a cc theme
		let isCcThemeChar = false;
		const filters = {
			themeId: whatCCTheme,
			type: "char"
		};
		const files = DB.select("assets", filters);
		for (const file in files) {
			if (files[file].id == req.body.assetId) {
				isCcThemeChar = true;
				break;
			}
		}
		//This code is so hard for people so hear are commentz
		if (!isCcThemeChar) {
			var convert = require('xml-js');
			const zip = nodezip.create();
			let num;
			let xnl = fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm", "theme.xml")).toString();
			let result = convert.xml2json(xnl, { compact: true, spaces: 4 });
			const data = JSON.parse(result);
			let hasmatch = false;
			for (let i = 0; i < data.theme.char.length; i++) {
				num = i;
				if (data.theme.char[i]._attributes.id == req.body.assetId) {
					// Was used for logging

					//console.log("We've found a match here..");
					//console.log("Heres the json metainfo:", data.theme.char[i]._attributes);
					//console.log("And the actions:", data.theme.char[num].action);
					//Handler for one action chars
					if (data.theme.char[num].action[0] === undefined) {
						fUtil.addToZip(zip, `char/${req.body.assetId}/${data.theme.char[num].action._attributes.id}`, fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action._attributes.id)));
					}
					else {
						for (let b = 0; b < data.theme.char[num].action.length; b++) {
							// Check if the action exists before going rogue to add them
							if (fs.existsSync(path.join(__dirname, "../../server", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action[b]._attributes.id))) {
								fUtil.addToZip(zip, `char/${req.body.assetId}/${data.theme.char[num].action[b]._attributes.id}`, fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action[b]._attributes.id)));
							}
						}
					}
					hasmatch = true;
				}
			}
			if (hasmatch) {

				res.end(await zip.zip());
			}
			else {
				res.statusCode = "500";
				res.json({ "status": "error", "massage": "Character not found, listed wrong" });
			}
		}
		else {
			var convert = require('xml-js');
			const zip = nodezip.create();
			const buf = await Char.load(req.body.assetId);
			const filters = {
				themeId: whatCCTheme,
				type: "char"
			};
			const files = DB.select("assets", filters);
			for (const file in files) {
				if (files[file].id == req.body.assetId) {
					whereWeAt = file;
					console.log("WE FOUD IT!")
					break;
				}
			}
			console.log(buf);
			let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
			const data = JSON.parse(result);
			const themeid = data.cc_char.component[0]._attributes.theme_id;
			const libArray = data.cc_char.library;
			let mappedLibrary;
			if (themeid == "cc2" || themeid == "business") {
				mappedLibrary = libArray.map(meta2libraryXml).join("");
			}
			trim = fs.readFileSync(path.join(folder, themeid, "emotions", "head_neutral.json"));
			trim2 = JSON.parse(trim);
			const colorArray = data.cc_char.color;
			let mappedColors;
			isAction = true;
			mappedColors = colorArray.map(Char.meta2colourXml).join("");
			const componentArray = data.cc_char.component;
			let mappedComponent;
			mappedComponent = componentArray.map(meta2componentXml).join("");
			res.setHeader("Content-type", "application/zip");
			let actions = ["stand", "walk"];
			let actionproperties = ["default", "walk"];
			for (var num = 0; num < actions.length; num++) {
				const actionzip = nodezip.create();
				fUtil.addToZip(actionzip, `desc.xml`, Buffer.from(`<cc_char ${data.cc_char._attributes ? `xscale='${data.cc_char._attributes.xscale}' yscale='${data.cc_char._attributes.yscale}' hxscale='${data.cc_char._attributes.hxscale}' hyscale='${data.cc_char._attributes.hyscale}' headdx='${data.cc_char._attributes.headdx}' headdy='${data.cc_char._attributes.headdy}'` : ``}>${mappedColors}${mappedComponent}${themeid == "cc2" || themeid == "business" ? mappedLibrary : ``}</cc_char>`));
				for (let i = 0; i < charpart[whereWeAt].length; i++) {
					let pieces = charpart[whereWeAt][i].split(".");
					fUtil.addToZip(actionzip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../server`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" ? actions[num] : pieces[1] == "bodyshape" ? `thumbnail` : pieces[1] == "eye" || pieces[1] == "eyebrow" || pieces[1] == "mouth" ? `default` : pieces[1] != "lower_body" && pieces[1] != "upper_body" ? `default` : actionproperties[num]}.swf`,)));
				}
				fUtil.addToZip(zip, `char/${req.body.assetId}/${actions[num]}.xml`, Buffer.from(await actionzip.zip()));
			}


			if (themeid == "family")
			{
			let testfacials = ["neutral","shocked","angry","sad","talk_a"];
			for (a = 0; a < testfacials.length; a++)
			{
			isAction = false;
			const facialzip = nodezip.create();
			let json = fs.readFileSync(path.join(folder, themeid, "emotions", `head_${testfacials[a]}.json`),'utf-8');
			let json2 = JSON.parse(json);
			fUtil.addToZip(facialzip, `desc.xml`, Buffer.from(`<cc_char ${data.cc_char._attributes ? `xscale='${data.cc_char._attributes.xscale}' yscale='${data.cc_char._attributes.yscale}' hxscale='${data.cc_char._attributes.hxscale}' hyscale='${data.cc_char._attributes.hyscale}' headdx='${data.cc_char._attributes.headdx}' headdy='${data.cc_char._attributes.headdy}'` : ``}>${mappedColors}${mappedComponent}${themeid == "cc2" || themeid == "business" ? mappedLibrary : ``}</cc_char>`));
			for (let i = 0; i < charpart[whereWeAt].length; i++) {
				let pieces = charpart[whereWeAt][i].split(".");
				if (pieces[1] != "lower_body"|| pieces[1] != "upper_body"|| pieces[1] != "skeleton") fUtil.addToZip(facialzip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../server`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" ? `stand` : pieces[1] == "bodyshape" ? `thumbnail` : pieces[1] == "mouth" ? json2.mouth : pieces[1] == "eyebrow" ? json2.eyebrow : pieces[1] == "eye" ? json2.eye : pieces[1] != "lower_body" && pieces[1] != "upper_body" ? `default` : `default`}.swf`,)));
			}
			fUtil.addToZip(zip, `char/${req.body.assetId}/head/head_${testfacials[a]}.xml`, Buffer.from(await facialzip.zip()));
			}
			}
			res.end(await zip.zip());
		}
	})
	//oh my god this will be useful for getCharacterAction
	.route("POST", "/getCharSwfPartsForThe2010LvmRightFreakingNow", async (req, res) => {
		charpart = req.body.array;
		whatCCTheme = req.body.themeid;
		console.log(req.body.themeid);
		is2010 = true;
		whereWeAt = -1;
		res.end();
	})
	.route("POST", "/goapi/getUserAssets", async (req, res) => {
		console.log("call")
		is2010 = false;
		whereWeAt = -1;
	})
	.route("POST", "/goapi/getCharacterAction/", async (req, res) => {
		res.assert(
			req.body.charId,
			req.body.facialId,
			400, "Missing one or more fields."
		);
		res.setHeader("Content-Type", "application/xml");
		const guyis = fs.readFileSync(path.join(folder, req.body.facialId));
		res.end(guyis);
	})
	.route("POST", "/goapi/getPointStatus/", (req, res) => {
		/*res.assert(
			req.body.userId,
			400, "Missing one or more fields."
		);*/
		res.setHeader("Content-Type", "application/xml");
		res.end(`0<?xml version="1.0" encoding="UTF-8"?>
		<points money="100000" sharing="100000"/>`);
	})
	.route("POST", "/goapi/buyPremiumAsset/", (req, res) => {
		res.assert(
			req.body.userId,
			400, "Missing one or more fields."
		);
		res.setHeader("Content-Type", "application/xml");
		res.end(`0<?xml version="1.0" encoding="UTF-8"?>
		<points money="1000" sharing="1000" />`);
	})
	// upload
	.route("*", "/api/char/upload", (req, res) => {
		const file = req.files.import;
		res.assert(file, 400, { status: "error" });
		const origName = file.originalFilename;
		const path = file.filepath, buffer = fs.readFileSync(path);

		const meta = {
			type: "char",
			subtype: 0,
			title: origName || "Untitled",
			themeId: Char.getTheme(buffer)
		};
		try {
			Char.save(buffer, meta, true);
			fs.unlinkSync(path);
			const url = `/cc_browser?themeId=${meta.themeId}`;
			res.redirect(url);
		} catch (e) {
			console.error("Error uploading character:", e);
			res.statusCode = 500;
			res.json({ status: "error" });
		}
	});

module.exports = group;
