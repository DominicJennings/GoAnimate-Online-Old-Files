/**
 * asset routes
 * NEW!!!
 */
// modules
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);
const { fromFile } = require("file-type");
const fs = require("fs");
const httpz = require("@octanuary/httpz");
const nodezip = require("node-zip");
const fUtil = require("../../utils/fileUtil");
const mime = require("mime-types");
const processVoice = require("../models/tts");
const path = require("path");
const tempfile = require("tempfile");
// vars
const fileTypes = require("../data/fileTypes.json");
const header = process.env.XML_HEADER;
const folder = path.join(__dirname, "../../", process.env.ASSET_FOLDER);
const dfolder = path.join(__dirname, "../../", "wrapper/data");
const savedfolder = path.join(__dirname, "../../", process.env.SAVED_FOLDER);
const sFolder = path.join(__dirname, "../../server", process.env.STORE_URL);
const businessFolder = path.join(__dirname, "../../server", process.env.STORE_URL, "/business");
const commFolder = path.join(__dirname, "../../server", process.env.STORE_URL, "/Comm");
const thumbUrl = process.env.THUMB_BASE_URL;
// stuff
const Asset = require("../models/asset");
const database = require("../../data/database"), DB = new database();
const rFileUtil = require("../../utils/realFileUtil");
const fold = path.join(__dirname, "../../", "_ASSETS");
const base = Buffer.alloc(1, 0);
//Combining text to speech in here for.. you know
const info = require("../data/voices");
const voices = info.voices, langs = {};
Object.keys(voices).forEach((i) => {
	const v = voices[i], l = v.language;
	langs[l] = langs[l] || [];
	langs[l].push(`<voice id="${i}" desc="${v.desc}" sex="${v.gender}" demo-url="" country="${v.country}" plus="N"/>`);
});
const http = require("http");
let di;
let first = false;
let dafourty;
let checkcode = 0;
let offset = 1;
let off;
let ofn;
// create the group
const group = new httpz.Group();
function makeTheComponentsGoAllInAnArrayThatIsFormattedLikeThe2010LVMSupports(component, theme) {
	let seperator = [];
	let arrary = [];
	for (let i = 0; i < component.length; i++) {
		for (let a = 0; a < component[i].length; a++) {
			arrary.push(`${component[i][a]._attributes.theme_id}.${component[i][a]._attributes.type}.${component[i][a]._attributes.component_id}.swf`)
		}
		seperator.push(arrary);
		arrary = [];
	}
	//Bully me guys i used chat gpt i was too lazy to write a whole request
	const http = require('http');
	const postData = JSON.stringify({
		array: seperator,
		themeid: theme
	});

	const options = {
		hostname: 'localhost',
		port: '4343',
		path: '/getCharSwfPartsForThe2010LvmRightFreakingNow',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': postData.length
		}
	};
	const request = http.request(options, (response) => {
		response.on('end', () => {
			console.log('Parts are..');
		});
	});
	request.on('error', (error) => {
		console.error('PARTS ARE ERRORING:', error);
	});
	request.write(postData);
	request.end();
	return arrary;
}
function get(url, options = {}) {
	var data = [];
	return new Promise((res, rej) => {
		http.get(url, options, (o) => {
			o.on("data", (v) => data.push(v)).on("end", () => res(Buffer.concat(data))).on("error", rej)
		});
	});
};
var escapable = /[\\\"\x00-\x1f\x7f-\uffff]/g,
	meta = {    // table of character substitutions
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"': '\\"',
		'\\': '\\\\'
	};

function quote(string) {

	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.

	escapable.lastIndex = 0;
	return escapable.test(string) ?
		'"' + string.replace(escapable, function (a) {
			var c = meta[a];
			return typeof c === 'string' ? c :
				'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' :
		'"' + string + '"';
}
function listAssets(filters, ttsfilter = false) {
	let files;
	if (ttsfilter) {
		files = DB.ttsselect("assets", filters);
	}
	else {
		files = DB.select("assets", filters);
	}
	return `${header}<theme id="ugc">${files.map(Asset.meta2Xml).join("")}</theme>`;
}
function listOldChars(filters) {
	let files;
	files = DB.select("assets", filters);
	return `${files.map(Asset.oldMeta2Xml).join("")}`;
}
function listTemplateAssets(filters,) {
	let files;
	files = DB.select("assets", filters);
	return `${header}<theme id="ugc">${files.map(Asset.meta2StareXml).join("")}</theme>`;
}
function listTeamAssets(filters) {
	const files = DB.select("teamassets", filters);
	return `${header}<ugc more="0">${files.map(Asset.meta20Xml).join("")}</ugc>`;
}
/*{
			const id = req.body.assetId;
			res.assert(id, 400, "Missing one or more fields.");

			try {
				const readStream = Asset.load(id);
				res.setHeader("Content-Type", mime.contentType(id));
				readStream.pipe(res);
				/*
				const file = Asset.load(id);
				const zip = nodezip.create();
				fUtil.addToZip(zip, id, path.join(folder, id));
				res.end(await zip.zip());
			} catch (e) {
				console.log("Error loading asset:", e);
				res.status(404).end();
			}
		}*/
function oldlistAssets() {
	return `<char id="193e57f" name="Test David" cc_theme_id="family" thumbnail_url="http://localhost:4343/thumb_store/193e57f.png" copyable="Y"><tags/></char>`;
}
group
	// delete
	.route("GET", "/old_full", async (req, res) => {
		offset = 1;
		daforuty = 0;
		off = 0;
	})
	.route("GET", "/go_full", async (req, res) => {
		first = true;
		console.log(first);
	})
	.route("GET", "/api/listCharJson/", (req, res) => {
		let themeId = "family";
		const filters = {
			themeId,
			type: "char"
		};
		let files = DB.select("assets", filters);
		res.json(files);
	})
	.route("POST", "/ajax/getCCCharacters", (req, res) => {
		let themeId = "family";
		let response = [];
		const filters = {
			themeId,
			type: "char"
		};
		let files = DB.select("assets", filters);
		// Reconstruct the cc list
		for (const v of files) {
			response.push({ "id": v.id, "thumb_url": `assets/${v.id}.png`, "head_url": `assets/head/${v.id}.png` });
		}
		res.json(response);
	})
	.route("GET", "/api/pimouth/", (req, res) => {
		const myname = path.join(sFolder, "cc_store/family");
		let char;
		let part;
		fs.readdirSync(myname).forEach(charFolder => {
			char = charFolder;
			if (charFolder != "cc_theme.xml" && charFolder != "emotions") {
				fs.readdirSync(path.join(myname, char)).forEach(partFolder => {
					part = partFolder;
					if (!partFolder.includes("zip") && partFolder != ".DS_Store") {
						fs.readdirSync(path.join(myname, char, part)).forEach(swf => {
							if (charFolder == "mouth" || charFolder == "eyebrow" || charFolder == "eye") {
								if (swf.includes(".")) {
									let expression = swf.slice(0, -4);
									if (!fs.existsSync(path.join(myname, char, part, expression))) fs.mkdirSync(path.join(myname, char, part, expression));
									let theswf = fs.readFileSync(path.join(myname, char, part, swf));
									fs.writeFileSync(path.join(myname, char, part, expression, "default.swf"), theswf)
									if (charFolder == "mouth" && swf.includes("talk") && !swf.includes("sync") && swf != "talk.swf" && !swf.includes("a.swf") && !swf.includes("b.swf") && !swf.includes("a_sync.swf") && !swf.includes("b_sync.swf")) {
										let express = swf.slice(5, -4);
										console.log(express);
										let thetalkswf = fs.readFileSync(path.join(myname, char, part, swf));
										fs.writeFileSync(path.join(myname, char, part, express, "talk.swf"), thetalkswf);
									}
									else if (part == "mouth" && swf.includes("sync") && swf != "talk.swf" && !swf.includes("a.swf") && !swf.includes("b.swf") && !swf.includes("a_sync.swf") && !swf.includes("b_sync.swf")) {
										let express = swf.slice(5, -4);
										console.log(express);
										let thetalksyncswf = fs.readFileSync(path.join(myname, char, part, swf));
										fs.writeFileSync(path.join(myname, char, part, express, "talk_sync.swf"), thetalksyncswf);
									}
								}
							}
						});
					}
				});
			}
		});
	})
	.route("POST", "/api/convert/customassets/", (req, res) => {
		const themeId = req.body.themeId;
		const myname = path.join(sFolder, "cc_store/" + themeId);
		let char;
		let part;
		let isCustomAssets = false;
		if (fs.existsSync(path.join(myname, "custom"))) {
			isCustomAssets = true;
		}
		let swift;
		fs.readdirSync(myname).forEach(charFolder => {
			char = charFolder;
			if (charFolder == "custom") {
				isCustomAssets = true;
			}
			if (charFolder != "cc_theme.xml" && charFolder != "emotions" && !charFolder.includes(".") && charFolder != "custom") {
				fs.readdirSync(path.join(myname, char)).forEach(partFolder => {
					part = partFolder;
					if (!partFolder.includes("zip") && partFolder != ".DS_Store") {
						if (!partFolder.includes(".swf")) {
							fs.readdirSync(path.join(myname, char, part)).forEach(swf => {
								if (swf.includes(".") && !swf.includes("fla") & !swf.includes("as")) {
									let buffer = new Buffer.from(fs.readFileSync(path.join(myname, char, part, swf)));
									if (!isCustomAssets) {
										var rc3 = new RC4(`sorrypleasetryagainlater`);
										rc3.update(buffer);
										fs.writeFileSync(path.join(myname, "../", "likethedecryptedstuff", swf), buffer, 'utf-8');
									}
									var rc4 = new RC4(`g0o1a2n3i4m5a6t7e`);
									rc4.update(buffer);
									fs.writeFileSync(path.join(myname, char, part, swf), buffer, 'utf8');
								}
							});
						}
						else {
							if (partFolder.includes(".") && !partFolder.includes("fla") & !partFolder.includes("as")) {
								let buffer = new Buffer.from(fs.readFileSync(path.join(myname, char, part)));
								if (!isCustomAssets) {
									var rc3 = new RC4(`sorrypleasetryagainlater`);
									rc3.update(buffer);
								}
								var rc4 = new RC4(`g0o1a2n3i4m5a6t7e`);
								rc4.update(buffer);
								fs.writeFileSync(path.join(myname, char, part), buffer, 'utf8');
							}
						}
					}
				});
			}
		});
		res.json({ status: "ok", success: true });
	})
	.route("POST", "/api_v2/asset/delete/", (req, res) => {
		const id = req.body.data.id || req.body.data.starter_id;
		res.assert(id, 400, { status: "error" });

		try {
			DB.delete("assets", id);
			res.json({ status: "ok" });
		} catch (e) {
			console.log("Error deleting asset:", e);
			res.statusCode = 404;
			res.json({ status: "error" });
		}
	})

	.route("POST", "/goapi/deleteAsset/", (req, res) => {
		const id = req.body.assetId;
		res.assert(id, 400, { status: "error" });

		try {
			DB.delete("assets", id);
			res.json({ status: "ok" });
		} catch (e) {
			console.log("Error deleting asset:", e);
			res.statusCode = 404;
			res.json({ status: "error" });
		}
	})
	.route("POST", "/goapi/SysTemplateAttributes/", (req, res) => {
		const id = req.body.assetId || req.body.asset.starter_Id;
		res.assert(id, 400, { status: "error" });

		try {
			DB.delete("assets", id);
			res.json({ status: "ok" });
		} catch (e) {
			console.log("Error deleting asset:", e);
			res.statusCode = 404;
			res.json({ status: "error" });
		}
	})
	.route("POST", "/goapi/updateSysTemplateAttributes/", (req, res) => {
		const id = req.body.assetId || req.body.asset.starter_Id;
		res.assert(id, 400, { status: "error" });

		try {
			DB.delete("assets", id);
			res.json({ status: "ok" });
		} catch (e) {
			console.log("Error deleting asset:", e);
			res.statusCode = 404;
			res.json({ status: "error" });
		}
	})
	.route("POST", "/goapi/deleteUserTemplate/", (req, res) => {
		const id = req.body.assetId || req.body.asset.starter_Id;
		res.assert(id, 400, { status: "error" });

		try {
			DB.delete("assets", id);
			res.json({ status: "ok" });
		} catch (e) {
			console.log("Error deleting asset:", e);
			res.statusCode = 404;
			res.json({ status: "error" });
		}
	})
	.route("POST", "/goapi/DeleteUserTemplate/", (req, res) => {
		const id = req.body.assetId || req.body.asset.starter_Id;
		res.assert(id, 400, { status: "error" });

		try {
			DB.delete("assets", id);
			res.json({ status: "ok" });
		} catch (e) {
			console.log("Error deleting asset:", e);
			res.statusCode = 404;
			res.json({ status: "error" });
		}
	})
	.route("POST", "/goapi/jpg_download/", (req, res) => {
		res.assert(req.body.imagedata, 400, { status: "ghkljhgjkojhghjk" });
		const image = Buffer.from(req.body.imagedata, "base64");
		res.end(image);
	})
	.route("POST", "/goapi/getCommunityData/", async (req, res) => {
		res.json([{ "name": "david.png", "mId": "m-5635", "id": "david.png", "subtype": "bg" }, { "name": "m-5641.07297674807933063-prop.png", "mId": "m-5641", "id": "07297674807933063-prop.png", "subtype": "prop" }]);
	})

	.route("GET", "/goapi/testZip/", async (req, res) => {
		const zip = nodezip.create();
		fUtil.addToZip(zip, "desc.xml", Buffer.from(listAssets(req.body)));
		res.setHeader("Content-Type", "application/zip");
		res.write(base);
		res.end(await zip.zip());
	})
	.route("POST", "/goapi/searchCommunityAssets/", async (req, res) => {
		const meta = DB.select("comm", req.body.type);
		let lar = 0;
		for (const v of meta) {
			if (v.title.toLowerCase().includes(req.body.keywords.toLowerCase()) && v.type == req.body.type) lar++;
		}
		var tXml = `<theme id="Comm" name="Community Library" all_asset_count="${lar}">`;
		for (const v of meta) {
			if (v.title.toLowerCase().includes(req.body.keywords.toLowerCase())) tXml += Asset.meta2StareXml(v);
		}
		console.log(tXml)
		const zip = nodezip.create();
		fUtil.addToZip(zip, "desc.xml", tXml + "</theme>");
		for (const file of meta) {
			if (file.title.toLowerCase().includes(req.body.keywords.toLowerCase())) {
				const buffer = Asset.load(file.id, true);
				fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
			}
		}
		res.setHeader("Content-Type", "application/zip");
		res.end(Buffer.concat([base, await zip.zip()]));
	})
	.route("POST", ["/api_v2/assets/imported","/api_v2/assets/team","/api_v2/assets/shared","/api_v2/assets/members"], (req, res) => {
		res.assert(req.body.data.type, 400, { status: "error" });
		if (req.body.data.type == "prop") req.body.data.subtype ||= 0;

		res.json({
			status: "ok",
			data: {
				xml: listAssets(req.body.data)
			}
		});
	})
	.route("GET", "/api/saveFont", async (req, res) => {
		const textToImage = require('text-to-image');
		textToImage.generate('Pizza Tower', {
			debug: true,
			maxWidth: 720,
			fontSize: 18,
			fontFamily: '/Users/jaxsonhendrix/PizzaTower.ttf',
			lineHeight: 30,
			margin: 5,
			bgColor: 'white',
			textColor: 'black',
		}).then(function (dataUri) {
			// use the dataUri
			const buffer = Buffer.from(dataUri, "base64");
			fs.writeFileSync("./buffer.png", buffer);
		});
		res.json({ status: "ok" });
	})
	.route("POST", "/goapi/getUserFontList/", async (req, res) => {
		res.json({
			status: "ok",
			result: [{
				"id": "123",
				"aid": "FontFileCustom123",
				"title": "pizza",
				"fontPath": "font/FontFileCustom123.swf",
				"listImage": "font/FontFileCustom123_tray.png",
				"tags": [],
				"label": "FontFileCustom123",
				"trayImage": "font/FontFileCustom123.png"
			}]
		});
	})
	.route("GET", "/goapi/getAssetTags", async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.end(`0{data: {
			  "prop": {
				"business": {
				  "tags": ["rusty", "pattern", "street"]
				}
			  }
			}
		  }`);
	})
	// list
	.route("*", "/goapi/getUserVideoAssets/", async (req, res) => {
		const zip = nodezip.create();
		const filters = {
			type: "prop"
		};
		let xml;
		const filez = DB.select("assets", filters);
		for (const file of filez) {
			console.log(file.subtype);
			if (file.subtype == "video") {
				xml += Asset.meta2VideoXml(file);
			}
		}
		fUtil.addToZip(zip, "desc.xml", Buffer.from(`<theme id="ugc">${xml.substring(9)}</theme>`));
		const files = DB.select("assets", filters);
		for (const asset of files) {
			if (asset.subtype == "video") {
				const buffer = Asset.load(asset.id, true);
				let filepath = `${asset.type}/${asset.id}`;
				fUtil.addToZip(zip, filepath, buffer);
				const thumbnailPath = path.join(__dirname, "../../_ASSETS", asset.id.slice(0, -3) + "png");
				const thumbnail = fs.readFileSync(thumbnailPath);
				fUtil.addToZip(zip, `${asset.type}/${asset.id.slice(0, -3) + "png"}`, thumbnail);
			}
		}
		res.setHeader("Content-Type", "application/zip");
		zip.zip().then((b) => res.end(Buffer.concat([Buffer.from([0x0]), b])));
	})
	.route("POST", "/goapi/getUserAssets/", async (req, res) => {
		const zip = nodezip.create();
		let render = 41;
		let ogpage = req.body.page;
		let newpage = parseInt(ogpage);
		let page = newpage + 1;
		let off2;
		if (req.body.type == "prop") {
			if (page == 2) {
				off = 40;
				off2 = off + 40;
			}
			else if (page > 2) {
				off += 40;
				off2 = off + 40;
			}
		}
		if (req.method == "POST") {
			if (req.body.is_cc || req.body.cc_theme_id) {
				const zip = nodezip.create();
				fUtil.addToZip(zip, "desc.xml", Buffer.from(`
			<theme id="custom">
			<char id="char1" cc_theme_id="custom" copyable="Y" name="Character 1" thumb="char1.png" path="char1" isCC="Y"><tags/><action id="Ivey.swf" name="Be a Teacher"/></char>		
			</theme>`));

				fUtil.addToZip(zip, `char/char1.png`, fs.readFileSync(path.join(folder, "char1.png")));
				res.setHeader("Content-Type", "application/zip");
				res.write(base);
				res.end(await zip.zip());
			}
			else {
				let jason;
				if (req.body.type != "char") {
					jason = { "type": req.body.type, "count": "48", "page": req.body.page };
					if (req.body.type == "sound") {
						let xml;
						const files = DB.select("assets", jason);
						for (const file of files) {
							console.log(file.subtype);
							if (file.subtype != "tts") {
								xml += Asset.meta2Xml(file);
							}
							switch (file.type) {
								case "char": {
									const buffer = fs.readFileSync(path.join(folder, `${file.id}.xml`));
									const thumbBuffer = fs.readFileSync(path.join(folder, `${file.id}.png`));
									fUtil.addToZip(zip, `char/${file.id}/${file.id}.xml`, buffer);
									fUtil.addToZip(zip, `char/${file.id}/${file.id}.png`, thumbBuffer);
									break;
								} default: {
									if (req.body.type == "movie" && file.type == "movie") {
										const xmlPath = path.join(__dirname, "../../_SAVED", file.id + ".xml");
										const thumbPath = path.join(__dirname, "../../_SAVED", file.id + ".png");
										const xml = fs.readFileSync(xmlPath);
										const thumb = fs.readFileSync(thumbPath);

										const pathBase = `movie/${file.id}`;
										fUtil.addToZip(zip, pathBase + ".xml", xml);
										fUtil.addToZip(zip, pathBase + ".png", thumb);
									}
									else if (req.body.subtype != "video" && file.subtype != "tts") {
										const buffer = Asset.load(file.id, true);
										fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
									}
									else {
										if (file.subtype == "video") {
											const buffer = Asset.load(file.id, true);
											fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
											const thumbnailPath = path.join(__dirname, "../../_ASSETS", file.id.slice(0, -3) + "png");
											const thumbnail = fs.readFileSync(thumbnailPath);
											fUtil.addToZip(zip, `${file.type}/${file.id.slice(0, -3) + "png"}`, thumbnail);
										}
									}
								}
							}
						}
						if (xml == undefined) fUtil.addToZip(zip, "desc.xml", Buffer.from(`<theme id="ugc" moreBg="0">${xml}</theme>`));
						else fUtil.addToZip(zip, "desc.xml", Buffer.from(`<theme id="ugc" moreBg="0">${xml.substring(9)}</theme>`));
					}
					else if (req.body.type == "bg") {
						const files = DB.select("assets", jason);
						for (const file of files) {
							switch (file.type) {
								case "char": {
									const buffer = fs.readFileSync(path.join(folder, `${file.id}.xml`));
									const thumbBuffer = fs.readFileSync(path.join(folder, `${file.id}.png`));
									fUtil.addToZip(zip, `char/${file.id}/${file.id}.xml`, buffer);
									fUtil.addToZip(zip, `char/${file.id}/${file.id}.png`, thumbBuffer);
									break;
								} default: {
									if (req.body.type == "movie" && file.type == "movie") {
										const xmlPath = path.join(__dirname, "../../_SAVED", file.id + ".xml");
										const thumbPath = path.join(__dirname, "../../_SAVED", file.id + ".png");
										const xml = fs.readFileSync(xmlPath);
										const thumb = fs.readFileSync(thumbPath);

										const pathBase = `movie/${file.id}`;
										fUtil.addToZip(zip, pathBase + ".xml", xml);
										fUtil.addToZip(zip, pathBase + ".png", thumb);
									}
									else if (req.body.subtype != "video" && file.subtype != "tts") {
										console.log(file.id);
										const buffer = Asset.load(file.id, true);
										fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
									}
									else {
										if (file.subtype == "video") {
											const buffer = Asset.load(file.id, true);
											fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
											const thumbnailPath = path.join(__dirname, "../../_ASSETS", file.id.slice(0, -3) + "png");
											const thumbnail = fs.readFileSync(thumbnailPath);
											fUtil.addToZip(zip, `${file.type}/${file.id.slice(0, -3) + "png"}`, thumbnail);
										}
									}
								}
							}
						}
						fUtil.addToZip(zip, "desc.xml", Buffer.from(listAssets(jason)));
					}
					else if (req.body.type == "video")
					{
						jason = { "type": "prop", "count": "48", "page": req.body.page };
						let xml;
						const files = DB.select("assets", jason);
						for (const file of files) {
							console.log(file.subtype);
							if (file.subtype == "video") {
								xml += Asset.meta2Xml(file);
							}
						}					
					}
					else if (req.body.type == "prop") {
						//This is the inifite scroller page code
						//Really hard because I have to manually make pages
						const files = DB.select("assets", jason);
						let pop;
						let nexties = 0;
						console.log("page is:" + page);
						let poop = 0;
						for (const v of files) {
							if (poop < render && page == 1) {
								if (v.subtype != "video") {
									pop += Asset.meta2Xml(v);
								}
							}
							else if (off < poop && poop < off2 + 1 && page > 1) {
								if (v.subtype != "video") {
									pop += Asset.meta2Xml(v);
									console.log("The stuff is in the nexty page besti");
								}
								nexties++;
							}
							poop++;
						}
						console.log(poop);
						console.log("who made it to the next page?" + nexties);
						offset++;
						if (pop === undefined) {
							fUtil.addToZip(zip, "desc.xml", Buffer.from(`<theme id="ugc" moreProp="0"></theme>`));
						}
						else {
							fUtil.addToZip(zip, "desc.xml", Buffer.from(`<theme id="ugc" moreProp="1">${pop.substring(9)}</theme>`));
						}
						console.log(`<theme id="ugc" moreProp="1">${pop}</theme>`);
					}
					else {
						fUtil.addToZip(zip, "desc.xml", Buffer.from(listAssets(jason)));
					}
				}
				else {
					fUtil.addToZip(zip, "desc.xml", Buffer.from(`<theme id="ugc"></theme>`));
				}

				const files = DB.select("assets", jason);
				console.log(files);
				if (req.body.type != "char") {
					for (const file of files) {
						switch (file.type) {
							case "char": {
								const buffer = fs.readFileSync(path.join(folder, `${file.id}.xml`));
								const thumbBuffer = fs.readFileSync(path.join(folder, `${file.id}.png`));
								fUtil.addToZip(zip, `char/${file.id}/${file.id}.xml`, buffer);
								fUtil.addToZip(zip, `char/${file.id}/${file.id}.png`, thumbBuffer);
								break;
							} default: {
								if (req.body.type == "movie" && file.type == "movie") {
									const xmlPath = path.join(__dirname, "../../_SAVED", file.id + ".xml");
									const thumbPath = path.join(__dirname, "../../_SAVED", file.id + ".png");
									const xml = fs.readFileSync(xmlPath);
									const thumb = fs.readFileSync(thumbPath);

									const pathBase = `movie/${file.id}`;
									fUtil.addToZip(zip, pathBase + ".xml", xml);
									fUtil.addToZip(zip, pathBase + ".png", thumb);
								}
								else if (req.body.subtype != "video" && file.subtype != "tts") {
									console.log(file.id);
									const buffer = Asset.load(file.id, true);
									fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
								}
								else {
									const trim = file.id.slice(0, -4);
									const buffer = Asset.load(file.id, true);
									const thumbBuffer = fs.readFileSync(path.join(folder, `${file.id}.png`));
									fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
									fUtil.addToZip(zip, `prop/${trim}.png`, thumbBuffer);
								}
							}
						}
					}
				}
			}
			res.setHeader("Content-Type", "application/zip");
			res.write(base);
			res.end(await zip.zip());
		}
		else {
			let jason;
			jason = { "type": "prop", "count": "9000", "page": "0" };
			fUtil.addToZip(zip, "desc.xml", Buffer.from(listAssets(jason)));
			console.log("page is:" + page);
			const files = DB.select("assets", jason);
			console.log(files);
			for (const file of files) {
				if (dafourty < render) {
					switch (file.type) {
						case "char": {
							const buffer = fs.readFileSync(path.join(folder, `${file.id}.xml`));
							const thumbBuffer = fs.readFileSync(path.join(folder, `${file.id}.png`));
							fUtil.addToZip(zip, `char/${file.id}/${file.id}.xml`, buffer);
							fUtil.addToZip(zip, `char/${file.id}/${file.id}.png`, thumbBuffer);
							break;
						} default: {
							if (req.body.type == "movie" && file.type == "movie") {
								const xmlPath = path.join(__dirname, "../../_SAVED", file.id + ".xml");
								const thumbPath = path.join(__dirname, "../../_SAVED", file.id + ".png");
								const xml = fs.readFileSync(xmlPath);
								const thumb = fs.readFileSync(thumbPath);

								const pathBase = `movie/${file.id}`;
								fUtil.addToZip(zip, pathBase + ".xml", xml);
								fUtil.addToZip(zip, pathBase + ".png", thumb);
							}
							else if (req.body.subtype != "video" && file.subtype != "tts") {
								console.log(file.id);
								const buffer = Asset.load(file.id, true);
								fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
							}
							else {
								const trim = file.id.slice(0, -4);
								const buffer = Asset.load(file.id, true);
								const thumbBuffer = fs.readFileSync(path.join(folder, `${file.id}.png`));
								fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
								fUtil.addToZip(zip, `prop/${trim}.png`, thumbBuffer);
							}
						}
					}
				}
				else if (off < dafourty && dafourty < off2 + 1 && page > 1) {
					switch (file.type) {
						case "char": {
							const buffer = fs.readFileSync(path.join(folder, `${file.id}.xml`));
							const thumbBuffer = fs.readFileSync(path.join(folder, `${file.id}.png`));
							fUtil.addToZip(zip, `char/${file.id}/${file.id}.xml`, buffer);
							fUtil.addToZip(zip, `char/${file.id}/${file.id}.png`, thumbBuffer);
							break;
						} default: {
							if (req.body.type == "movie") {
								const buffer = fs.readFileSync(path.join(savedfolder, `${file.id}.png`));
								const xmlBuffer = fs.readFileSync(path.join(savedfolder, `${file.id}.xml`));
								fUtil.addToZip(zip, `${file.type}/${file.id}/${file.id}.png`, buffer);
								fUtil.addToZip(zip, `${file.type}/${file.id}/${file.id}.xml`, xmlBuffer);
							}
							else if (req.body.type != "video") {
								const buffer = Asset.load(file.id, true);
								fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
							}
							else {
								const trim = file.id.slice(0, -4);
								const buffer = Asset.load(file.id, true);
								const thumbBuffer = fs.readFileSync(path.join(folder, `${file.id}.png`));
								fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
								fUtil.addToZip(zip, `prop/${trim}.png`, thumbBuffer);
							}
						}
					}
				}
				dafourty++;
			}
		}
	})
	.route("POST", "/goapi/getCommunityAssets/", async (req, res) => {
		const meta = DB.select("comm", "prop");
		const zip = nodezip.create();
		let isProp;
		if (req.body.type == "prop") {
			isProp = true;
		}
		else {
			isProp = false;
		}
		let xmltext = isProp ? "moreProp" : "moreBG";
		console.log(xmltext);
		var tXml = `<theme id="Comm" name="Community Library" ${xmltext}="1">`;
		for (const v of meta) {
			if (v.type == req.body.type) tXml += Asset.meta2StareXml(v);
		}
		tXml += "</theme>"
		const jason = { "type": req.body.type, "count": req.body.count, "page": req.body.page };
		fUtil.addToZip(zip, "desc.xml", Buffer.from(tXml));
		const files = DB.select("comm", jason);
		if (req.body.type == "prop" || req.body.type == "bg") {
			for (const file of files) {
				switch (file.type) {
					case "char": {
						const buffer = fs.readFileSync(path.join(commFolder, `${file.id}.xml`));
						const thumbBuffer = fs.readFileSync(path.join(commFolder, file.type, `${file.id}.png`));
						fUtil.addToZip(zip, `${file.id}.xml`, buffer);
						fUtil.addToZip(zip, `${file.id}.png`, thumbBuffer);
						break;
					} default: {
						const buffer = Asset.load(file.id, true);
						fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
					}
				}
			}
			res.setHeader("Content-Type", "application/zip");
			res.write(base);
			res.end(await zip.zip());
		}
		else if (req.body.type == "char") {
			const myname = path.join(sFolder, "Comm/char");
			const tXml = `<theme id="Comm" name="Community Library"><char id="Robert" name="Robert Ivey" published="1" facing="left" thumb="Ivey.swf" default="Ivey.swf"><tags/><action id="Ivey.swf" name="Be a Teacher"/></char>
		<char id="233241" name="Noni" published="1" facing="left" thumb="233242.swf" default="233242.swf"><tags>noni destruction goddess</tags><action id="233242.swf" name="Standing"/><action id="233243.swf" name="Jump"/><action id="233244.swf" name="Talk"/><action id="190997498.swf" name="001b_thumbnail"/></char>
		<char id="378278" name="happybunny" facing="left" thumb="378283.swf" default="378283.swf"><tags>happybunny</tags><action id="378279.swf" name="hit_with_hammer"/><action id="378280.swf" name="guitar" enable="Y"/><action id="378281.swf" name="dance"/><action id="378282.swf" name="fart"/><action id="378283.swf" name="standing"/><action id="378284.swf" name="dance"/><action id="378285.swf" name="happy"/><action id="378286.swf" name="make_fun_of"/><action id="378287.swf" name="show_butt"/><action id="378288.swf" name="tag_wall"/><action id="378289.swf" name="walk"/><action id="378320.swf" name="hit_with_hammer"/><action id="378323.swf" name="hit_with_hammer"/><action id="378351.swf" name="hit_with_hammer" enable="Y"/><action id="378472.swf" name="tag_wall"/><action id="378508.swf" name="happy"/><action id="378557.swf" name="hit_with_hammer2"/></char>
		<char id="547316" name="GIGI" published="1" facing="left" thumb="547317.swf" default="547317.swf"><tags>cutepets</tags><action id="547317.swf" name="stand"/><action id="547319.swf" name="shy"/><action id="547322.swf" name="sleeping"/><action id="547324.swf" name="walk"/><action id="547331.swf" name="furious"/></char>
		<char id="547337" name="SUSU" published="1" facing="left" thumb="547341.swf" default="547341.swf"><tags>cutepets</tags><action id="547338.swf" name="confused"/><action id="547339.swf" name="sad"/><action id="547341.swf" name="stand"/><action id="547343.swf" name="walk"/><action id="547351.swf" name="talk"/></char>
		<char id="547369" name="Cubic Bear" published="1" facing="left" thumb="547370.swf" default="547370.swf"><tags>cubicpets</tags><action id="547370.swf" name="standing"/><action id="547374.swf" name="talking"/><action id="547380.swf" name="grabbed"/><action id="547381.swf" name="walking"/><action id="547418.swf" name="sleeping"/></char>
		<char id="547400" name="Luna" published="1" facing="left" thumb="547406.swf" default="547406.swf"><tags>watervalley</tags><action id="547401.swf" name="bow_greet"/><action id="547402.swf" name="sit"/><action id="547403.swf" name="sit_read"/><action id="547405.swf" name="sit_talk"/><action id="547406.swf" name="standing"/><action id="547408.swf" name="talk"/><action id="547410.swf" name="walk"/></char>
		<char id="547421" name="Cubic Cat" published="1" facing="left" thumb="547422.swf" default="547422.swf"><tags>cubicpets</tags><action id="547422.swf" name="standing"/><action id="547423.swf" name="talking"/><action id="547424.swf" name="sleeping"/><action id="547425.swf" name="shy"/><action id="547426.swf" name="walking"/></char>
		<char id="547437" name="Bamboo" published="1" facing="left" thumb="547438.swf" default="547438.swf"><tags>watervalley</tags><action id="547438.swf" name="standing"/><action id="547439.swf" name="sit"/><action id="547440.swf" name="sit_talk"/><action id="547442.swf" name="walk"/><action id="554124.swf" name="talk"/></char>
		<char id="561462" name="Monkey Character by Sogeking" published="1" facing="left" thumb="561463.swf" default="561463.swf"><tags>sogeking</tags><action id="561463.swf" name="Stand"/><action id="561508.swf" name="angry"/><action id="561570.swf" name="bored"/><action id="561574.swf" name="confused"/><action id="561647.swf" name="dance"/><action id="561735.swf" name="desperate"/><action id="561850.swf" name="die"/><action id="561899.swf" name="drop_prop"/><action id="561940.swf" name="talk"/><action id="563982.swf" name="scared"/><action id="563994.swf" name="shy"/><action id="564013.swf" name="fart"/><action id="564023.swf" name="furious"/><action id="564048.swf" name="happy"/><action id="564069.swf" name="walk"/></char>
		<char id="564521" name="disco monkey by Sogeking" money="90" published="1" facing="left" thumb="564522.swf" default="564522.swf"><tags>sogeking</tags><action id="564522.swf" name="talk_disco"/><action id="564543.swf" name="stand_disco"/></char>
		<char id="564526" name="Monkey girl by Sogeking" published="1" facing="left" thumb="564527.swf" default="564527.swf"><tags>stand_girl</tags><action id="564527.swf" name="stand_girl"/><action id="564528.swf" name="shy_girl"/></char>
		<char id="585035" name="Ham Polo by PaulToon" published="1" facing="left" thumb="585036.swf" default="585036.swf"><tags>paultoon,star wars,han solo</tags><action id="585036.swf" name="Han solo default"/><action id="585037.swf" name="Han Solo talk"/><action id="640941.swf" name="Han Solo Draw Gun"/><action id="640943.swf" name="Han Solo Shoot Gun"/></char>
		<char id="585038" name="Munchy by PaulToon" published="1" facing="left" thumb="585039.swf" default="585039.swf"><tags>chewbacca,chewy,paultoon,star wars</tags><action id="585039.swf" name="Chewy default"/><action id="585041.swf" name="Chewy roar"/><action id="646385.swf" name="Munchy Draw Gun"/><action id="646386.swf" name="Muncy Stand with Gun"/><action id="646387.swf" name="Munchy Shoot Gun"/></char>
		<char id="591484" name="Monkey teacher_by Sogeking" published="1" facing="left" thumb="591486.swf" default="591486.swf"><tags>monkey,sogeking,teacher</tags><action id="591485.swf" name="talk"/><action id="591486.swf" name="stand"/><action id="591496.swf" name="talk2"/></char>
		<char id="652890" name="Roundie" published="1" facing="left" thumb="652891.swf" default="652891.swf"><tags>standing</tags><action id="652891.swf" name="standing"/><action id="652892.swf" name="walk"/></char>
		<char id="774742" name="Isogirl" published="1" facing="left" thumb="1082219.swf" default="1082219.swf"><tags>isometrix</tags><action id="1082202.swf" name="Front - Sitting"/><action id="1082208.swf" name="Back - Sitting"/><action id="1082210.swf" name="Back - Still"/><action id="1082212.swf" name="Back - Walk"/><action id="1082214.swf" name="Back - Pointing"/><action id="1082216.swf" name="Front - Point"/><action id="1082219.swf" name="Front - Still"/><action id="1082220.swf" name="Front - Talk"/><action id="1082221.swf" name="Front - Walk"/><action id="1129808.swf" name="Side - Still"/><action id="1129897.swf" name="Side - Fall"/><action id="1129898.swf" name="Side - Get Hit"/><action id="1129899.swf" name="Side - Hit"/><action id="1129901.swf" name="Side - Point"/><action id="1129904.swf" name="Side - Sitting"/><action id="1129905.swf" name="Side - Talk"/><action id="1129906.swf" name="Side - Walk"/></char>
		<char id="851906" name="StickFighter" published="1" facing="left" thumb="851978.swf" default="851978.swf"><tags>coady,stickfighter,tnp</tags><action id="851978.swf" name="Ready to fight"/><action id="851982.swf" name="taunt"/><action id="851998.swf" name="frontflip"/><action id="852025.swf" name="headjab"/><action id="852029.swf" name="Jab"/><action id="856681.swf" name="hands up"/><action id="887226.swf" name="headjab1"/><action id="933389.swf" name="headKick"/><action id="933390.swf" name="gutkick"/><action id="938816.swf" name="footsweep"/><action id="939706.swf" name="Judo Chop"/><action id="939710.swf" name="headhook"/><action id="939711.swf" name="Jumpkick"/><action id="939838.swf" name="get hit head"/><action id="940047.swf" name="knockout head front"/><action id="940058.swf" name="all fours exhausted"/><action id="946274.swf" name="get hit gut"/><action id="1003951.swf" name="head multiple punches"/><action id="1004033.swf" name="kickbacktohead"/><action id="1004236.swf" name="superman"/><action id="1006340.swf" name="WalkFightReady2"/><action id="1017851.swf" name="footsweep, get hit"/><action id="1046931.swf" name="Double AxHandle"/><action id="1046933.swf" name="jump"/></char>
		<char id="875334" name="Batty" published="1" facing="left" thumb="876057.swf" default="876057.swf"><tags>b&amp;aring;t,bat,b&#xE5;t,coady</tags><action id="875417.swf" name="Flying"/><action id="876057.swf" name="hanging still"/><action id="876179.swf" name="Batty Sleeping"/><action id="876227.swf" name="hanging talking"/></char>
		<char id="907852" name="Match Cool" published="1" facing="left" thumb="907853.swf" default="907853.swf"><tags>match</tags><action id="907853.swf" name="stand"/><action id="907856.swf" name="walk"/><action id="907857.swf" name="attack"/><action id="919952.swf" name="look at watch"/><action id="919970.swf" name="attack 2"/><action id="920009.swf" name="talk"/></char>
		<char id="998655" name="Gipsy" published="1" facing="left" thumb="1773356.swf" default="1773356.swf"><tags>gipsy,tnp</tags><action id="1773327.swf" name="Enojado"/><action id="1773342.swf" name="reirse"/><action id="1773345.swf" name="babear"/><action id="1773349.swf" name="soporte desde atr&#xE1;s"/><action id="1773351.swf" name="Jadeante"/><action id="1773356.swf" name="posici&#xF3;n"/><action id="1773360.swf" name="sacudi&#xF3;"/><action id="1773376.swf" name="sorprendido"/><action id="1773377.swf" name="hablar"/><action id="1773381.swf" name="Paseo"/><action id="111390364.swf" name="uppercut"/></char>
		<char id="1271772" name="BATOMBILE by section31" published="1" facing="left" thumb="1271787.swf" default="1271787.swf"><tags>batman</tags><action id="1271773.swf" name="DRIVE HEADLIGHTS"/><action id="1271776.swf" name="parked"/><action id="1271778.swf" name="lights on"/><action id="1271779.swf" name="lights off"/><action id="1271787.swf" name="default"/></char>
		<char id="1306082" name="CATWOMAN" published="1" facing="left" thumb="1306181.swf" default="1306181.swf"><tags>stand</tags><action id="1306135.swf" name="scheming"/><action id="1306164.swf" name="walk"/><action id="1306181.swf" name="stand"/><action id="1307395.swf" name="kiss"/><action id="1985062.swf" name="threaten"/><action id="1985067.swf" name=" murdered"/><action id="1985105.swf" name="talk"/><action id="1985156.swf" name=" think"/><action id="1985823.swf" name="on bike"/></char>
		<char id="1324346" name="FA Artist" published="1" facing="left" thumb="1324355.swf" default="1324355.swf"><tags>chaostoon</tags><action id="1324347.swf" name="artist gets easel back CS4"/><action id="1324354.swf" name="Artist yelling hey CS4"/><action id="1324355.swf" name="i need help moving hold CS4"/><action id="1324358.swf" name="woah doctor bills CS4"/><action id="1324479.swf" name="artist whats FA CS4"/><action id="1324480.swf" name="Artist painting CS4"/><action id="1324569.swf" name="i need help CS4"/><action id="199399952.swf" name="Jack New Crying"/><action id="199400095.swf" name="Jack New Good Job"/><action id="200378157.swf" name="Queen angry"/></char>
		<char id="1885278" name="Police Car" published="1" facing="left" thumb="1885279.swf" default="1885279.swf"><tags>car,police,p&#xF3;lice,tet,tetpolicecar</tags><action id="1885279.swf" name="Parked"/><action id="1885281.swf" name="Cruising"/><action id="1885286.swf" name="Pursuit"/><action id="1885287.swf" name="Credit"/></char> 
		<char id="1969493" name="CATHERINE WHEELS" published="1" facing="left" thumb="1969534.swf" default="1969534.swf"><tags>default</tags><action id="1969495.swf" name="move"/><action id="1969520.swf" name="spinaround"/><action id="1969534.swf" name="default"/><action id="1969570.swf" name=" fire energy blast"/><action id="1969571.swf" name=" fire energy blast still"/><action id="1969612.swf" name=" car park"/><action id="1969615.swf" name=" transmogrify"/></char>
		<char id="14187548" name="Hidden Sonic 2" published="1" facing="left" thumb="14187550.swf" default="14187550.swf"><tags>sonic joke2</tags><action id="14187550.swf" name="Sonic Joke2"/></char>
		<char id="ios" name="ios" published="1" facing="left" thumb="ios.swf" default="ios.swf"><action id="ios.swf" name="stand"/></char>
		<char id="android" name="android" published="1" facing="left" thumb="android.swf" default="android.swf"><action id="android.swf" name="stand"/></char>
		<char id="elephant" name="elephant" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
		<char id="giraffe" name="giraffe" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
		<char id="hippo" name="hippo" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
		<char id="wildpig" name="wildpig" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
		<char id="zebra" name="zebra" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
		<char id="66709814" name="Knuckles by Johnny Hotdog" published="1" facing="left" thumb="66709815.swf" default="66709815.swf"><tags>jhcharacters</tags><action id="66709815.swf" name="Knuckles"/><action id="66709876.swf" name="knuckles_ball"/><action id="66709921.swf" name="knuckles_ball_running"/><action id="66709932.swf" name="knuckles_run"/><action id="66709960.swf" name="knuckles_run2"/><action id="66709967.swf" name="knuckles_standby"/></char>
		<char id="66712491" name="Darth Vader by Johnny Hotdog" published="1" facing="left" thumb="66712492.swf" default="66712492.swf"><tags>jhcharacters</tags><action id="66712492.swf" name="Darth Vader"/><action id="66712510.swf" name="darthvader_back"/><action id="66712570.swf" name="darthvader_back_slash"/><action id="66712584.swf" name="darthvader_back_slash_2"/><action id="66712591.swf" name="darthvader_psy"/><action id="66712641.swf" name="darthvader_front_slash"/><action id="66712759.swf" name="darthvader_walk"/></char>
		<char id="66713375" name="Dr.Eggman by Johnny Hotdog" published="1" facing="left" thumb="66713376.swf" default="66713376.swf"><tags>jhcharacters</tags><action id="66713376.swf" name="eggman_facefront"/><action id="66713389.swf" name="eggman_faceright"/></char>
		<char id="87303429" name="Sonic by Chaostoon" published="1" facing="left" thumb="87305017.swf" default="87305017.swf"><tags>chaostoon</tags><action id="87303430.swf" name="Ball Rolling"/><action id="87303987.swf" name="Eat a Chilidog"/><action id="87304035.swf" name="Run 3"/><action id="87304062.swf" name="Homing"/><action id="87304085.swf" name="Homing Attack"/><action id="87304104.swf" name="Kick"/><action id="87304308.swf" name="Punch"/><action id="87304380.swf" name="Revv up Rolling Ball"/><action id="87304409.swf" name="Run 1"/><action id="87304503.swf" name="Stop"/><action id="87304548.swf" name="Spinball"/><action id="87304585.swf" name="Standing"/><action id="87304647.swf" name="Super Sonic flying"/><action id="87304677.swf" name="Angry"/><action id="87304739.swf" name="Happy"/><action id="87304775.swf" name="Laugh"/><action id="87304820.swf" name="Taunt"/><action id="87304851.swf" name="Thumbs Up"/><action id="87304920.swf" name="Super Sonic Transform"/><action id="87304942.swf" name="Super Sonic Transform Back"/><action id="87304960.swf" name="Turn into Spinball"/><action id="87305017.swf" name="Waiting"/><action id="87306283.swf" name="Run 2"/></char></theme>`;
			const zip = nodezip.create();
			fUtil.addToZip(zip, "desc.xml", Buffer.from(tXml));
			fs.readdirSync(myname).forEach(charFolder => {
				fs.readdirSync(path.join(myname, charFolder)).forEach(file => {
					if (file.includes("head")) {
						fs.readdirSync(path.join(myname, `${charFolder}/head`)).forEach(file2 => {
							const buffer = fs.readFileSync(path.join(myname, `${charFolder}/head/${file2}`));
							fUtil.addToZip(zip, `char/${charFolder}/head/${file2}`, buffer);
						})
					} else {
						console.log(`${charFolder}/${file}`);
						const buffer = fs.readFileSync(path.join(myname, `${charFolder}/${file}`));
						fUtil.addToZip(zip, `char/${charFolder}/${file}`, buffer);
					}
				});
			});
			res.setHeader("Content-Type", "application/zip");
			res.end(Buffer.concat([base, await zip.zip()]));
		}
		else {
			const folder = path.join(sFolder, "Comm/effect")
			const tXml = `<theme id="Comm" name="Community Library"><effect id="130628688.swf" name="fx01" type="ANIME" resize="false" move="false" published="1"><tags></tags></effect><effect id="378470.swf" name="tagging" type="ANIME" resize="false" move="false" published="1"><tags></tags></effect><effect id="328993953.swf" name="bubbles" type="ANIME" resize="false" move="false" published="1"><tags>bubbles,nicolas</tags></effect><effect id="378470.swf" name="tagging" type="ANIME" resize="false" move="false" published="1"><tags>happybunny</tags></effect><effect id="378687.swf" name="blur" type="ANIME" resize="false" move="false" published="1"><tags>happybunny</tags></effect><effect id="427112.swf" name="bubbles" type="ANIME" resize="false" move="false" published="1"><tags>bubbles,nicolas</tags></effect><effect id="328995073.swf" name="bubbles" type="ANIME" resize="false" move="false" published="1"><tags>bubbles,nicolas</tags></effect><effect id="275586.swf" name="speed" type="ANIME" resize="false" move="false" published="1"><tags>speed</tags></effect><effect id="267341.swf" name="BOOM2" type="ANIME" resize="false" move="false" published="1"><tags>effect</tags></effect><effect id="823760.swf" name="warpspeed" type="ANIME" resize="false" move="false" published="1"><tags>section31</tags></effect><effect id="267344.swf" name="BOOM3" type="ANIME" resize="false" move="false" published="1"><tags>effect</tags></effect><effect id="469632.swf" name="light by sogeking" type="ANIME" resize="false" move="false" published="1"><tags>effect,light,sogeking</tags></effect><effect id="439039.swf" name="speed" type="ANIME" resize="false" move="false" published="1"><tags>speed</tags></effect><effect id="275699.swf" name="speed" type="ANIME" resize="false" move="false" published="1"><tags>speed</tags></effect><effect id="236080.swf" name="Star" type="ANIME" resize="false" move="false" published="1"><tags>star</tags></effect><effect id="1211151.swf" name="arrowfx" type="ANIME" resize="false" move="false" published="1"><tags>section31</tags></effect><effect id="267339.swf" name="BOOM" type="ANIME" resize="false" move="false" published="1"><tags>effect</tags></effect></theme>`;
			const zip = nodezip.create();
			fUtil.addToZip(zip, "desc.xml", Buffer.from(tXml));
			fs.readdirSync(folder).forEach(file => {
				const buffer = fs.readFileSync(path.join(folder, file));
				fUtil.addToZip(zip, `effect/${file}`, buffer);
			});
			res.setHeader("Content-Type", "application/zip");
			res.end(Buffer.concat([base, await zip.zip()]));
		}
	})
	.route("POST", "/goapi/getSysTemplates/", async (req, res) => {
		const meta = DB.select("comm", "movie", "goapi", "getSysTemplates", "getSysTemplates", "starterTemplates");
		const zip = nodezip.create();
		let isProp;
		if (req.body.type == "movie", "goapi", "getSysTemplates", "getSysTemplates", "starterTemplates") {
			isMovie = true;
		}
		let xmltext = isProp ? "moreProp" : "moreBG";
		console.log(xmltext);
		var tXml = `<theme id="Comm" name="Community Library" ${xmltext}="1">`;
		for (const v of meta) {
			if (v.type == req.body.type) tXml += Asset.meta2StareXml(v);
		}
		tXml += "</theme>"
		const jason = { "type": req.body.type, "count": req.body.count, "page": req.body.page };
		fUtil.addToZip(zip, "desc.xml", Buffer.from(tXml));
		const files = DB.select("comm", jason);
		if (req.body.type == "movie") {
			for (const file of files) {
				switch (file.type) {
					case "movie": {
						const buffer = fs.readFileSync(path.join(CommFolder, `${file.id}.png`));
						const xmlBuffer = fs.readFileSync(path.join(CommFolder, `${file.id}.xml`));
						fUtil.addToZip(zip, `${file.type}/${file.id}/${file.id}.png`, buffer);
						fUtil.addToZip(zip, `${file.type}/${file.id}/${file.id}.xml`, xmlBuffer);
						break;
					} default: {
						const buffer = Asset.load(file.id, true);
						fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
					}
				}
			}
			res.setHeader("Content-Type", "application/zip");
			res.write(base);
			res.end(await zip.zip());
		}
		else if (req.body.type == "movie", "goapi", "getSysTemplates", "getSysTemplates", "starterTemplates") {
			const myname = path.join(sFolder, "CommFolder");
			const tXml = ``;
			const zip = nodezip.create();
			fUtil.addToZip(zip, "desc.xml", Buffer.from(tXml));
			fs.readdirSync(myname).forEach(CommFolder => {
				fs.readdirSync(path.join(myname, CommFolder)).forEach(file => {
					if (file.includes("movie", "goapi", "getSysTemplates", "getSysTemplates", "starterTemplates")) {
						fs.readdirSync(path.join(myname, `${CommFolder}/goapi/getSysTemplates/getSysTemplates/starterTemplates`)).forEach(file2 => {
							const buffer = fs.readFileSync(path.join(myname, `${CommFolder}/goapi/getSysTemplates/getSysTemplates/starterTemplates/${file2}`));
							fUtil.addToZip(zip, `Comm/${CommFolder}/goapi/getSysTemplates/getSysTemplates/starterTemplates/${file2}`, buffer);
						})
					} else {
						console.log(`${CommFolder}/${file}`);
						const buffer = fs.readFileSync(path.join(myname, `${CommFolder}/${file}`));
						fUtil.addToZip(zip, `Comm/${CommFolder}/${file}`, buffer);
					}
				});
			});
			res.setHeader("Content-Type", "application/zip");
			res.end(Buffer.concat([base, await zip.zip()]));
		}
	})
	.route("POST", "/goapi/getUserAssetsXml/", (req, res) => {
		res.assert(req.body.type, 400, { status: "error" });
		res.setHeader("Content-Type", "application/xml");
		const jason = { "type": req.body.type, "count": req.body.count, "page": req.body.page };
		const no = listAssets(jason);
		if (!req.body.themeId) {
			res.end(no);
		}
		else {
			let themeId;
			switch (req.body.themeId) {
				case "custom":
					themeId = "family"; break;
				case "action":
				case "animal":
				case "botdf":
				case "space":
					themeId = "cc2"; break;
				default: themeId = req.body.themeId;
			}
			const filters = {
				themeId,
				type: "char"
			};
			res.setHeader("Content-Type", "application/xml");
			res.end(listAssets(filters));
		}
	})
	.route("GET", "/api/assets/list", (req, res) => {
		res.json(DB.select("assets"));
	})
	// load
	.route("POST", "/goapi/convertTextToSoundAsset/", async (req, res) => {
		if (req.body.v == "2010") {
			checkcode = 2;
		}
		else {
			checkcode = 1;
		}
		let { voice, text } = req.body;
		let fromttsvoice = info.voices[voice.toLowerCase()];
		res.assert(voice, text, 400, "");
		//Old voices for David and lawrence
		if (req.body.v == "2010") {
			if (voice.toLowerCase() == "david") {
				voice = "david2";
				fromttsvoice = info.voices[voice.toLowerCase()];
			}

			if (voice.toLowerCase() == "lawrence") {
				voice = "lawrence2";
				fromttsvoice = info.voices[voice.toLowerCase()];
			}
		}
		//Do a different function if its a from text to speech voice
		if (fromttsvoice.source != "local" && fromttsvoice.source != "swiftengine" && fromttsvoice.source != "labs" && fromttsvoice.source != "ibox") {
			try {
				const filepath = tempfile(".mp3");
				const writeStream = fs.createWriteStream(filepath);
				let readStream;
				console.log(voice)
				if (req.body.v == "2010") {
					if (voice.toLowerCase() == "paul") {
						voice = "paul2";
					}
				}
				readStream = await processVoice(voice.toLowerCase(), text, first);
				readStream.pipe(writeStream);

				writeStream.on("close", async () => {
					const duration = await rFileUtil.mp3Duration(filepath);
					const meta = {
						duration,
						type: "sound",
						subtype: "tts",
						title: `[${voices[voice.toLowerCase()].desc}] ${text}`
					}
					const id = await Asset.save(filepath, "mp3", meta);
					if (!req.body.v) {
						res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`);
					}
					else {
						res.end(`0<asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset>`);
					}
				});
			} catch (e) {
				console.error("Error generating TTS:", e);
				res.end(`1<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
			};
			first = false;
		}
		else {
			console.log("test");
			const buffer = await processVoice(voice.toLowerCase(), text, first);
			const duration = await rFileUtil.mp3Duration(buffer);
			const meta = {
				duration,
				type: "sound",
				subtype: "tts",
				title: `[${voices[voice.toLowerCase()].desc}] ${text}`
			}
			const id = await Asset.save(buffer, "mp3", meta);
			if (!req.body.v) {
				res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`);
			}
			else {
				res.end(`0<asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset>`);
			}
			const { exec } = require('child_process');
			setTimeout(deleteFile, 500);
			//Remove the file after its sent
			function deleteFile() {
				exec('rm file.mp3', (err, stdout, stderr) => {
					if (err) {
						// node couldn't execute the command
						return;
					}

				});
				exec('rm file2.mp3', (err, stdout, stderr) => {
					if (err) {
						// node couldn't execute the command
						return;
					}

				});
				exec('rm output.mp3', (err, stdout, stderr) => {
					if (err) {
						// node couldn't execute the command
						return;
					}
				});
			}
		}
	})
	// load
	.route("GET", /\/(assets\/head)\/([\S]+)/, async (req, res) => {
		var sizeOf = require('image-size');
		const sharp = require('sharp');
		let id = req.matches[2];
		const Char = require("../models/char");
		let realid = id.split("/");
		console.log("test", realid);
		//Make a head if it doesnt exist yet
		if (!fs.existsSync(path.join(__dirname, "../../_ASSETS", realid[1].slice(0, -4) + "_head.png"))) {
			sizeOf(path.join(__dirname, "../../_ASSETS", realid[1]), async function (err, dimensions) {
				console.log(err);
				let edith;
				let heig;
				console.log(dimensions.width, dimensions.height);
				for (var v = 0; v < Infinity; v += 0.01) {
					console.log(Math.round(dimensions.width / v));
					if (Math.round(v) == 2) {
						break;
					}
					if (dimensions.width > 70) {
						if (Math.round(dimensions.width / v) == 70) {
							console.log(Math.round(dimensions.width / v));
							edith = Math.round(dimensions.width / v);
							heig = Math.round(dimensions.height / v);
							break;
						}
					}
					else if (dimensions.width < 70) {
						if (Math.round(dimensions.width * v) == 70) {
							console.log(Math.round(dimensions.width * v));
							edith = Math.round(dimensions.width * v);
							heig = Math.round(dimensions.height * v);
							break;
						}
					}
					else {
						console.log("SAME!!!");
						edith = dimensions.width;
						heig = dimensions.height;
						break;
					}
				}
				const buffer = fs.readFileSync(path.join(__dirname, "../../_ASSETS", realid[1]));
				sharp(buffer).resize(edith, heig).toFile(path.join(__dirname, "../../_ASSETS", realid[1].slice(0, -4) + "_head.png"))
					.then(async function () {
						const bruffer = fs.readFileSync(path.join(__dirname, "../../_ASSETS", realid[1].slice(0, -4) + "_head.png"));
						sharp(bruffer).extract({ width: 70, height: 70, left: 0, top: 0 }).toFile(path.join(__dirname, "../../_ASSETS", realid[1].slice(0, -4) + "_head.png"))
							.then(async function () {
								sharp(fs.readFileSync(path.join(__dirname, "../../_ASSETS", realid[1].slice(0, -4) + "_head.png")))
								console.log("Image cropped, resized, and saved");
								res.end(fs.readFileSync(path.join(__dirname, "../../_ASSETS", realid[1].slice(0, -4) + "_head.png")));
							})
					})
				/*.catch(function (err) {
					console.log("An error occured");
					res.statusCode = "500";
					res.json({ "status": "error", "message": err });
				});*/
			});
		}
		else {
			res.end(fs.readFileSync(path.join(__dirname, "../../_ASSETS", realid[1].slice(0, -4) + "_head.png")));
		}
	})

	.route(
		"POST",
		[
			"/goapi/getAsset/",
			"/fbapi/getAsset/",
			"/goapi/getAssetEx/"
		],
		async (req, res) => {
			let id;
			switch (req.method) {
				case "GET":
					id = req.matches[2];
					break;
				case "POST":
					if (!req.body.enc_asset_id) { id = req.body.assetId; } else { id = req.body.enc_asset_id; }
					break;
				default:
					next();
					return;
			}
			if (!id) {
				res.statusCode = 400;
				res.end();
			}

			if (req.body.v == "2010" || req.body.v == "2011") {
				try {
					const file = Asset.load(id, true);
					res.end(Buffer.concat([base, file]));
				} catch (err) {
					if (err.message === "404") {
						res.statusCode = 404;
						res.end("1");
					} else {
						console.log("Error loading asset:", err);
						res.statusCode = 500;
						res.end("1");
					}
				}
			}
			else {
				try {
					res.end(Asset.load(id, true));
				} catch (err) {
					if (err.message === "404") {
						res.statusCode = 404;
						res.end("1");
					} else {
						console.log("Error loading asset:", err);
						res.statusCode = 500;
						res.end("1");
					}
				}
			}
		}
	)
	.route("*", [/\/(assets|goapi\/getAsset)\/([\S]+)/, /\/(fbapi\/getAsset)\/([\S]+)/], async (req, res) => {
		let id;
		switch (req.method) {
			case "GET":
				id = req.matches[2];
				break;
			case "POST":
				id = req.body.assetId;
				break;
			default:
				next();
				return;
		}
		if (!id) {
			res.statusCode = 400;
			res.end();
		}
		if (req.body.v == "2010") {
			const zip = await fUtil.zippy(folder, id);
			try {
				res.end(zip);
			} catch (err) {
				if (err.message === "404") {
					res.statusCode = 404;
					res.end("1");
				} else {
					console.log("Error loading asset:", err);
					res.statusCode = 500;
					res.end("1");
				}
			}
		}
		else {
			try {
				res.end(Asset.load(id, true));
			} catch (err) {
				if (err.message === "404") {
					res.statusCode = 404;
					res.end("1");
				} else {
					console.log("Error loading asset:", err);
					res.statusCode = 500;
					res.end("1");
				}
			}
		}
	})
	.route("*", "/static/store//.zip", async (req, res) => {
		try {
			const zip = nodezip.create();
			const file = fs.readFileSync((path.join(sFolder, `theme.xml`)));
			fUtil.addToZip(zip, "theme.xml", file);
			res.setHeader("Content-Type", "application/zip");
			res.end(await zip.zip());
		} catch (e) {
			console.log("Error loading theme:", e);
			res.status(404).end();
		}
	})
	// meta
	//  #get
	.route("POST", "/api_v2/asset/get", (req, res) => {
		const id = req.body?.data.id || req.body?.data.starter_id;
		res.assert(id, 400, { status: "error" });

		try {
			const info = DB.get("assets", id).data;
			console.log(info.isshared);
			type = info.type;
			// add stuff that will never be useful for an offline lvm clone
			info.share = { type: "none" };
			if (info.isshared == true) {
				info.published = "true";
			}
			else {
				info.published = "false";
			}
			res.json({
				status: "ok",
				data: info,
				test: type,
			});
		} catch (e) {
			console.log("Error getting asset info:", e);
			res.statusCode = 404;
			res.json({ status: "error", data: "That doesn't seem to exist." });
		}
	})
	//  #update
	.route("POST", "/api_v2/asset/update/", async (req, res) => {
		const id = req.body.data.id || req.body.data.starter_id;
		res.assert(id, 400, { status: "error" });
		const info = DB.get("assets", req.body.data.assetId).data;
		const template = { "type": info.type, "subtype": info.subtype, "title": req.body.data.title, "ptype": "placeable", "id": req.body.data.assetId, "share": req.body.data.tags };
		const nontemplate = { "type": info.type, "subtype": info.subtype, "title": req.body.data.title, "ptype": "placeable", "id": req.body.data.assetId, "tags": req.body.data.tags, "isshared": false };
		if (req.body.data.published == "1") {
			if (info.type != "char" || info.type != "starter") {
				try {
					if (!info.isshared) {
						nontemplate.isshared = true;
						DB.insert("comm", template);
						const buff = Asset.load(id, true);
						DB.update("assets", id, nontemplate);
						fs.writeFileSync(path.join(commFolder, info.type, info.id), buff);
						const zap = nodezip.create();
						const meta = DB.select("comm", "prop");
						var tXml = `<theme id="Comm" name="Community Library">`;
						for (const v of meta) {
							tXml += Asset.meta2StareXml(v);
						}
						tXml += `<effect id="130628688.swf" name="fx01" type="ANIME" resize="false" move="false" published="1"><tags></tags></effect><effect id="378470.swf" name="tagging" type="ANIME" resize="false" move="false" published="1"><tags></tags></effect><effect id="328993953.swf" name="bubbles" type="ANIME" resize="false" move="false" published="1"><tags>bubbles,nicolas</tags></effect><effect id="378470.swf" name="tagging" type="ANIME" resize="false" move="false" published="1"><tags>happybunny</tags></effect><effect id="378687.swf" name="blur" type="ANIME" resize="false" move="false" published="1"><tags>happybunny</tags></effect><effect id="427112.swf" name="bubbles" type="ANIME" resize="false" move="false" published="1"><tags>bubbles,nicolas</tags></effect><effect id="328995073.swf" name="bubbles" type="ANIME" resize="false" move="false" published="1"><tags>bubbles,nicolas</tags></effect><effect id="275586.swf" name="speed" type="ANIME" resize="false" move="false" published="1"><tags>speed</tags></effect><effect id="267341.swf" name="BOOM2" type="ANIME" resize="false" move="false" published="1"><tags>effect</tags></effect><effect id="823760.swf" name="warpspeed" type="ANIME" resize="false" move="false" published="1"><tags>section31</tags></effect><effect id="267344.swf" name="BOOM3" type="ANIME" resize="false" move="false" published="1"><tags>effect</tags></effect><effect id="469632.swf" name="light by sogeking" type="ANIME" resize="false" move="false" published="1"><tags>effect,light,sogeking</tags></effect><effect id="439039.swf" name="speed" type="ANIME" resize="false" move="false" published="1"><tags>speed</tags></effect><effect id="275699.swf" name="speed" type="ANIME" resize="false" move="false" published="1"><tags>speed</tags></effect><effect id="236080.swf" name="Star" type="ANIME" resize="false" move="false" published="1"><tags>star</tags></effect><effect id="1211151.swf" name="arrowfx" type="ANIME" resize="false" move="false" published="1"><tags>section31</tags></effect><effect id="267339.swf" name="BOOM" type="ANIME" resize="false" move="false" published="1"><tags>effect</tags></effect>`
						tXml += `<char id="Robert" name="Robert Ivey" published="1" facing="left" thumb="Ivey.swf" default="Ivey.swf"><tags/><action id="Ivey.swf" name="Be a Teacher"/></char>
						<char id="233241" name="Noni" published="1" facing="left" thumb="233242.swf" default="233242.swf"><tags>noni destruction goddess</tags><action id="233242.swf" name="Standing"/><action id="233243.swf" name="Jump"/><action id="233244.swf" name="Talk"/><action id="190997498.swf" name="001b_thumbnail"/></char>
						<char id="378278" name="happybunny" facing="left" thumb="378283.swf" default="378283.swf"><tags>happybunny</tags><action id="378279.swf" name="hit_with_hammer"/><action id="378280.swf" name="guitar" enable="Y"/><action id="378281.swf" name="dance"/><action id="378282.swf" name="fart"/><action id="378283.swf" name="standing"/><action id="378284.swf" name="dance"/><action id="378285.swf" name="happy"/><action id="378286.swf" name="make_fun_of"/><action id="378287.swf" name="show_butt"/><action id="378288.swf" name="tag_wall"/><action id="378289.swf" name="walk"/><action id="378320.swf" name="hit_with_hammer"/><action id="378323.swf" name="hit_with_hammer"/><action id="378351.swf" name="hit_with_hammer" enable="Y"/><action id="378472.swf" name="tag_wall"/><action id="378508.swf" name="happy"/><action id="378557.swf" name="hit_with_hammer2"/></char>
						<char id="452743" name="Pink" published="1" facing="left" thumb="452744.swf" default="452744.swf"><tags>pink-standing</tags><action id="452744.swf" name="pink-standing"/><action id="452745.swf" name="pink-close"/><action id="452746.swf" name="pink-open"/><action id="452747.swf" name="pink-talk"/><action id="452748.swf" name="pink-walk"/></char>
						<char id="452780" name="Orange" published="1" facing="left" thumb="452781.swf" default="452781.swf"><tags>orange-standing</tags><action id="452781.swf" name="orange-standing"/><action id="452782.swf" name="orange-close"/><action id="452783.swf" name="orange-open"/><action id="452784.swf" name="orange-talk"/><action id="515761.swf" name="orange-walk"/></char>
						<char id="515763" name="Blue" published="1" facing="left" thumb="515764.swf" default="515764.swf"><tags>nicolas trashcan</tags><action id="515764.swf" name="blue-standing"/><action id="515765.swf" name="blue-open"/><action id="515767.swf" name="blue-close"/><action id="515768.swf" name="blue-talk"/><action id="515769.swf" name="blue-walk"/></char>
						<char id="515771" name="Green" published="1" facing="left" thumb="515772.swf" default="515772.swf"><tags>green-standing</tags><action id="515772.swf" name="green-standing"/><action id="515774.swf" name="green-open"/><action id="515776.swf" name="green-talk"/><action id="515777.swf" name="green-walk"/><action id="515779.swf" name="green-close"/></char>
						<char id="515884" name="Red" published="1" facing="left" thumb="515885.swf" default="515885.swf"><tags>red-standing</tags><action id="515885.swf" name="red-standing"/><action id="515887.swf" name="red-close"/><action id="515888.swf" name="red-open"/><action id="515889.swf" name="red-talk"/><action id="515892.swf" name="red-walk"/></char>
						<char id="547316" name="GIGI" published="1" facing="left" thumb="547317.swf" default="547317.swf"><tags>cutepets</tags><action id="547317.swf" name="stand"/><action id="547319.swf" name="shy"/><action id="547322.swf" name="sleeping"/><action id="547324.swf" name="walk"/><action id="547331.swf" name="furious"/></char>
						<char id="547337" name="SUSU" published="1" facing="left" thumb="547341.swf" default="547341.swf"><tags>cutepets</tags><action id="547338.swf" name="confused"/><action id="547339.swf" name="sad"/><action id="547341.swf" name="stand"/><action id="547343.swf" name="walk"/><action id="547351.swf" name="talk"/></char>
						<char id="547369" name="Cubic Bear" published="1" facing="left" thumb="547370.swf" default="547370.swf"><tags>cubicpets</tags><action id="547370.swf" name="standing"/><action id="547374.swf" name="talking"/><action id="547380.swf" name="grabbed"/><action id="547381.swf" name="walking"/><action id="547418.swf" name="sleeping"/></char>
						<char id="547400" name="Luna" published="1" facing="left" thumb="547406.swf" default="547406.swf"><tags>watervalley</tags><action id="547401.swf" name="bow_greet"/><action id="547402.swf" name="sit"/><action id="547403.swf" name="sit_read"/><action id="547405.swf" name="sit_talk"/><action id="547406.swf" name="standing"/><action id="547408.swf" name="talk"/><action id="547410.swf" name="walk"/></char>
						<char id="547421" name="Cubic Cat" published="1" facing="left" thumb="547422.swf" default="547422.swf"><tags>cubicpets</tags><action id="547422.swf" name="standing"/><action id="547423.swf" name="talking"/><action id="547424.swf" name="sleeping"/><action id="547425.swf" name="shy"/><action id="547426.swf" name="walking"/></char>
						<char id="547437" name="Bamboo" published="1" facing="left" thumb="547438.swf" default="547438.swf"><tags>watervalley</tags><action id="547438.swf" name="standing"/><action id="547439.swf" name="sit"/><action id="547440.swf" name="sit_talk"/><action id="547442.swf" name="walk"/><action id="554124.swf" name="talk"/></char>
						<char id="561462" name="Monkey Character by Sogeking" published="1" facing="left" thumb="561463.swf" default="561463.swf"><tags>sogeking</tags><action id="561463.swf" name="Stand"/><action id="561508.swf" name="angry"/><action id="561570.swf" name="bored"/><action id="561574.swf" name="confused"/><action id="561647.swf" name="dance"/><action id="561735.swf" name="desperate"/><action id="561850.swf" name="die"/><action id="561899.swf" name="drop_prop"/><action id="561940.swf" name="talk"/><action id="563982.swf" name="scared"/><action id="563994.swf" name="shy"/><action id="564013.swf" name="fart"/><action id="564023.swf" name="furious"/><action id="564048.swf" name="happy"/><action id="564069.swf" name="walk"/></char>
						<char id="564521" name="disco monkey by Sogeking" published="1" facing="left" thumb="564522.swf" default="564522.swf"><tags>sogeking</tags><action id="564522.swf" name="talk_disco"/><action id="564543.swf" name="stand_disco"/></char>
						<char id="564526" name="Monkey girl by Sogeking" published="1" facing="left" thumb="564527.swf" default="564527.swf"><tags>stand_girl</tags><action id="564527.swf" name="stand_girl"/><action id="564528.swf" name="shy_girl"/></char>
						<char id="585035" name="Ham Polo by PaulToon" published="1" facing="left" thumb="585036.swf" default="585036.swf"><tags>paultoon,star wars,han solo</tags><action id="585036.swf" name="Han solo default"/><action id="585037.swf" name="Han Solo talk"/><action id="640941.swf" name="Han Solo Draw Gun"/><action id="640943.swf" name="Han Solo Shoot Gun"/></char>
						<char id="585038" name="Munchy by PaulToon" published="1" facing="left" thumb="585039.swf" default="585039.swf"><tags>chewbacca,chewy,paultoon,star wars</tags><action id="585039.swf" name="Chewy default"/><action id="585041.swf" name="Chewy roar"/><action id="646385.swf" name="Munchy Draw Gun"/><action id="646386.swf" name="Muncy Stand with Gun"/><action id="646387.swf" name="Munchy Shoot Gun"/></char>
						<char id="591484" name="Monkey teacher_by Sogeking" published="1" facing="left" thumb="591486.swf" default="591486.swf"><tags>monkey,sogeking,teacher</tags><action id="591485.swf" name="talk"/><action id="591486.swf" name="stand"/><action id="591496.swf" name="talk2"/></char>
						<char id="652890" name="Roundie" published="1" facing="left" thumb="652891.swf" default="652891.swf"><tags>standing</tags><action id="652891.swf" name="standing"/><action id="652892.swf" name="walk"/></char>
						<char id="774742" name="Isogirl" published="1" facing="left" thumb="1082219.swf" default="1082219.swf"><tags>isometrix</tags><action id="1082202.swf" name="Front - Sitting"/><action id="1082208.swf" name="Back - Sitting"/><action id="1082210.swf" name="Back - Still"/><action id="1082212.swf" name="Back - Walk"/><action id="1082214.swf" name="Back - Pointing"/><action id="1082216.swf" name="Front - Point"/><action id="1082219.swf" name="Front - Still"/><action id="1082220.swf" name="Front - Talk"/><action id="1082221.swf" name="Front - Walk"/><action id="1129808.swf" name="Side - Still"/><action id="1129897.swf" name="Side - Fall"/><action id="1129898.swf" name="Side - Get Hit"/><action id="1129899.swf" name="Side - Hit"/><action id="1129901.swf" name="Side - Point"/><action id="1129904.swf" name="Side - Sitting"/><action id="1129905.swf" name="Side - Talk"/><action id="1129906.swf" name="Side - Walk"/></char>
						<char id="851906" name="StickFighter" published="1" facing="left" thumb="851978.swf" default="851978.swf"><tags>coady,stickfighter,tnp</tags><action id="851978.swf" name="Ready to fight"/><action id="851982.swf" name="taunt"/><action id="851998.swf" name="frontflip"/><action id="852025.swf" name="headjab"/><action id="852029.swf" name="Jab"/><action id="856681.swf" name="hands up"/><action id="887226.swf" name="headjab1"/><action id="933389.swf" name="headKick"/><action id="933390.swf" name="gutkick"/><action id="938816.swf" name="footsweep"/><action id="939706.swf" name="Judo Chop"/><action id="939710.swf" name="headhook"/><action id="939711.swf" name="Jumpkick"/><action id="939838.swf" name="get hit head"/><action id="940047.swf" name="knockout head front"/><action id="940058.swf" name="all fours exhausted"/><action id="946274.swf" name="get hit gut"/><action id="1003951.swf" name="head multiple punches"/><action id="1004033.swf" name="kickbacktohead"/><action id="1004236.swf" name="superman"/><action id="1006340.swf" name="WalkFightReady2"/><action id="1017851.swf" name="footsweep, get hit"/><action id="1046931.swf" name="Double AxHandle"/><action id="1046933.swf" name="jump"/></char>
						<char id="875334" name="Batty" published="1" facing="left" thumb="876057.swf" default="876057.swf"><tags>b&amp;aring;t,bat,b&#xE5;t,coady</tags><action id="875417.swf" name="Flying"/><action id="876057.swf" name="hanging still"/><action id="876179.swf" name="Batty Sleeping"/><action id="876227.swf" name="hanging talking"/></char>
						<char id="907852" name="Match Cool" published="1" facing="left" thumb="907853.swf" default="907853.swf"><tags>match</tags><action id="907853.swf" name="stand"/><action id="907856.swf" name="walk"/><action id="907857.swf" name="attack"/><action id="919952.swf" name="look at watch"/><action id="919970.swf" name="attack 2"/><action id="920009.swf" name="talk"/></char>
						<char id="998655" name="Gipsy" published="1" facing="left" thumb="1773356.swf" default="1773356.swf"><tags>gipsy,tnp</tags><action id="1773327.swf" name="Enojado"/><action id="1773342.swf" name="reirse"/><action id="1773345.swf" name="babear"/><action id="1773349.swf" name="soporte desde atr&#xE1;s"/><action id="1773351.swf" name="Jadeante"/><action id="1773356.swf" name="posici&#xF3;n"/><action id="1773360.swf" name="sacudi&#xF3;"/><action id="1773376.swf" name="sorprendido"/><action id="1773377.swf" name="hablar"/><action id="1773381.swf" name="Paseo"/><action id="111390364.swf" name="uppercut"/></char>
						<char id="1074104" name="IsoBoy" published="1" facing="left" thumb="1074105.swf" default="1074105.swf"><tags>isometrix</tags><action id="1074105.swf" name="Front - Still"/><action id="1074106.swf" name="Front - Sitting"/><action id="1074109.swf" name="Front - Point"/><action id="1074110.swf" name="Front - Talk"/><action id="1074111.swf" name="Front - Walk"/><action id="1074120.swf" name="Side - Walk"/><action id="1074123.swf" name="Side - Sitting"/><action id="1074125.swf" name="Side - Point"/><action id="1074127.swf" name="Side - Fall"/><action id="1074129.swf" name="Side - Get Hit"/><action id="1074130.swf" name="Side - Hit"/><action id="1074133.swf" name="Back - Still"/><action id="1074135.swf" name="Back - Sitting"/><action id="1074137.swf" name="Back - Pointing"/><action id="1074138.swf" name="Back - Walk"/><action id="1074159.swf" name="Side - Still"/><action id="1097152.swf" name="Side - Talk"/><action id="1645340.swf" name="Front - Guitar"/></char>
						<char id="1079680" name="Gert" published="1" facing="left" thumb="1086927.swf" default="1086927.swf"><tags>dinosaur,tnp</tags><action id="1086927.swf" name="Standing"/><action id="1086929.swf" name="Chewing"/><action id="1108631.swf" name="Talking"/><action id="1108663.swf" name="bend"/><action id="1111485.swf" name="run"/><action id="1223744.swf" name="Sad"/><action id="1229891.swf" name="Sad singing"/></char>
						<char id="1082129" name="IsoSanta" published="1" facing="left" thumb="1082130.swf" default="1082130.swf"><tags>isometrix</tags><action id="1082130.swf" name="Front - Still"/><action id="1082133.swf" name="Front - Talk"/><action id="1082134.swf" name="Front - Point"/><action id="1082135.swf" name="Front - Sitting"/><action id="1085331.swf" name="Back - Still"/><action id="1085340.swf" name="Back - Pointing"/><action id="1085341.swf" name="Back - Sitting"/><action id="1085342.swf" name="Back - Walk"/><action id="1085615.swf" name="Side - Fall"/><action id="1085616.swf" name="Side - GetHit"/><action id="1085618.swf" name="Side - Hit"/><action id="1085620.swf" name="Side - Point"/><action id="1085621.swf" name="Side - Sitting"/><action id="1085624.swf" name="Side - Still"/><action id="1085629.swf" name="Side - Walk"/><action id="1097159.swf" name="Side - Talk"/></char>
						<char id="1085646" name="IsoSanta" published="1" facing="left" thumb="1085647.swf" default="1085647.swf"><tags>isometrix</tags><action id="1085647.swf" name="Front - Still"/><action id="1085649.swf" name="Back - Pointing"/><action id="1085650.swf" name="Back - Sitting"/><action id="1085653.swf" name="Back - Still"/><action id="1085655.swf" name="Back - Walk"/><action id="1085657.swf" name="Front - Point"/><action id="1085658.swf" name="Front - Sitting"/><action id="1085659.swf" name="Front - Talk"/><action id="1085661.swf" name="Front - Walk"/><action id="1085662.swf" name="Side - Fall"/><action id="1085663.swf" name="Side - GetHit"/><action id="1085665.swf" name="Side - Hit"/><action id="1085667.swf" name="Side - Point"/><action id="1085669.swf" name="Side - Sitting"/><action id="1085670.swf" name="Side - Still"/><action id="1085672.swf" name="Side - Walk"/><action id="1097160.swf" name="Side - Talk"/></char>
						<char id="1129714" name="IsoBare" published="1" facing="left" thumb="1129716.swf" default="1129716.swf"><tags>isometrix</tags><action id="1129716.swf" name="Front - Still"/><action id="1141022.swf" name="Front - Point"/><action id="1141024.swf" name="Front - Sitting"/><action id="1141025.swf" name="Front - Talk"/><action id="1141032.swf" name="Front - Walk"/><action id="1141144.swf" name="Back - Pointing"/><action id="1141145.swf" name="Back - Sitting"/><action id="1141146.swf" name="Back - Still"/><action id="1141147.swf" name="Back - Walk"/><action id="1141277.swf" name="Side - Hit"/><action id="1141282.swf" name="Side - Talk"/><action id="1141292.swf" name="Side - Get Hit"/><action id="1141301.swf" name="Side - Fall"/><action id="1141318.swf" name="Side - Point"/><action id="1141319.swf" name="Side - Sitting"/><action id="1141320.swf" name="Side - Still"/><action id="1141321.swf" name="Side - Walk"/></char>
						<char id="1146317" name="PURPLE CENTURION =SECTION31" published="1" facing="left" thumb="1146318.swf" default="1146318.swf"><tags>section31</tags><action id="1146318.swf" name="STANDING"/><action id="1146319.swf" name="WALK"/><action id="1146855.swf" name="DISRUPTOR POINT LEFT"/><action id="1146942.swf" name="WALK RIGHT"/><action id="1147038.swf" name="FIRE RIGHT"/></char>
						<char id="1147194" name="BLUE CENTURION=SECTION31" published="1" facing="left" thumb="1147195.swf" default="1147195.swf"><tags>section31</tags><action id="1147195.swf" name="STAND RIGHT"/><action id="1147200.swf" name="FIRE RIGHT"/><action id="1147201.swf" name="POINT DISRUPTOR"/></char>
						<char id="1148845" name="PICARD" published="1" facing="left" thumb="1151155.swf" default="1151155.swf"><tags>dematerialise</tags><action id="1148846.swf" name=" dematerialise"/><action id="1148867.swf" name="materialise"/><action id="1151103.swf" name="walk"/><action id="1151155.swf" name="stand"/><action id="1177214.swf" name="PICARD walk2"/><action id="1186425.swf" name="PICARD STANDblink"/><action id="1186691.swf" name=" STAND Talk"/><action id="1191156.swf" name=" walk left"/><action id="1191182.swf" name="STAND Talkleft"/><action id="1191241.swf" name=" STAND blink right"/><action id="1192213.swf" name="SHOCKED"/><action id="1199177.swf" name="CALCULATE"/><action id="1205275.swf" name="sit"/><action id="1205289.swf" name=" sit left"/><action id="1205301.swf" name="sit talk"/><action id="1205303.swf" name=" sit left talk"/><action id="1208145.swf" name="TURD SHOCKED"/><action id="1208198.swf" name=" TURD STAND Talkleft"/><action id="1208227.swf" name="TURD STAND left"/><action id="1211241.swf" name="SHOCKED LEFT"/><action id="1211879.swf" name="SNIFFUP"/><action id="1212111.swf" name="MAKE IT SO"/><action id="1251971.swf" name="PICARD TURBULANCE LEFT"/><action id="1252428.swf" name="TURBULANCE RIGHT"/><action id="1260543.swf" name="STANDblinkbreathe"/><action id="1260544.swf" name="blink left breathe"/><action id="1268137.swf" name="ferengi tubulance"/><action id="1280975.swf" name="mucus walk left"/><action id="1280994.swf" name="MUCUS amp STAND TALK"/><action id="1284638.swf" name="walk talk left"/><action id="1339002.swf" name="MUCUS AMPUTATED"/><action id="1946022.swf" name="make it so right"/></char>
						<char id="1154816" name="ROMULAN WARBIRD" published="1" facing="left" thumb="1154817.swf" default="1154817.swf"><tags>section31</tags><action id="1154817.swf" name="default"/><action id="1154820.swf" name="default"/><action id="1154919.swf" name=" fire disruptors"/><action id="1154924.swf" name="continuous fire"/><action id="1154936.swf" name="fire tirpedoes"/><action id="1154972.swf" name="decloak"/><action id="1156192.swf" name=" shield hit"/><action id="1156270.swf" name="shields up"/><action id="1156296.swf" name="shields and torpedos"/><action id="1156315.swf" name="torpedoesdisruptors"/><action id="1156318.swf" name="shields/torpedoes/disruptors"/><action id="1156331.swf" name="diruptors shields"/><action id="1156356.swf" name="LOWER SHIELDS"/><action id="1156428.swf" name="shields down"/><action id="1918427.swf" name="decloak melt"/><action id="1918470.swf" name="cloak melt"/></char>
						<char id="1164416" name="TARDIS by section31" published="1" facing="left" thumb="1819265.swf" default="1819265.swf"><tags>dr who</tags><action id="1819245.swf" name="door opening"/><action id="1819248.swf" name="door closing"/><action id="1819249.swf" name="door opened"/><action id="1819265.swf" name="tardis"/><action id="1819267.swf" name="tardisappear"/><action id="1819270.swf" name="tardisdissappear"/></char>
						<char id="1164668" name="DALEK by section31" published="1" facing="left" thumb="1164669.swf" default="1164669.swf"><tags>default</tags><action id="1164669.swf" name="default"/><action id="1202469.swf" name="movehead"/><action id="1202491.swf" name="exterminate"/><action id="1202516.swf" name="wide beam exterminate"/><action id="1202541.swf" name="blackdalekdefault"/><action id="1202542.swf" name="blackdalekmovehead"/><action id="1202543.swf" name="blackdalekexterminate"/><action id="1731087.swf" name="reddalek1explode"/></char>
						<char id="1164896" name="enterprise by solarbaby" published="1" facing="left" thumb="1164903.swf" default="1164903.swf"><tags>section31</tags><action id="1164900.swf" name=" battledamaged"/><action id="1164903.swf" name="default1"/><action id="1164943.swf" name="shields2"/><action id="1893019.swf" name="enterprise redphasers"/><action id="1893020.swf" name="enterprise torpedos"/><action id="1893624.swf" name="enterprise explode"/><action id="2622755.swf" name="enterprise battledamagednofire"/><action id="2628022.swf" name="leaving warp"/><action id="2633455.swf" name="ENT TOP ZOOM"/><action id="2633476.swf" name="ENT TOP OBLIQUE"/><action id="3422424.swf" name="enterprise silhouette"/><action id="4943041.swf" name="enterprise default tholian web trapped"/><action id="4984750.swf" name="enterprise default tholian web warp"/><action id="5066009.swf" name="materialise"/><action id="5066013.swf" name="dematerialise"/><action id="5066164.swf" name="leaving warp2"/></char>
						<char id="1166428" name="REPLICATORCUP" published="1" facing="left" thumb="1166435.swf" default="1166435.swf"><tags>replicatorcuponly</tags><action id="1166435.swf" name="STILL"/><action id="1166439.swf" name="ONLY"/></char>
						<char id="1167870" name="IsoBoss" published="1" facing="left" thumb="1167888.swf" default="1167888.swf"><tags>isometrix</tags><action id="1167882.swf" name="Front - Point"/><action id="1167883.swf" name="Front - Sitting"/><action id="1167884.swf" name="Front - Talk"/><action id="1167887.swf" name="Front - Walk"/><action id="1167888.swf" name="Front - Still"/><action id="1168119.swf" name="Back - Still"/><action id="1168121.swf" name="Back - Pointing"/><action id="1168123.swf" name="Back - Sitting"/><action id="1168124.swf" name="Back - Walk"/><action id="1168125.swf" name="Side - Still"/><action id="1168236.swf" name="Side - Fall"/><action id="1168238.swf" name="Side - Get Hit"/><action id="1168239.swf" name="Side - Hit"/><action id="1168242.swf" name="Side - Point"/><action id="1168243.swf" name="Side - Sitting"/><action id="1168244.swf" name="Side - Talk"/><action id="1168245.swf" name="Side - Walk"/><action id="1190083.swf" name="Front - Read"/><action id="1572891.swf" name="Front - Guitar"/></char>
						<char id="1198772" name="Dragon by Chaostoon" published="1" facing="left" thumb="1198773.swf" default="1198773.swf"><tags>chaostoon dragon</tags><action id="1198773.swf" name="Standing"/><action id="1198775.swf" name="Throw Fire and Hover"/><action id="1198777.swf" name="Fly"/><action id="1198779.swf" name="Landing from Fly"/><action id="1198784.swf" name="Roar / Throw Fire"/><action id="1198785.swf" name="Roar Hold"/><action id="1198787.swf" name="Sad"/><action id="1198788.swf" name="Takeoff"/><action id="1198789.swf" name="Thinking"/><action id="1198790.swf" name="Upset"/><action id="1198793.swf" name="Walk"/><action id="1198801.swf" name="Throw Fire Flying"/></char>
						<char id="1205495" name="HOLODECK DOORS" published="1" facing="left" thumb="1205503.swf" default="1205503.swf"><tags>section31</tags><action id="1205503.swf" name=" CLOSED"/><action id="1205504.swf" name=" OPEN"/><action id="1210934.swf" name="OPENING"/><action id="1210946.swf" name="CLOSING"/></char>
						<char id="1235597" name="IsoCar" published="1" facing="left" thumb="1235598.swf" default="1235598.swf"><tags>isometrix</tags><action id="1235598.swf" name="Side - Occupied"/><action id="1235599.swf" name="Side - Empty"/></char>
						<char id="1271668" name="LEON" published="1" facing="left" thumb="1271669.swf" default="1271669.swf"><action id="1271669.swf" name="leonrun"/></char>
						<char id="1271772" name="BATOMBILE by section31" published="1" facing="left" thumb="1271787.swf" default="1271787.swf"><tags>batman</tags><action id="1271773.swf" name="DRIVE HEADLIGHTS"/><action id="1271776.swf" name="parked"/><action id="1271778.swf" name="lights on"/><action id="1271779.swf" name="lights off"/><action id="1271787.swf" name="default"/></char>
						<char id="1306082" name="CATWOMAN" published="1" facing="left" thumb="1306181.swf" default="1306181.swf"><tags>stand</tags><action id="1306135.swf" name="scheming"/><action id="1306164.swf" name="walk"/><action id="1306181.swf" name="stand"/><action id="1307395.swf" name="kiss"/><action id="1985062.swf" name="threaten"/><action id="1985067.swf" name=" murdered"/><action id="1985105.swf" name="talk"/><action id="1985156.swf" name=" think"/><action id="1985823.swf" name="on bike"/></char>
						<char id="1324346" name="FA Artist" published="1" facing="left" thumb="1324355.swf" default="1324355.swf"><tags>chaostoon</tags><action id="1324347.swf" name="artist gets easel back CS4"/><action id="1324354.swf" name="Artist yelling hey CS4"/><action id="1324355.swf" name="i need help moving hold CS4"/><action id="1324358.swf" name="woah doctor bills CS4"/><action id="1324479.swf" name="artist whats FA CS4"/><action id="1324480.swf" name="Artist painting CS4"/><action id="1324569.swf" name="i need help CS4"/><action id="199399952.swf" name="Jack New Crying"/><action id="199400095.swf" name="Jack New Good Job"/><action id="200378157.swf" name="Queen angry"/></char>
						<char id="1359681" name="picg" published="1" facing="left" thumb="1359682.swf" default="1359682.swf"><tags>43_pig</tags><action id="1359682.swf" name="43_pig"/></char>
						<char id="1400048" name="Klingon aft by solarbaby" published="1" facing="left" thumb="1400049.swf" default="1400049.swf"><tags>default</tags><action id="1400049.swf" name="DEFAULT"/><action id="1400050.swf" name="TORPEDOS"/><action id="1400051.swf" name="PHASERS"/><action id="1892933.swf" name="KTINGA cloak"/><action id="1892934.swf" name="KTINGA decloak"/></char>
						<char id="1458029" name="Batman" published="1" facing="left" thumb="1458030.swf" default="1458030.swf"><action id="1458030.swf" name="stand"/><action id="1481257.swf" name="throw"/><action id="1481258.swf" name="glide"/><action id="1514978.swf" name="talk"/></char>
						<char id="1488083" name="Robin" published="1" facing="left" thumb="1488084.swf" default="1488084.swf"><action id="1488084.swf" name="stand"/><action id="1488086.swf" name="talk"/></char>
						<char id="1492653" name="Poison Ivy" published="1" facing="left" thumb="1492654.swf" default="1492654.swf"><action id="1492654.swf" name="stand"/><action id="1492660.swf" name="talk_angry"/></char>
						<char id="1495712" name="Mr Freeze" published="1" facing="left" thumb="1495714.swf" default="1495714.swf"><action  id="1495714.swf" name="talk"/><action  id="1495731.swf" name="scheming"/></char>
						<char id="1495740" name="The Joker" published="1" facing="left" thumb="1495741.swf" default="1495741.swf"><action  id="1495741.swf" name="talk"/><action  id="1495744.swf" name="scheming"/></char>
						<char id="1498163" name="Kung Fu Cat by cool34606" published="1" facing="left" thumb="1498164.swf" default="1498164.swf"><tags>cool34606,kung fu cat,tet,cool34606kfc</tags><action id="1498164.swf" name="Kung Fu Cat Stand Front"/><action id="1498381.swf" name="KFC Double Kick Front"/><action id="1498715.swf" name="KFC Fighting Stance"/><action id="1498981.swf" name="KFC Fighting Stance Walk"/><action id="1508763.swf" name="KFC Fighting Stance Punch"/><action id="1508930.swf" name="KFC Fighting Stance kick"/><action id="1509040.swf" name="KFC Fighting Stance energyblast"/><action id="1509249.swf" name="KFC Fighting Stance Talk"/><action id="1509260.swf" name="KFC Sitting"/><action id="1509485.swf" name="KFC Talk"/><action id="1510725.swf" name="KFC Stand Side"/><action id="1515229.swf" name="KFC Walk"/><action id="1588452.swf" name="KFC Fighting Stance Scratch"/><action id="1588455.swf" name="KFC Get knocked Out"/><action id="1588461.swf" name="KFC Knocked Out"/><action id="1764037.swf" name="KFC Get Hit"/></char>
						<char id="1570804" name="Superman" published="1" facing="left" thumb="1570805.swf" default="1570806.swf"><action  id="1570806.swf" name="talk"/></char>
						<char id="1572752" name="Bruce Wayne" published="1" facing="left" thumb="1572754.swf" default="1572754.swf"><action  id="1572754.swf" name="talk"/><action  id="1572756.swf" name="lookup"/></char>
						<char id="1600316" name="Batgirl" published="1" facing="left" thumb="1600319.swf" default="1600319.swf"><action  id="1600319.swf" name="talk"/></char>
						<char id="1634460" name="bird of prey front by solarbaby" published="1" facing="left" thumb="1634490.swf" default="1634490.swf"><tags>bird of prey front section31</tags><action id="1634464.swf" name="bird of prey front cloak"/><action id="1634466.swf" name="bird of prey front decloak"/><action id="1634474.swf" name="bird of prey front shields"/><action id="1634488.swf" name="bird of prey front torpedo"/><action id="1634490.swf" name="bird of prey front disruptors"/><action id="2635563.swf" name="bird of prey front default"/></char>
						<char id="1636962" name="HUMPTY DUMPTY" published="1" facing="left" thumb="1636963.swf" default="1636963.swf"><tags>humpty</tags><action id="1636963.swf" name="humpty"/><action id="1637066.swf" name="humptyNAUGHTY"/></char>
						<char id="1645452" name="IsoInvasion" published="1" facing="left" thumb="1645453.swf" default="1645453.swf"><tags>isometrix</tags><action id="1645453.swf" name="Front - Still"/><action id="1645455.swf" name="Back - Still"/></char>
						<char id="1667228" name="JEAP" published="1" facing="left" thumb="1667586.swf" default="1667586.swf"><tags>jeap by section31</tags><action id="1667230.swf" name="jeapdrive"/><action id="1667586.swf" name="jeap door close"/><action id="1667588.swf" name="jeap door open"/><action id="1667591.swf" name="jeap"/><action id="1667597.swf" name="jeap door opened"/><action id="1667819.swf" name="jeapsidedrive"/><action id="1688181.swf" name="jeapsidestill"/></char>
						<char id="1680552" name="Hoot" published="1" facing="left" thumb="1680553.swf" default="1680553.swf"><tags>hoot,owl,tethoot</tags><action id="1680553.swf" name="Standing"/><action id="1680794.swf" name="Sleeping"/><action id="1680909.swf" name="Talking"/><action id="1696921.swf" name="Look to side"/><action id="1764153.swf" name="Excited flap wings"/><action id="1764210.swf" name="Stand side"/><action id="1764293.swf" name="walk"/><action id="1764375.swf" name="Jump"/><action id="3786391.swf" name="Backview talking"/><action id="132008268.swf" name="walk and talk"/><action id="132785152.swf" name="Talk side"/></char>
						<char id="1687173" name="BLUE DALEK" published="1" facing="left" thumb="1687174.swf" default="1687174.swf"><tags>default</tags><action id="1687174.swf" name="DEFAULT"/><action id="1687180.swf" name="exterminate "/><action id="1687184.swf" name="movehead "/><action id="1687214.swf" name="exterminate"/><action id="1731152.swf" name="bluedalek1explode"/></char>
						<char id="1757567" name="DEEPSPACENINE by solarbaby" published="1" facing="left" thumb="1757568.swf" default="1757568.swf"><tags>default</tags><action id="1757568.swf" name="DEFAULT"/><action id="1757573.swf" name="firephaser"/></char>
						<char id="1780115" name="IsoFrance" published="1" facing="left" thumb="1780116.swf" default="1780116.swf"><tags>isometrix</tags><action id="1780116.swf" name="Front - Still"/><action id="1780415.swf" name="Front - Sitting"/><action id="1780418.swf" name="Front - Talk"/><action id="1780424.swf" name="Front - Walk"/><action id="1783863.swf" name="Side - Still"/><action id="1783864.swf" name="Side - Talk"/><action id="1783865.swf" name="Side - Walk"/><action id="1783866.swf" name="Side - Sitting"/><action id="1783867.swf" name="Back - Still"/><action id="1783869.swf" name="Back - Sitting"/><action id="1783870.swf" name="Back - Walk"/><action id="1798149.swf" name="Side - Kick"/></char>
						<char id="1814132" name="Demon Biker by Charles Zippel" published="1" facing="left" thumb="1814133.swf" default="1814133.swf"><tags>biker,cz,czdemonbiker,demon,tet,tetdemonbiker</tags><action id="1814133.swf" name="Stand"/><action id="1814135.swf" name="Stand Talk"/><action id="1814136.swf" name="Walk"/><action id="1814137.swf" name="Fighting Stance"/><action id="1814140.swf" name="Energy Blast Position"/><action id="1814141.swf" name="Point Arm"/><action id="1814144.swf" name="Punch"/><action id="1814146.swf" name="Sit"/><action id="1814149.swf" name="Motorbike Only"/><action id="1814150.swf" name="Ride Motorbike Slow"/><action id="1814161.swf" name="Ride Motorbike Fast"/><action id="1814222.swf" name="Get Hit"/><action id="1814225.swf" name="Get Knocked Out"/><action id="1814226.swf" name="Knocked Out"/><action id="1835556.swf" name="Double Punch"/><action id="1839298.swf" name="Ride Motorbike stopped"/></char>
						<char id="1819715" name="Spinning Tardis by section31" published="1" facing="left" thumb="1819747.swf" default="1819747.swf"><tags>tardis  spinround</tags><action id="1819721.swf" name="phase out"/><action id="1819724.swf" name="phasein"/><action id="1819747.swf" name="spinround"/></char>
						<char id="1829278" name="Harley Quinn" published="1" facing="left" thumb="1829279.swf" default="1829279.swf"><action  id="1829279.swf" name="stand"/><action  id="1829293.swf" name="talk"/></char>
						<char id="1839603" name="IsoArgentina" published="1" facing="left" thumb="1839604.swf" default="1839604.swf"><tags>isometrix</tags><action id="1839604.swf" name="Front - Still"/><action id="1839612.swf" name="Front- Sitting"/><action id="1839613.swf" name="Front - Talk"/><action id="1839616.swf" name="Front - Walk"/><action id="1839631.swf" name="Back - Still"/><action id="1839632.swf" name="Back - Sitting"/><action id="1839633.swf" name="Back - Walk"/><action id="1839645.swf" name="Side - Walk"/><action id="1839646.swf" name="Side - Kick"/><action id="1839647.swf" name="Side - Sitting"/><action id="1839648.swf" name="Side - Still"/><action id="1839649.swf" name="Side - Talk"/></char><char id="1780115" enc_asset_id="0N-MhMzJLPOI" name="IsoFrance" published="1" facing="left" thumb="1780116.swf" default="1780116.swf"><tags>isometrix</tags><action id="1780116.swf" name="Front - Still"/><action id="1780415.swf" name="Front - Sitting"/><action id="1780418.swf" name="Front - Talk"/><action id="1780424.swf" name="Front - Walk"/><action id="1783863.swf" name="Side - Still"/><action id="1783864.swf" name="Side - Talk"/><action id="1783865.swf" name="Side - Walk"/><action id="1783866.swf" name="Side - Sitting"/><action id="1783867.swf" name="Back - Still"/><action id="1783869.swf" name="Back - Sitting"/><action id="1783870.swf" name="Back - Walk"/><action id="1798149.swf" name="Side - Kick"/></char>
						<char id="1856666" name="lampost" published="1" facing="left" thumb="1856667.swf" default="1856667.swf"><tags>default</tags><action id="1856667.swf" name="default"/><action id="1856670.swf" name="on"/><action id="1856678.swf" name="shine on"/><action id="1856680.swf" name="shine off"/><action id="1856697.swf" name="flicker"/><action id="1856718.swf" name="shine"/></char>
						<char id="1867628" name="MUTANTDALEK by solarbaby" published="1" facing="left" thumb="1867629.swf" default="1867629.swf"><tags>mutant dalekdead</tags><action id="1867629.swf" name="mutant dalekdead"/><action id="1867631.swf" name="MOVING"/></char>
						<char id="1885278" name="Police Car" published="1" facing="left" thumb="1885279.swf" default="1885279.swf"><tags>car,police,p&#xF3;lice,tet,tetpolicecar</tags><action id="1885279.swf" name="Parked"/><action id="1885281.swf" name="Cruising"/><action id="1885286.swf" name="Pursuit"/><action id="1885287.swf" name="Credit"/></char> 
						<char id="1892366" name="i-Iso" published="1" facing="left" thumb="1892367.swf" default="1892367.swf"><tags>isometrix</tags><action id="1892367.swf" name="Front - Still"/><action id="1892384.swf" name="Front - Talk"/><action id="1892387.swf" name="Front - Walk"/><action id="1892393.swf" name="Front - Sitting"/><action id="1892437.swf" name="Front - Point"/></char><char id="1839603" enc_asset_id="0O9UlYD68URI" name="IsoArgentina" published="1" facing="left" thumb="1839604.swf" default="1839604.swf"><tags>isometrix</tags><action id="1839604.swf" name="Front - Still"/><action id="1839612.swf" name="Front- Sitting"/><action id="1839613.swf" name="Front - Talk"/><action id="1839616.swf" name="Front - Walk"/><action id="1839631.swf" name="Back - Still"/><action id="1839632.swf" name="Back - Sitting"/><action id="1839633.swf" name="Back - Walk"/><action id="1839645.swf" name="Side - Walk"/><action id="1839646.swf" name="Side - Kick"/><action id="1839647.swf" name="Side - Sitting"/><action id="1839648.swf" name="Side - Still"/><action id="1839649.swf" name="Side - Talk"/></char>
						<char id="1892845" name="Riddler" published="1" facing="left" thumb="1892848.swf" default="1892848.swf"><action  id="1892848.swf" name="talk"/></char>
						<char id="1894754" name="shuttlebay by solarbaby" published="1" facing="left" thumb="1894755.swf" default="1894755.swf"><tags>shuttlebay</tags><action id="1894755.swf" name="closed"/><action id="1894770.swf" name="opening"/><action id="1894772.swf" name="closing"/><action id="1894828.swf" name="opened"/><action id="57503006.swf" name="shuttle in hangar"/><action id="57504422.swf" name="shuttle hangar retract"/><action id="80107000.swf" name="shuttlebay rear"/></char>
						<char id="1905326" name="EXCELSIOR BELOW" published="1" facing="left" thumb="1905327.swf" default="1905327.swf"><tags>excelsior dorsla default</tags><action id="1905327.swf" name="excelsior dorsla default"/><action id="1905328.swf" name=" torpedos"/></char>
						<char id="1925052" name="KTINGA FRONT by solarbaby" published="1" facing="left" thumb="1925053.swf" default="1925053.swf"><tags>default</tags><action id="1925053.swf" name=" DEFAULT"/><action id="1925057.swf" name="DE CLOAK"/><action id="1925066.swf" name="KTINGA CLOAK"/><action id="1925121.swf" name="KTINGA FRONT TORPEDOLIGHT"/><action id="4323301.swf" name=" SPIN WARP OUT"/></char>
						<char id="1955670" name="Wolfman" published="1" facing="left" thumb="1955672.swf" default="1955672.swf"><tags>wolfman</tags><action id="1955671.swf" name="wolf crouch 1"/><action id="1955672.swf" name="wolf standy"/><action id="1955673.swf" name="wolf standy silhouette"/><action id="1955674.swf" name="wolf 1 squash and overlap"/><action id="1955675.swf" name="wolf back 1"/><action id="1955677.swf" name="wolf back 2"/><action id="1955679.swf" name="wolf back 3"/><action id="1955680.swf" name="wolf back 4"/><action id="1955684.swf" name="wolf eye squinty"/><action id="1955687.swf" name="wolf runcycle"/><action id="1955695.swf" name="wolf runcycle silhouette"/><action id="1955700.swf" name="wolf slow jaw open"/></char>
						<char id="1969493" name="CATHERINE WHEELS" published="1" facing="left" thumb="1969534.swf" default="1969534.swf"><tags>default</tags><action id="1969495.swf" name="move"/><action id="1969520.swf" name="spinaround"/><action id="1969534.swf" name="default"/><action id="1969570.swf" name=" fire energy blast"/><action id="1969571.swf" name=" fire energy blast still"/><action id="1969612.swf" name=" car park"/><action id="1969615.swf" name=" transmogrify"/></char>
						<char id="1973023" name="MILLENIUM FALCON " published="1" facing="left" thumb="1973024.swf" default="1973024.swf"><tags>default</tags><action id="1973024.swf" name="DEFAULT"/><action id="1973027.swf" name=" LASERZ"/></char>
						<char id="1978343" name="Filliblustes Scorpion gunship" published="1" facing="left" thumb="1978344.swf" default="1978344.swf"><tags>default</tags><action id="1978344.swf" name="default"/><action id="1979163.swf" name=" flying"/><action id="1984354.swf" name="missiles"/></char>
						<char id="2179798" name="Chaostoons Wolfman" published="1" facing="left" thumb="2179814.swf" default="2179814.swf"><tags>chaostoon wolfman</tags><action id="2179800.swf" name="Wolf Step Forward"/><action id="2179802.swf" name="Wolf Back Breathing"/><action id="2179803.swf" name="Wolf Look Over Shoulder"/><action id="2179804.swf" name="Wolf Scary Look"/><action id="2179806.swf" name="Wolf Howl All Fours"/><action id="2179808.swf" name="Wolf Howl All Fours Night"/><action id="2179809.swf" name="Wolf Eye Squint"/><action id="2179810.swf" name="Wolf Running"/><action id="2179812.swf" name="Wolf Running Night"/><action id="2179813.swf" name="Wolf Dramatic Jaw Open"/><action id="2179814.swf" name="Wolf Standing"/><action id="2179815.swf" name="Wolf Howl Standing"/><action id="2179820.swf" name="Wolf Howl Standing Night"/><action id="2179826.swf" name="Wolf Walking"/></char>
						<char id="2634795" name="ENT TOP OBLIQUE by solarbaby" published="1" facing="left" thumb="2634796.swf" default="2634796.swf"><tags>default</tags><action id="2634796.swf" name="DEFAULT"/><action id="2634802.swf" name="sheilds up"/><action id="2634814.swf" name="sheilds down"/><action id="2634826.swf" name="sheild on"/><action id="2634902.swf" name=" continuous  torpedo"/><action id="2634931.swf" name="fire 1 torpedo"/><action id="4714269.swf" name="sheild on fire side phasers"/><action id="23699210.swf" name=" ZOOM"/><action id="24755852.swf" name=" shield on fire side phasers"/><action id="58555786.swf" name="escape pods"/></char>
						<char id="2665444" name="ROM BOP by solarbaby" published="1" facing="left" thumb="2665445.swf" default="2665445.swf"><tags>default</tags><action id="2665445.swf" name=" DEFAULT"/><action id="2665458.swf" name=" decloak"/><action id="2665466.swf" name="cloak"/><action id="2672400.swf" name="TORPEDOS"/><action id="5096801.swf" name="ROM BOP EXPLODE"/></char>
						<char id="2953867" name="bop front by solarbaby" published="1" facing="left" thumb="2953868.swf" default="2953868.swf"><tags>default</tags><action id="2953868.swf" name="default"/><action id="5093729.swf" name=" front torpedos"/><action id="5097281.swf" name="bop front explode"/></char>
						<char id="2954524" name="BOP SIDE by solarbaby" published="1" facing="left" thumb="2954525.swf" default="2954525.swf"><tags>default</tags><action id="2954525.swf" name=" default"/><action id="5092273.swf" name="bop side torpedos"/><action id="5096192.swf" name="bop side explode"/></char>
						<char id="2959056" name="BOP AFT  by solarbaby" published="1" facing="left" thumb="2959057.swf" default="2959057.swf"><tags>default</tags><action id="2959057.swf" name=" default"/><action id="5073941.swf" name="bop AFT fire torpedos"/></char>
						<char id="3249729" name="ENTERPRISE FRONT" published="1" facing="left" thumb="3249730.swf" default="3249730.swf"><tags>default</tags><action id="3249730.swf" name="default"/></char>
						<char id="3473744" name="OBERTH by solarbaby" published="1" facing="left" thumb="3473745.swf" default="3473745.swf"><tags>default</tags><action id="3473745.swf" name="default"/><action id="3479049.swf" name=" fire weapons"/><action id="3479178.swf" name="OBERTH "/></char>
						<char id="4324159" name="KTINGA SIDE OBLIQUE by solarbaby" published="1" facing="left" thumb="4324160.swf" default="4324160.swf"><tags>default</tags><action id="4324160.swf" name="DEFAULT"/><action id="4324488.swf" name=" PHASE OUT"/><action id="16409892.swf" name="cloak"/><action id="16410249.swf" name="Decloak"/><action id="16412240.swf" name="torpedoes"/></char>
						<char id="4645322" name="ENTERPRISE AFT by solarbaby" published="1" facing="left" thumb="4645323.swf" default="4645323.swf"><tags>enterprise aft default</tags><action id="4645323.swf" name="enterprise aft default"/><action id="4645345.swf" name="enterprise aft fire phasers"/><action id="4675082.swf" name="fire phasers torps"/><action id="4675084.swf" name="fire torps"/><action id="4753097.swf" name="shuttle leave"/><action id="4753110.swf" name="shuttle land"/><action id="4753942.swf" name="shuttle doors close"/><action id="5043080.swf" name="ent aft fire top phasers"/><action id="23597553.swf" name="ent aft going to warp"/><action id="24227886.swf" name="enterprise aft fire phasers torps sound"/><action id="50132269.swf" name="leaking warp plasma"/><action id="50132346.swf" name="damaged nacelle"/><action id="53863841.swf" name="enterprise aft shuttle decompress"/><action id="56563035.swf" name="shuttle approachandland"/><action id="79490714.swf" name="enterprise aft OMEGA FLASH"/></char>
						<char id="4754587" name="GALILEO AFT by solarbaby" published="1" facing="left" thumb="4754588.swf" default="4754588.swf"><tags>aft default</tags><action id="4754588.swf" name=" AFT DEFAULT"/><action id="4754658.swf" name="WARP OUT"/><action id="4795386.swf" name="burn up"/><action id="4878559.swf" name="crashedaft"/></char>
						<char id="6883884" name="DEFIANTTEST" published="1" facing="left" thumb="6883885.swf" default="6883885.swf"><tags>default</tags><action id="6883885.swf" name="DEFAULT"/><action id="6883900.swf" name="PHASERS"/></char>
						<char id="8567641" name="Karl" published="1" facing="left" thumb="8567642.swf" default="8567642.swf"><tags>standing</tags><action id="8567642.swf" name="Standing"/></char>
						<char id="8981490" name="Horse Gallop" published="1" facing="left" thumb="8981491.swf" default="8981491.swf"><tags>sweetgallop</tags><action id="8981491.swf" name="Horse Test"/></char>
						<char id="9680294" name="tardis controls by solarbaby" published="1" facing="left" thumb="9680295.swf" default="9680295.swf"><tags>tardis controls</tags><action id="9680295.swf" name="tardis controls"/><action id="9680329.swf" name="tardis controlsoff"/></char>
						<char id="9729292" name="USS REPUBLIC" published="1" facing="left" thumb="9729535.swf" default="9729535.swf"><tags>default</tags><action id="9729293.swf" name=" Default"/><action id="9729535.swf" name=" ventral"/><action id="9729890.swf" name=" aft PHASERS"/><action id="9732465.swf" name="aft torpedos"/></char>
						<char id="10592575" name="Goomba" published="1" facing="left" thumb="10592576.swf" default="10592576.swf"><tags>goomba,nicolas</tags><action id="10592576.swf" name="Stand"/><action id="10592621.swf" name="Walk"/><action id="10596740.swf" name="Walk - slower"/><action id="10596843.swf" name="Blink"/><action id="16295157.swf" name="Squashed"/><action id="16295252.swf" name="SquashedWalk"/><action id="16295297.swf" name="UnSquashed"/><action id="16295786.swf" name="SquashedToDeath"/><action id="16297426.swf" name="Talk"/></char>
						<char id="13828229" name="Chaostoons Sonic" published="1" facing="left" thumb="13828231.swf" default="13828231.swf"><tags>aprilfoolsday2011</tags><action id="13828231.swf" name="APRILFOOLSDAY2011"/></char>
						<char id="14187548" name="Hidden Sonic 2" published="1" facing="left" thumb="14187550.swf" default="14187550.swf"><tags>sonic joke2</tags><action id="14187550.swf" name="Sonic Joke2"/></char>
						<char id="15505243" name="Supergirl" published="1" facing="left" thumb="15505244.swf" default="15505244.swf"><action id="15505244.swf" name="stand"/><action id="15505295.swf" name="talk"/></char>
						<char id="15536357" name="Superboy" published="1" facing="left" thumb="15537454.swf" default="15537454.swf"><action id="15537454.swf" name="talk"/></char>
						<char id="16378923" name="bop aft flat by solarbaby" published="1" facing="left" thumb="16378924.swf" default="16378924.swf"><tags>defualt</tags><action id="16378924.swf" name="defualt"/><action id="16379173.swf" name="cloak"/><action id="16380462.swf" name="decloak"/></char>
						<char id="23281499" name="Larry the lobster-he&amp;#039;s not gay!" published="1" facing="left" thumb="23281708.swf" default="23281708.swf"><action id="23281708.swf" name="dance"/></char>
						<char id="33396776" name="mouth_001" published="1" facing="left" thumb="33396777.swf" default="33396777.swf"><action id="33396777.swf" name="stand"/></char>
						<char id="33396792" name="mouth_002" published="1" facing="left" thumb="33396793.swf" default="33396793.swf"><action id="33396793.swf" name="mouth_002"/></char>
						<char id="ios" name="ios" published="1" facing="left" thumb="ios.swf" default="ios.swf"><action id="ios.swf" name="stand"/></char>
						<char id="android" name="android" published="1" facing="left" thumb="android.swf" default="android.swf"><action id="android.swf" name="stand"/></char>
						<char id="elephant" name="elephant" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
						<char id="giraffe" name="giraffe" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
						<char id="hippo" name="hippo" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
						<char id="wildpig" name="wildpig" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
						<char id="zebra" name="zebra" published="1" facing="left" thumb="stand.swf" default="stand.swf"><action id="stand.swf" name="stand"/></char>
						<char id="48699994" name="PezSpock" published="1" facing="left" thumb="48699995.swf" default="48699995.swf"><tags>star trek</tags><action id="48699995.swf" name="Default"/></char>
						<char id="48700020" name="PezKirk" published="1" facing="left" thumb="48700021.swf" default="48700021.swf"><tags>star trek</tags><action id="48700021.swf" name="Default"/></char>
						<char id="48700045" name="PezNicolas" published="1" facing="left" thumb="48700046.swf" default="48700046.swf"><tags>nicolas,nicol&#xE1;s</tags><action id="48700046.swf" name="Default"/></char>
						<char id="66709814" name="Knuckles by Johnny Hotdog" published="1" facing="left" thumb="66709815.swf" default="66709815.swf"><tags>jhcharacters</tags><action id="66709815.swf" name="Knuckles"/><action id="66709876.swf" name="knuckles_ball"/><action id="66709921.swf" name="knuckles_ball_running"/><action id="66709932.swf" name="knuckles_run"/><action id="66709960.swf" name="knuckles_run2"/><action id="66709967.swf" name="knuckles_standby"/></char>
						<char id="66712491" name="Darth Vader by Johnny Hotdog" published="1" facing="left" thumb="66712492.swf" default="66712492.swf"><tags>jhcharacters</tags><action id="66712492.swf" name="Darth Vader"/><action id="66712510.swf" name="darthvader_back"/><action id="66712570.swf" name="darthvader_back_slash"/><action id="66712584.swf" name="darthvader_back_slash_2"/><action id="66712591.swf" name="darthvader_psy"/><action id="66712641.swf" name="darthvader_front_slash"/><action id="66712759.swf" name="darthvader_walk"/></char>
						<char id="66713375" name="Dr.Eggman by Johnny Hotdog" published="1" facing="left" thumb="66713376.swf" default="66713376.swf"><tags>jhcharacters</tags><action id="66713376.swf" name="eggman_facefront"/><action id="66713389.swf" name="eggman_faceright"/></char>
						<char id="72551015" name="golden gate bridge by solarbaby" published="1" facing="left" thumb="72551017.swf" default="72551017.swf"><tags>default</tags><action id="72551017.swf" name="default"/><action id="72552392.swf" name="blurry"/><action id="72552795.swf" name="night"/><action id="72554839.swf" name="moving traffic"/></char>
						<char id="80552677" name="artoo by solarbaby" published="1" facing="left" thumb="80552678.swf" default="80552678.swf"><tags>default</tags><action id="80552678.swf" name="DEFAULT"/><action id="80552854.swf" name="ANGRY"/><action id="80553107.swf" name="TILT BACKWARDS"/><action id="80554100.swf" name="HEAD SPIN"/><action id="80554349.swf" name="hologram"/><action id="80554599.swf" name="OIL SLICK"/><action id="80556335.swf" name="ELECTRIC SHOCK"/></char>
						<char id="87303429" enc_asset_id="0l10f2tqQDPA" name="Sonic by Chaostoon" published="1" facing="left" thumb="87305017.swf" default="87305017.swf"><tags>chaostoon</tags><action id="87303430.swf" name="Ball Rolling"/><action id="87303987.swf" name="Eat a Chilidog"/><action id="87304035.swf" name="Run 3"/><action id="87304062.swf" name="Homing"/><action id="87304085.swf" name="Homing Attack"/><action id="87304104.swf" name="Kick"/><action id="87304308.swf" name="Punch"/><action id="87304380.swf" name="Revv up Rolling Ball"/><action id="87304409.swf" name="Run 1"/><action id="87304503.swf" name="Stop"/><action id="87304548.swf" name="Spinball"/><action id="87304585.swf" name="Standing"/><action id="87304647.swf" name="Super Sonic flying"/><action id="87304677.swf" name="Angry"/><action id="87304739.swf" name="Happy"/><action id="87304775.swf" name="Laugh"/><action id="87304820.swf" name="Taunt"/><action id="87304851.swf" name="Thumbs Up"/><action id="87304920.swf" name="Super Sonic Transform"/><action id="87304942.swf" name="Super Sonic Transform Back"/><action id="87304960.swf" name="Turn into Spinball"/><action id="87305017.swf" name="Waiting"/><action id="87306283.swf" name="Run 2"/></char>`;
						tXml += "</theme>";
						fs.writeFileSync(path.join(sFolder, `theme.xml`), tXml);
						fUtil.addToZip(zap, "theme.xml", Buffer.from(tXml));
						console.log(tXml);
						fs.writeFileSync(path.join(commFolder, "movie.zip"), Buffer.from(await zap.zip()));
					}
					else {
						DB.update("assets", id, nontemplate);
						DB.update("comm", req.body.data.id, template);
					}
					res.json({ status: "ok" });
				} catch (e) {
					console.log("Error inserting asset:", e);
					console.log("It's not like anyone will see this anyway...");

					res.statusCode = 405;
					res.json({ status: "unsupported" });
				}
			}
			else {
				res.statusCode = 405;
				rej("The type: " + req.body.data.type + " can't be added to the community Library");
			}
		}
		else {
			try {
				if (info.isshared) {
					template.isshared = false;
					DB.delete("comm", id);
				}
				DB.update("assets", id, req.body.data);
				res.json({ status: "ok" });
			} catch (e) {
				console.log("Error updating asset:", e);
				console.log("It's not like anyone will see this anyway...");

				res.statusCode = 404;
				res.json({ status: "error" });
			}
		}
	})
	.route("POST", "/goapi/updateAsset/", async (req, res) => {
		const id = req.body.assetId;
		res.assert(id, 400, { status: "error" });
		const info = DB.get("assets", id).data;
		const template = {"type":info.type,"subtype":info.subtype,"title": req.body.title,"ptype":"placeable","id": req.body.assetId,"share":req.body.tags};
		const nontemplate = {"type":info.type,"subtype":info.subtype,"title": req.body.title,"ptype":"placeable","id": req.body.assetId,"tags":req.body.tags,"isshared":false};
		if (req.body.isPublished == "1")
		{
			if (info.type != "char" || info.type != "starter")
			{
			try {
				if (!info.isshared)
				{
					nontemplate.isshared = true;
					DB.insert("comm", template);
					const buff = Asset.load(id, true);
					DB.update("assets", id, nontemplate);
					fs.writeFileSync(path.join(commFolder, info.type, info.id), buff);
					const zap = nodezip.create();
						const meta = DB.select("comm", "prop");
						var tXml = `<theme id="Comm" name="Community Library">`;
						for (const v of meta) {
						tXml += Asset.meta2StareXml(v);
						}
						tXml += `<effect id="328995073.swf" name="bubbles" type="ANIME" resize="false" move="false" published="1"><tags></tags></effect><effect id="328993953.swf" name="bubbles" type="ANIME" resize="false" move="false" published="1"><tags></tags></effect><effect id="823760.swf" name="warpspeed" type="ANIME" resize="false" move="false" published="1"><tags></tags></effect><effect id="1211151.swf" name="arrowfx" type="ANIME" resize="false" move="false" published="1"><tags></tags></effect>`
						tXml += `<char id="1147194" name="BLUE CENTURION=SECTION31" published="1" facing="left" thumb="1147195.swf" default="1147195.swf"><tags/><action id="1147195.swf" name="STAND RIGHT"/><action id="1147200.swf" name="FIRE RIGHT"/><action id="1147201.swf" name="POINT DISRUPTOR"/></char>
						<char id="1867628" name="MUTANTDALEK by solarbaby" published="1" facing="left" thumb="1867629.swf" default="1867629.swf"><tags>mutant dalekdead</tags><action id="1867629.swf" name="mutant dalekdead"/><action id="1867631.swf" name="MOVING"/></char>
						<char id="1757567" name="DEEPSPACENINE by solarbaby" published="1" facing="left" thumb="1757568.swf" default="1757568.swf"><tags/><action id="1757568.swf" name="DEFAULT"/><action id="1757573.swf" name="firephaser"/></char>
						<char id="547437" name="Bamboo" published="1" facing="left" thumb="547438.swf" default="547438.swf"><tags/><action id="547438.swf" name="standing"/><action id="547439.swf" name="sit"/><action id="547440.swf" name="sit_talk"/><action id="547442.swf" name="walk"/><action id="554124.swf" name="talk"/></char>
						<char id="2179798" name="Chaostoons Wolfman" published="1" facing="left" thumb="2179814.swf" default="2179814.swf"><tags>chaostoon wolfman</tags><action id="2179800.swf" name="Wolf Step Forward"/><action id="2179802.swf" name="Wolf Back Breathing"/><action id="2179803.swf" name="Wolf Look Over Shoulder"/><action id="2179804.swf" name="Wolf Scary Look"/><action id="2179806.swf" name="Wolf Howl All Fours"/><action id="2179808.swf" name="Wolf Howl All Fours Night"/><action id="2179809.swf" name="Wolf Eye Squint"/><action id="2179810.swf" name="Wolf Running"/><action id="2179812.swf" name="Wolf Running Night"/><action id="2179813.swf" name="Wolf Dramatic Jaw Open"/><action id="2179814.swf" name="Wolf Standing"/><action id="2179815.swf" name="Wolf Howl Standing"/><action id="2179820.swf" name="Wolf Howl Standing Night"/><action id="2179826.swf" name="Wolf Walking"/></char>
						<char id="16378923" name="bop aft flat by solarbaby" published="1" facing="left" thumb="16378924.swf" default="16378924.swf"><tags>defualt</tags><action id="16378924.swf" name="defualt"/><action id="16379173.swf" name="cloak"/><action id="16380462.swf" name="decloak"/></char>
						<char id="1634460" name="bird of prey front by solarbaby" published="1" facing="left" thumb="1634490.swf" default="1634490.swf"><tags/><action id="1634464.swf" name="bird of prey front cloak"/><action id="1634466.swf" name="bird of prey front decloak"/><action id="1634474.swf" name="bird of prey front shields"/><action id="1634488.swf" name="bird of prey front torpedo"/><action id="1634490.swf" name="bird of prey front disruptors"/><action id="2635563.swf" name="bird of prey front default"/></char>
						<char id="2954524" name="BOP SIDE by solarbaby" published="1" facing="left" thumb="2954525.swf" default="2954525.swf"><tags/><action id="2954525.swf" name=" default"/><action id="5092273.swf" name="bop side torpedos"/><action id="5096192.swf" name="bop side explode"/></char>
						<char id="547400" name="Luna" published="1" facing="left" thumb="547406.swf" default="547406.swf"><tags/><action id="547401.swf" name="bow_greet"/><action id="547402.swf" name="sit"/><action id="547403.swf" name="sit_read"/><action id="547405.swf" name="sit_talk"/><action id="547406.swf" name="standing"/><action id="547408.swf" name="talk"/><action id="547410.swf" name="walk"/></char>
						<char id="87303429" name="Sonic by Chaostoon" published="1" facing="left" thumb="87305017.swf" default="87305017.swf"><tags/><action id="87303430.swf" name="Ball Rolling"/><action id="87303987.swf" name="Eat a Chilidog"/><action id="87304035.swf" name="Run 3"/><action id="87304062.swf" name="Homing"/><action id="87304085.swf" name="Homing Attack"/><action id="87304104.swf" name="Kick"/><action id="87304308.swf" name="Punch"/><action id="87304380.swf" name="Revv up Rolling Ball"/><action id="87304409.swf" name="Run 1"/><action id="87304503.swf" name="Stop"/><action id="87304548.swf" name="Spinball"/><action id="87304585.swf" name="Standing"/><action id="87304647.swf" name="Super Sonic flying"/><action id="87304677.swf" name="Angry"/><action id="87304739.swf" name="Happy"/><action id="87304775.swf" name="Laugh"/><action id="87304820.swf" name="Taunt"/><action id="87304851.swf" name="Thumbs Up"/><action id="87304920.swf" name="Super Sonic Transform"/><action id="87304942.swf" name="Super Sonic Transform Back"/><action id="87304960.swf" name="Turn into Spinball"/><action id="87305017.swf" name="Waiting"/><action id="87306283.swf" name="Run 2"/></char>
						<char id="2665444" name="ROM BOP by solarbaby" published="1" facing="left" thumb="2665445.swf" default="2665445.swf"><tags/><action id="2665445.swf" name=" DEFAULT"/><action id="2665458.swf" name=" decloak"/><action id="2665466.swf" name="cloak"/><action id="2672400.swf" name="TORPEDOS"/><action id="5096801.swf" name="ROM BOP EXPLODE"/></char>
						<char id="1498163" name="Kung Fu Cat by cool34606" published="1" facing="left" thumb="1498164.swf" default="1498164.swf"><tags>kung fu cat,cool34606kfc</tags><action id="1498164.swf" name="Kung Fu Cat Stand Front"/><action id="1498381.swf" name="KFC Double Kick Front"/><action id="1498715.swf" name="KFC Fighting Stance"/><action id="1498981.swf" name="KFC Fighting Stance Walk"/><action id="1508763.swf" name="KFC Fighting Stance Punch"/><action id="1508930.swf" name="KFC Fighting Stance kick"/><action id="1508986.swf" name="Kung Fu Cat credits"/><action id="1509040.swf" name="KFC Fighting Stance energyblast"/><action id="1509249.swf" name="KFC Fighting Stance Talk"/><action id="1509260.swf" name="KFC Sitting"/><action id="1509485.swf" name="KFC Talk"/><action id="1510725.swf" name="KFC Stand Side"/><action id="1515229.swf" name="KFC Walk"/><action id="1588452.swf" name="KFC Fighting Stance Scratch"/><action id="1588455.swf" name="KFC Get knocked Out"/><action id="1588461.swf" name="KFC Knocked Out"/><action id="1764037.swf" name="KFC Get Hit"/></char>
						<char id="66709814" name="Knuckles by Johnny Hotdog" published="1" facing="left" thumb="66709815.swf" default="66709815.swf"><tags>jhcharacters</tags><action id="66709815.swf" name="Knuckles"/><action id="66709876.swf" name="knuckles_ball"/><action id="66709921.swf" name="knuckles_ball_running"/><action id="66709932.swf" name="knuckles_run"/><action id="66709960.swf" name="knuckles_run2"/><action id="66709967.swf" name="knuckles_standby"/><action id="66712993.swf" name="knuckles_credits"/></char>
						<char id="80552677" name="artoo by solarbaby" published="1" facing="left" thumb="80552678.swf" default="80552678.swf"><tags/><action id="80552678.swf" name="DEFAULT"/><action id="80552854.swf" name="ANGRY"/><action id="80553107.swf" name="TILT BACKWARDS"/><action id="80554100.swf" name="HEAD SPIN"/><action id="80554349.swf" name="hologram"/><action id="80554599.swf" name="OIL SLICK"/><action id="80556335.swf" name="ELECTRIC SHOCK"/></char>
						<char id="2634795" name="ENT TOP OBLIQUE by solarbaby" published="1" facing="left" thumb="2634796.swf" default="2634796.swf"><tags/><action id="2634796.swf" name="DEFAULT"/><action id="2634802.swf" name="sheilds up"/><action id="2634814.swf" name="sheilds down"/><action id="2634826.swf" name="sheild on"/><action id="2634902.swf" name=" continuous  torpedo"/><action id="2634931.swf" name="fire 1 torpedo"/><action id="4714269.swf" name="sheild on fire side phasers"/><action id="23699210.swf" name=" ZOOM"/><action id="24755852.swf" name=" shield on fire side phasers"/><action id="58555786.swf" name="escape pods"/></char>
						<char id="1164668" name="DALEK by section31" published="1" facing="left" thumb="1164669.swf" default="1164669.swf"><tags/><action id="1164669.swf" name="default"/><action id="1202469.swf" name="movehead"/><action id="1202491.swf" name="exterminate"/><action id="1202516.swf" name="wide beam exterminate"/><action id="1202541.swf" name="blackdalekdefault"/><action id="1202542.swf" name="blackdalekmovehead"/><action id="1202543.swf" name="blackdalekexterminate"/><action id="1731087.swf" name="reddalek1explode"/></char>
						<char id="1814132" name="Demon Biker by Charles Zippel" published="1" facing="left" thumb="1814133.swf" default="1814133.swf"><tags>czdemonbiker</tags><action id="1814133.swf" name="Stand"/><action id="1814135.swf" name="Stand Talk"/><action id="1814136.swf" name="Walk"/><action id="1814137.swf" name="Fighting Stance"/><action id="1814140.swf" name="Energy Blast Position"/><action id="1814141.swf" name="Point Arm"/><action id="1814144.swf" name="Punch"/><action id="1814146.swf" name="Sit"/><action id="1814149.swf" name="Motorbike Only"/><action id="1814150.swf" name="Ride Motorbike Slow"/><action id="1814161.swf" name="Ride Motorbike Fast"/><action id="1814162.swf" name="Credits"/><action id="1814222.swf" name="Get Hit"/><action id="1814225.swf" name="Get Knocked Out"/><action id="1814226.swf" name="Knocked Out"/><action id="1835556.swf" name="Double Punch"/><action id="1839298.swf" name="Ride Motorbike stopped"/></char>
						<char id="1819715" name="Spinning Tardis by section31" published="1" facing="left" thumb="1819747.swf" default="1819747.swf"><tags>tardis  spinround</tags><action id="1819721.swf" name="phase out"/><action id="1819724.swf" name="phasein"/><action id="1819747.swf" name="spinround"/></char>
						<char id="1166428" name="REPLICATORCUP" published="1" facing="left" thumb="1166435.swf" default="1166435.swf"><tags>replicatorcuponly</tags><action id="1166435.swf" name="STILL"/><action id="1166439.swf" name="ONLY"/></char>
						<char id="1164416" name="TARDIS by section31" published="1" facing="left" thumb="1819265.swf" default="1819265.swf"><tags/><action id="1819245.swf" name="door opening"/><action id="1819248.swf" name="door closing"/><action id="1819249.swf" name="door opened"/><action id="1819265.swf" name="tardis"/><action id="1819267.swf" name="tardisappear"/><action id="1819270.swf" name="tardisdissappear"/></char>
						<char id="1885278" name="Police Car" published="1" facing="left" thumb="1885279.swf" default="1885279.swf"><tags>tetpolicecar</tags><action id="1885279.swf" name="Parked"/><action id="1885281.swf" name="Cruising"/><action id="1885286.swf" name="Pursuit"/><action id="1885287.swf" name="Credit"/></char>
						<char id="1324346" name="FA Artist" published="1" facing="left" thumb="1324355.swf" default="1324355.swf"><tags/><action id="1324347.swf" name="artist gets easel back CS4"/><action id="1324354.swf" name="Artist yelling hey CS4"/><action id="1324355.swf" name="i need help moving hold CS4"/><action id="1324358.swf" name="woah doctor bills CS4"/><action id="1324479.swf" name="artist whats FA CS4"/><action id="1324480.swf" name="Artist painting CS4"/><action id="1324569.swf" name="i need help CS4"/><action id="199399952.swf" name="Jack New Crying"/><action id="199400095.swf" name="Jack New Good Job"/><action id="200378157.swf" name="Queen angry"/></char>
						<char id="1154816" name="ROMULAN WARBIRD" published="1" facing="left" thumb="1154817.swf" default="1154817.swf"><tags/><action id="1154817.swf" name="default"/><action id="1154820.swf" name="default"/><action id="1154919.swf" name=" fire disruptors"/><action id="1154924.swf" name="continuous fire"/><action id="1154936.swf" name="fire tirpedoes"/><action id="1154972.swf" name="decloak"/><action id="1156192.swf" name=" shield hit"/><action id="1156270.swf" name="shields up"/><action id="1156296.swf" name="shields and torpedos"/><action id="1156315.swf" name="torpedoesdisruptors"/><action id="1156318.swf" name="shields/torpedoes/disruptors"/><action id="1156331.swf" name="diruptors shields"/><action id="1156356.swf" name="LOWER SHIELDS"/><action id="1156428.swf" name="shields down"/><action id="1918427.swf" name="decloak melt"/><action id="1918470.swf" name="cloak melt"/></char>
						<char id="1306082" name="CATWOMAN" published="1" facing="left" thumb="1306181.swf" default="1306181.swf"><tags/><action id="1306135.swf" name="scheming"/><action id="1306164.swf" name="walk"/><action id="1306181.swf" name="stand"/><action id="1307395.swf" name="kiss"/><action id="1985062.swf" name="threaten"/><action id="1985067.swf" name=" murdered"/><action id="1985105.swf" name="talk"/><action id="1985156.swf" name=" think"/><action id="1985823.swf" name="on bike"/></char>
						<char id="4754587" name="GALILEO AFT by solarbaby" published="1" facing="left" thumb="4754588.swf" default="4754588.swf"><tags>aft default</tags><action id="4754588.swf" name=" AFT DEFAULT"/><action id="4754658.swf" name="WARP OUT"/><action id="4795386.swf" name="burn up"/><action id="4878559.swf" name="crashedaft"/></char>
						<char id="66713375" name="Dr.Eggman by Johnny Hotdog" published="1" facing="left" thumb="66713376.swf" default="66713376.swf"><tags>jhcharacters</tags><action id="66713376.swf" name="eggman_facefront"/><action id="66713389.swf" name="eggman_faceright"/><action id="66713581.swf" name="eggman_credits"/></char>
						<char id="1636962" name="HUMPTY DUMPTY" published="1" facing="left" thumb="1636963.swf" default="1636963.swf"><tags/><action id="1636963.swf" name="humpty"/><action id="1637066.swf" name="humptyNAUGHTY"/></char>
						<char id="13828229" name="Chaostoons Sonic" published="1" facing="left" thumb="13828231.swf" default="13828231.swf"><tags/><action id="13828231.swf" name="APRILFOOLSDAY2011"/></char>
						<char id="1973023" name="MILLENIUM FALCON " published="1" facing="left" thumb="1973024.swf" default="1973024.swf"><tags/><action id="1973024.swf" name=" DEFAULT"/><action id="1973027.swf" name=" LASERZ"/></char>
						<char id="1680552" name="Hoot" published="1" facing="left" thumb="1680553.swf" default="1680553.swf"><tags>tethoot</tags><action id="1680553.swf" name="Standing"/><action id="1680794.swf" name="Sleeping"/><action id="1680909.swf" name="Talking"/><action id="1696746.swf" name="Credits"/><action id="1696921.swf" name="Look to side"/><action id="1764153.swf" name="Excited flap wings"/><action id="1764210.swf" name="Stand side"/><action id="1764293.swf" name="walk"/><action id="1764375.swf" name="Jump"/><action id="3786391.swf" name="Backview talking"/><action id="132008268.swf" name="walk and talk"/><action id="132785152.swf" name="Talk side"/></char>
						<char id="3473744" name="OBERTH by solarbaby" published="1" facing="left" thumb="3473745.swf" default="3473745.swf"><tags/><action id="3473745.swf" name="default"/><action id="3479049.swf" name=" fire weapons"/><action id="3479178.swf" name="OBERTH "/></char>
						<char id="1925052" name="KTINGA FRONT by solarbaby" published="1" facing="left" thumb="1925053.swf" default="1925053.swf"><tags/><action id="1925053.swf" name=" DEFAULT"/><action id="1925057.swf" name="DE CLOAK"/><action id="1925066.swf" name="KTINGA CLOAK"/><action id="1925121.swf" name="KTINGA FRONT TORPEDOLIGHT"/><action id="4323301.swf" name=" SPIN WARP OUT"/></char>
						<char id="547421" name="Cubic Cat" published="1" facing="left" thumb="547422.swf" default="547422.swf"><tags>cubicpets</tags><action id="547422.swf" name="standing"/><action id="547423.swf" name="talking"/><action id="547424.swf" name="sleeping"/><action id="547425.swf" name="shy"/><action id="547426.swf" name="walking"/></char>
						<char id="72551015" name="golden gate bridge by solarbaby" published="1" facing="left" thumb="72551017.swf" default="72551017.swf"><tags/><action id="72551017.swf" name="default"/><action id="72552392.swf" name="blurry"/><action id="72552795.swf" name="night"/><action id="72554839.swf" name="moving traffic"/></char>
						<char id="4645322" name="ENTERPRISE AFT by solarbaby" published="1" facing="left" thumb="4645323.swf" default="4645323.swf"><tags/><action id="4645323.swf" name="enterprise aft default"/><action id="4645345.swf" name="enterprise aft fire phasers"/><action id="4675082.swf" name="fire phasers torps"/><action id="4675084.swf" name="fire torps"/><action id="4753097.swf" name="shuttle leave"/><action id="4753110.swf" name="shuttle land"/><action id="4753942.swf" name="shuttle doors close"/><action id="5043080.swf" name="ent aft fire top phasers"/><action id="23597553.swf" name="ent aft going to warp"/><action id="24227886.swf" name="enterprise aft fire phasers torps sound"/><action id="50132269.swf" name="leaking warp plasma"/><action id="50132346.swf" name="damaged nacelle"/><action id="53863841.swf" name="enterprise aft shuttle decompress"/><action id="56563035.swf" name="shuttle approachandland"/><action id="79490714.swf" name="enterprise aft OMEGA FLASH"/></char>
						<char id="66712491" name="Darth Vader by Johnny Hotdog" published="1" facing="left" thumb="66712492.swf" default="66712492.swf"><tags>jhcharacters</tags><action id="66712492.swf" name="Darth Vader"/><action id="66712510.swf" name="darthvader_back"/><action id="66712570.swf" name="darthvader_back_slash"/><action id="66712584.swf" name="darthvader_back_slash_2"/><action id="66712591.swf" name="darthvader_psy"/><action id="66712641.swf" name="darthvader_front_slash"/><action id="66712759.swf" name="darthvader_walk"/><action id="66712878.swf" name="darthvader_credits"/></char>
						<char id="9729292" name="USS REPUBLIC" published="1" facing="left" thumb="9729535.swf" default="9729535.swf"><tags/><action id="9729293.swf" name=" Default"/><action id="9729535.swf" name=" ventral"/><action id="9729890.swf" name=" aft PHASERS"/><action id="9732465.swf" name="aft torpedos"/></char>
						<char id="3249729" name="ENTERPRISE FRONT" published="1" facing="left" thumb="3249730.swf" default="3249730.swf"><tags/><action id="3249730.swf" name="default"/></char>
						<char id="1146317" name="PURPLE CENTURION =SECTION31" published="1" facing="left" thumb="1146318.swf" default="1146318.swf"><tags/><action id="1146318.swf" name="STANDING"/><action id="1146319.swf" name="WALK"/><action id="1146855.swf" name="DISRUPTOR POINT LEFT"/><action id="1146942.swf" name="WALK RIGHT"/><action id="1147038.swf" name="FIRE RIGHT"/></char>
						<char id="1969493" name="CATHERINE WHEELS" published="1" facing="left" thumb="1969534.swf" default="1969534.swf"><tags/><action id="1969495.swf" name="move"/><action id="1969520.swf" name="spinaround"/><action id="1969534.swf" name="default"/><action id="1969570.swf" name=" fire energy blast"/><action id="1969571.swf" name=" fire energy blast still"/><action id="1969612.swf" name=" car park"/><action id="1969615.swf" name=" transmogrify"/></char>
						<char id="9680294" name="tardis controls by solarbaby" published="1" facing="left" thumb="9680295.swf" default="9680295.swf"><tags>tardis controls</tags><action id="9680295.swf" name="tardis controls"/><action id="9680329.swf" name="tardis controlsoff"/></char>
						<char id="1205495" name="HOLODECK DOORS" published="1" facing="left" thumb="1205503.swf" default="1205503.swf"><tags/><action id="1205503.swf" name=" CLOSED"/><action id="1205504.swf" name=" OPEN"/><action id="1210934.swf" name="OPENING"/><action id="1210946.swf" name="CLOSING"/></char>
						<char id="4324159" name="KTINGA SIDE OBLIQUE by solarbaby" published="1" facing="left" thumb="4324160.swf" default="4324160.swf"><tags/><action id="4324160.swf" name="DEFAULT"/><action id="4324488.swf" name=" PHASE OUT"/><action id="16409892.swf" name="cloak"/><action id="16410249.swf" name="Decloak"/><action id="16412240.swf" name="torpedoes"/></char>
						<char id="14187548" name="Hidden Sonic 2" published="1" facing="left" thumb="14187550.swf" default="14187550.swf"><tags/><action id="14187550.swf" name="Sonic Joke2"/></char>
						<char id="1148845" name="PICARD" published="1" facing="left" thumb="1151155.swf" default="1151155.swf"><tags>dematerialise</tags><action id="1148846.swf" name=" dematerialise"/><action id="1148867.swf" name="materialise"/><action id="1151103.swf" name="walk"/><action id="1151155.swf" name="stand"/><action id="1177214.swf" name="PICARD walk2"/><action id="1186425.swf" name="PICARD STANDblink"/><action id="1186691.swf" name=" STAND Talk"/><action id="1191156.swf" name=" walk left"/><action id="1191182.swf" name="STAND Talkleft"/><action id="1191241.swf" name=" STAND blink right"/><action id="1192213.swf" name="SHOCKED"/><action id="1199177.swf" name="CALCULATE"/><action id="1205275.swf" name="sit"/><action id="1205289.swf" name=" sit left"/><action id="1205301.swf" name="sit talk"/><action id="1205303.swf" name=" sit left talk"/><action id="1208145.swf" name="TURD SHOCKED"/><action id="1208198.swf" name=" TURD STAND Talkleft"/><action id="1208227.swf" name="TURD STAND left"/><action id="1211241.swf" name="SHOCKED LEFT"/><action id="1211879.swf" name="SNIFFUP"/><action id="1212111.swf" name="MAKE IT SO"/><action id="1251971.swf" name="PICARD TURBULANCE LEFT"/><action id="1252428.swf" name="TURBULANCE RIGHT"/><action id="1260543.swf" name="STANDblinkbreathe"/><action id="1260544.swf" name="blink left breathe"/><action id="1268137.swf" name="ferengi tubulance"/><action id="1280975.swf" name="mucus walk left"/><action id="1280994.swf" name="MUCUS amp STAND TALK"/><action id="1284638.swf" name="walk talk left"/><action id="1339002.swf" name="MUCUS AMPUTATED"/><action id="1946022.swf" name="make it so right"/></char>
						<char id="1687173" name="BLUE DALEK" published="1" facing="left" thumb="1687174.swf" default="1687174.swf"><tags/><action id="1687174.swf" name="DEFAULT"/><action id="1687180.swf" name="exterminate "/><action id="1687184.swf" name="movehead "/><action id="1687214.swf" name="exterminate"/><action id="1731152.swf" name="bluedalek1explode"/></char>
						<char id="1905326" name="EXCELSIOR BELOW" published="1" facing="left" thumb="1905327.swf" default="1905327.swf"><tags>excelsior dorsla default</tags><action id="1905327.swf" name="excelsior dorsla default"/><action id="1905328.swf" name=" torpedos"/></char>
						<char id="547337" name="SUSU" published="1" facing="left" thumb="547341.swf" default="547341.swf"><tags/><action id="547338.swf" name="confused"/><action id="547339.swf" name="sad"/><action id="547341.swf" name="stand"/><action id="547343.swf" name="walk"/><action id="547351.swf" name="talk"/></char>
						<char id="1687187" name="GOLD DALEK" published="1" facing="left" thumb="1687188.swf" default="1687188.swf"><tags/><action id="1687188.swf" name="DEAFAULT"/><action id="1687190.swf" name="movehead "/><action id="1687193.swf" name="Exterminate "/><action id="1687217.swf" name="exterminate2 "/><action id="1731223.swf" name="golddalek1explode"/></char>
						<char id="2959056" name="BOP AFT  by solarbaby" published="1" facing="left" thumb="2959057.swf" default="2959057.swf"><tags/><action id="2959057.swf" name=" default"/><action id="5073941.swf" name="bop AFT fire torpedos"/></char>
						<char id="1359681" name="picg" published="1" facing="left" thumb="1359682.swf" default="1359682.swf"><tags/><action id="1359682.swf" name="43_pig"/></char>
						<char id="1667228" name="JEAP" published="1" facing="left" thumb="1667586.swf" default="1667586.swf"><tags/><action id="1667230.swf" name="jeapdrive"/><action id="1667586.swf" name="jeap door close"/><action id="1667588.swf" name="jeap door open"/><action id="1667591.swf" name="jeap"/><action id="1667597.swf" name="jeap door opened"/><action id="1667819.swf" name="jeapsidedrive"/><action id="1688181.swf" name="jeapsidestill"/></char>
						<char id="1894754" name="shuttlebay by solarbaby" published="1" facing="left" thumb="1894755.swf" default="1894755.swf"><tags/><action id="1894755.swf" name="closed"/><action id="1894770.swf" name="opening"/><action id="1894772.swf" name="closing"/><action id="1894828.swf" name="opened"/><action id="57503006.swf" name="shuttle in hangar"/><action id="57504422.swf" name="shuttle hangar retract"/><action id="80107000.swf" name="shuttlebay rear"/></char>
						<char id="1198772" name="Dragon by Chaostoon" published="1" facing="left" thumb="1198773.swf" default="1198773.swf"><tags>chaostoon dragon</tags><action id="1198773.swf" name="Standing"/><action id="1198775.swf" name="Throw Fire and Hover"/><action id="1198777.swf" name="Fly"/><action id="1198779.swf" name="Landing from Fly"/><action id="1198784.swf" name="Roar / Throw Fire"/><action id="1198785.swf" name="Roar Hold"/><action id="1198787.swf" name="Sad"/><action id="1198788.swf" name="Takeoff"/><action id="1198789.swf" name="Thinking"/><action id="1198790.swf" name="Upset"/><action id="1198793.swf" name="Walk"/><action id="1198801.swf" name="Throw Fire Flying"/></char>
						<char id="1271772" name="BATOMBILE by section31" published="1" facing="left" thumb="1271787.swf" default="1271787.swf"><tags/><action id="1271773.swf" name="DRIVE HEADLIGHTS"/><action id="1271776.swf" name="parked"/><action id="1271778.swf" name="lights on"/><action id="1271779.swf" name="lights off"/><action id="1271787.swf" name="default"/></char>
						<char id="1978343" name="Filliblustes Scorpion gunship" published="1" facing="left" thumb="1978344.swf" default="1978344.swf"><tags/><action id="1978344.swf" name="default"/><action id="1978487.swf" name="credits"/><action id="1979163.swf" name=" flying"/><action id="1984354.swf" name="missiles"/></char>
						<char id="1164896" name="enterprise by solarbaby" published="1" facing="left" thumb="1164903.swf" default="1164903.swf"><tags/><action id="1164900.swf" name=" battledamaged"/><action id="1164903.swf" name="default1"/><action id="1164943.swf" name="shields2"/><action id="1893019.swf" name="enterprise redphasers"/><action id="1893020.swf" name="enterprise torpedos"/><action id="1893624.swf" name="enterprise explode"/><action id="2622755.swf" name="enterprise battledamagednofire"/><action id="2628022.swf" name="leaving warp"/><action id="2633455.swf" name="ENT TOP ZOOM"/><action id="2633476.swf" name="ENT TOP OBLIQUE"/><action id="3422424.swf" name="enterprise silhouette"/><action id="4943041.swf" name="enterprise default tholian web trapped"/><action id="4984750.swf" name="enterprise default tholian web warp"/><action id="5066009.swf" name="materialise"/><action id="5066013.swf" name="dematerialise"/><action id="5066164.swf" name="leaving warp2"/></char>
						<char id="2953867" name="bop front by solarbaby" published="1" facing="left" thumb="2953868.swf" default="2953868.swf"><tags/><action id="2953868.swf" name="default"/><action id="5093729.swf" name=" front torpedos"/><action id="5097281.swf" name="bop front explode"/></char>
						<char id="1400048" name="Klingon aft by solarbaby" published="1" facing="left" thumb="1400049.swf" default="1400049.swf"><tags/><action id="1400049.swf" name="DEFAULT"/><action id="1400050.swf" name="TORPEDOS"/><action id="1400051.swf" name="PHASERS"/><action id="1892933.swf" name="KTINGA cloak"/><action id="1892934.swf" name="KTINGA decloak"/></char>
						<char id="547316" name="GIGI" published="1" facing="left" thumb="547317.swf" default="547317.swf"><tags/><action id="547317.swf" name="stand"/><action id="547319.swf" name="shy"/><action id="547322.swf" name="sleeping"/><action id="547324.swf" name="walk"/><action id="547331.swf" name="furious"/></char>
						<char id="547369" name="Cubic Bear" published="1" facing="left" thumb="547370.swf" default="547370.swf"><tags>cubicpets</tags><action id="547370.swf" name="standing"/><action id="547374.swf" name="talking"/><action id="547380.swf" name="grabbed"/><action id="547381.swf" name="walking"/><action id="547418.swf" name="sleeping"/></char>
						<char id="1856666" name="lampost" published="1" facing="left" thumb="1856667.swf" default="1856667.swf"><tags/><action id="1856667.swf" name="default"/><action id="1856670.swf" name="on"/><action id="1856678.swf" name="shine on"/><action id="1856680.swf" name="shine off"/><action id="1856697.swf" name="flicker"/><action id="1856718.swf" name="shine"/></char>
						  <char id="gipsy" name="Gipsy" thumb="walk.swf" facing="left" default="laugh.swf" motion="walk.swf" enable="Y" is_premium="N" aid="237" money="0" sharing="0">
							<action id="laugh.swf" name="Laugh" loop="Y" totalframe="1" enable="Y" aid="238"/>
							<motion id="walk.swf" name="Walk" loop="Y" totalframe="1" enable="Y" aid="239"/>
							<action id="drool.swf" name="Drool" loop="Y" totalframe="1" enable="Y" aid="240"/>
							<action id="hit.swf" name="Get hit" loop="Y" totalframe="1" enable="Y" aid="241"/>
							<motion id="hop.swf" name="Hop" loop="Y" totalframe="1" enable="Y" aid="242"/>
							<action id="back.swf" name="Gipsy from Back" loop="Y" totalframe="1" enable="Y" aid="243"/>
							<action id="pant.swf" name="Pant" loop="Y" totalframe="1" enable="Y" aid="244"/>
							<action id="talk.swf" name="Talk" loop="Y" totalframe="1" enable="Y" aid="245"/>
						  </char>
						  <char id="ios" name="IOS" thumb="ios.swf" facing="left" default="ios.swf" motion="ios.swf" enable="Y" is_premium="N" aid="237" money="0" sharing="0">
							<action aid="6928" enable="Y" name="Be a phone" id="ios.swf" totalframe="1" loop="Y"/>
						  </char>
						  <char id="android" name="Android" thumb="android.swf" facing="left" default="android.swf" motion="android.swf" enable="Y" is_premium="N" aid="237" money="0" sharing="0">
							<action aid="6928" enable="Y" name="Be a phone" id="android.swf" totalframe="1" loop="Y"/>
						  </char>`;
						  tXml += "</theme>";
						  fs.writeFileSync(path.join(sFolder, `theme.xml`), tXml);
						  fUtil.addToZip(zap, "theme.xml", Buffer.from(tXml));
						  console.log(tXml);
						  fs.writeFileSync(path.join(commFolder, "Comm.zip"), Buffer.from(await zap.zip()));  
				}
				else
				{
				DB.update("assets", id, nontemplate);
				DB.update("comm", req.body.assetId, template);
				}
				res.json({ status: "ok" });	
			} catch (e) {
				console.log("Error inserting asset:", e);
				console.log("It's not like anyone will see this anyway...");
	
				res.statusCode = 405;
				res.json({ status: "unsupported" });
			}
			}
			else
			{
			res.statusCode = 405;
			rej("The type: " + req.body.type + " can't be added to the community Library");
			}		
		}
		else
		{
			try {
				if (info.isshared)
				{
				template.isshared = false;
				DB.delete("comm", id);
				}
				DB.update("assets", id, nontemplate);
				res.json({ status: "ok" });
			} catch (e) {
				console.log("Error updating asset:", e);
				console.log("It's not like anyone will see this anyway...");
	
				res.statusCode = 404;
				res.json({ status: "error" });
			}	
		}
	})
	// save
	.route("POST", "/goapi/saveVideo/", async (req, res) => {
		const filepath = req.files.Filedata.filepath;
		console.log(filepath.toString());
		const { ext } = await fromFile(filepath);
		console.log(ext.toString());

		let info = {
			type: "prop",
			subtype: "video",
			title: req.body.title
		}, id = fUtil.generateId() + ".flv";

		res.end(`0<asset><type>prop</type><subtype>video</subtype><title>${info.title}</title><published>0</published><tags></tags><width>0</width><height>0</height><file>${id}</file><id>${id}</id></asset>`);
		const temppath = tempfile(".flv");
		await new Promise((resolve, rej) => {
			// get the height and width
			ffmpeg(filepath).ffprobe((e, data) => {
				if (e) return rej(e);
				info.width = data.streams[0].width || data.streams[1].width;
				info.height = data.streams[0].height || data.streams[1].height;

				// convert the video to an flv
				ffmpeg(filepath)
					.output(temppath)
					.on("end", async () => {
						const readStream = fs.createReadStream(temppath);
						await Asset.save(readStream, id, info);

						// save the first frame
						ffmpeg(filepath)
							.seek("0:00")
							.output(path.join(
								__dirname,
								"../../",
								process.env.ASSET_FOLDER,
								id.slice(0, -3) + "png"
							))
							.outputOptions("-frames", "1")
							.on("end", () => resolve(id))
							.run();
					})
					.on("error", (e) => rej("Error converting video:", e))
					.run();
			});
		});
	})
	.route("POST", "/api/asset/upload", async (req, res) => {
		const file = req.files.import;
		res.assert(
			file,
			req.body.type,
			req.body.subtype,
			400,
			{
				status: "error",
				msg: "Missing one or more fields."
			}
		);

		// get the filename and extension
		const { filepath } = file;
		const origName = file.originalFilename;
		const filename = path.parse(origName).name;
		const { ext } = await fromFile(filepath);

		// validate the file type
		/*if ((fileTypes[req.body.type] || []).indexOf(ext) < 0) {
			res.status(400);
			res.json({
				status: "error",
				msg: "Invalid file type."
			});
			return;
		}*/

		let info = {
			type: req.body.type,
			subtype: req.body.subtype,
			isshared: false,
			title: req.body.name || filename,
		}, stream;

		switch (info.type) {
			case "bg": {
				if (ext == "swf") {
					stream = fs.createReadStream(filepath);
				} else {
					stream = await rFileUtil.resizeImage(filepath, 550, 354);
				}
				stream.pause();

				// save asset
				info.file = await Asset.save(stream, ext, info);
				break;
			}
			case "watermark": {
				stream = fs.createReadStream(filepath);
				stream.pause();

				// save asset
				info.file = await Asset.save(stream, ext, info);
				break;
			}
			case "sound": {
				await new Promise(async (resolve, reject) => {
					if (ext != "mp3") {
						stream = await rFileUtil.convertToMp3(filepath, ext);
					} else {
						stream = fs.createReadStream(filepath);
					}
					const temppath = tempfile(".mp3");
					const writeStream = fs.createWriteStream(temppath);
					stream.pipe(writeStream);
					stream.on("end", async () => {
						info.duration = await rFileUtil.mp3Duration(temppath);
						info.file = await Asset.save(temppath, "mp3", info);
						info.downloadtype = "progressive";
						resolve();
					});
				});
				break;
			}
			case "prop": {
				let { ptype } = req.body;
				// verify the prop type
				switch (ptype) {
					case "placeable":
					case "wearable":
					case "holdable":
						info.ptype = ptype;
					default:
						info.ptype = "placeable";
				}

				if (info.subtype == "video") {
					delete info.ptype;
					const temppath = tempfile(".flv");
					await new Promise((resolve, rej) => {
						// get the height and width
						ffmpeg(filepath).ffprobe((e, data) => {
							if (e) rej(e);
							info.width = data.streams[0].width;
							info.height = data.streams[0].height;

							// convert the video to an flv
							ffmpeg(filepath)
								.output(temppath)
								.on("end", async () => {
									const readStream = fs.createReadStream(temppath);
									info.file = await Asset.save(readStream, "flv", info);

									// save the first frame
									ffmpeg(filepath)
										.seek("0:00")
										.output(path.join(
											__dirname,
											"../../",
											process.env.ASSET_FOLDER,
											info.id.slice(0, -3) + "png"
										))
										.outputOptions("-frames", "1")
										.on("end", () => resolve(info.id))
										.run();
								})
								.on("error", (e) => rej("Error converting video:", e))
								.run();
						});
					});
				} else {
					info.file = await Asset.save(filepath, ext, info);
				}
				break;
			}
			default: {
				res.status(400);
				res.json({
					status: "error",
					msg: "Invalid asset type."
				});
				return;
			}
		}

		// stuff for the lvm
		info.enc_asset_id = info.file;

		res.json({
			status: "ok",
			data: info
		});
	})
	//I have no clue why 
	.route("POST", "/goapi/updateProp/", async (req, res) => {
		console.log(di);
		const pinfo = DB.get("assets", di).data;
		res.assert(req.body.imageData, 400, {
			status: "error",
			msg: "Missing files."
		});

		let info = {
			type: "prop",
			subtype: "0",
			title: pinfo.title,
			ptype: "placeable"
		};
		const buffer = Buffer.from(req.body.imageData, "base64");
		info.file = fs.writeFileSync(path.join(folder, pinfo.id), buffer);
		res.setHeader("Content-Type", "application/xml");
		res.end(`0<response><asset><id>${info.id}</id><enc_asset_id>${info.id}</enc_asset_id><type>prop</type><title>${info.title}</title><published>0</published><tags></tags><file>${info.id}</file></asset></response>`);
	})
	.route("POST", "/goapi/saveProp/", async (req, res) => {
	res.setHeader("Content-Type", "application/xml");
	const file = req.files.Filedata;
	res.assert(file, req.body.title, 400, "1<msg=\"Missing one or more fields.\"/>");

	// get the filename and extension
	const { filepath } = file;
	const origName = file.originalFilename;
	const filename = path.parse(origName).name;
	const { ext } = await fromFile(filepath);

	let info = {
		type: "prop",
		subtype: "0",
		title: req.body.title || filename,
		ptype: "placeable"
		};
		info.file = await Asset.save(filepath, ext, info);
		res.setHeader("Content-Type", "application/xml");
		di = info.file;
		console.log(di);
		info.file = await Asset.save(filepath, ext, info);
	        res.end("0<enc_asset_id=\"" + info.file + "\" type=\"prop\" subtype=\"0\" id=\"" + info.file + "\"/>");
	})
	.route("POST", "/goapi/saveBackground/", async (req, res) => {
		const file = req.files.Filedata;
		res.assert(file, req.body.title, 400, {
			status: "error",
			msg: "Missing one or more fields."
		});

		// get the filename and extension
		const { filepath } = file;
		const origName = file.originalFilename;
		const filename = path.parse(origName).name;
		const { ext } = await fromFile(filepath);

		let info = {
			type: "bg",
			subtype: "0",
			title: filename,
		};
		info.ptype = "placeable";
		info.file = await Asset.save(filepath, ext, info);

		// stuff for the lvm
		info.enc_asset_id = info.file;
		res.setHeader("Content-Type", "application/xml");

		res.end("0<status=\"ok\" type=\"bg\" subtype=\"0\" title=\"" + req.body.title + "\" id=\"" + info.enc_asset_id + "\" file=\"" + info.enc_asset_id + "\" enc_asset_id=\"" + info.enc_asset_id + "\" />");
	})
	.route("POST", "/goapi/saveSound/", async (req, res) => {
		console.log(req.body);
		isRecord = req.body.bytes ? true : false;

		let filepath, ext, stream;
		if (isRecord) {
			filepath = tempfile(".ogg");
			ext = "ogg";
			const buffer = Buffer.from(req.body.bytes, "base64");
			fs.writeFileSync(filepath, buffer);
		} else {
			// read the file
			filepath = req.files.Filedata.filepath;
			ext = (await fromFile(filepath)).ext;
		}

		let info = {
			type: "sound",
			subtype: req.body.subtype,
			title: req.body.title
		};

		if (ext != "mp3") {
			stream = await rFileUtil.convertToMp3(filepath, ext);
		} else {
			stream = fs.createReadStream(filepath);
		}
	const temppath = tempfile(".mp3");
	const writeStream = fs.createWriteStream(temppath);
	stream.pipe(writeStream);
	stream.on("end", async () => {
		info.duration = await rFileUtil.mp3Duration(temppath);
		const id = await Asset.save(temppath, "mp3", info);
		if (!req.body.headable) res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>${info.subtype}</subtype><title>${info.title}</title><published>0</published><tags></tags><duration>${info.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`);
		else res.end("0<status=\"ok\" downloadtype=\"progressive\" enable=\"Y\" type=\"sound\" subtype=\"" + info.subtype + "\" name=\"" + info.title + "\" tag=\"\" themeId=\"ugc\" duration=\"" + info.duration + "\" id=\"" + id + "\" file=\"" + id + "\" enc_asset_id=\"" + id + "\" />");
		});
	})
	// thumb
	.route("GET", /\/stock_thumbs\/([\S]+)/, (req, res) => {
		const filepath = path.join(__dirname, "../../", thumbUrl, req.matches[1]);
		if (fs.existsSync(filepath)) {
			fs.createReadStream(filepath).pipe(res);
		} else {
			res.status(404);
			res.end();
		}
	});

module.exports = group;
//New code that loves me now yaaaay
/*.route("POST", "/goapi/getCommunityAssets/", async (req, res) => {
	const handleError = (err) => {
		console.log("Error fetching user info:", err);
		res.statusCode = 500;
		res.end("1");
	};
	const request = https.request({ // gets asset data from GR to work with the community library
		hostname: "goanimate-remastered.joseph-animate.repl.co",
		path: "/ajax/getCommunityAssetData/?type=prop",
		method: "POST",
		headers: {
			"User-Agent": req.headers['user-agent']
		}
	}, (res2) => {
		let buffers = [];
		res2.on("data", (c) => buffers.push(c)).on("end", async () => {
			const meta = JSON.parse(Buffer.concat(buffers));
			var tXml = `<theme id="Comm" name="Community Library">`
			for (const v of meta) tXml += Asset.meta2StoreXml(v);
			const zip = nodezip.create();
			fUtil.addToZip(zip, "desc.xml", tXml + "</theme>");
			for (const file of meta) {
				const buffer = await get(`http://localhost:4343/assets/${file.id}`);
				fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
			}
			res.setHeader("Content-Type", "application/zip");
			res.end(Buffer.concat([base, await zip.zip()]));
		}).on("error", handleError);
	}).on("error", handleError);
	request.end();
})
.route("POST", "/goapi/getCommunityAssets/", async (req, res) => {
	const handleError = (err) => {
		console.log("Error fetching asset info:", err);
		res.statusCode = 500;
		res.end("1");
	};
	https.request({ // gets asset data from GR to work with the community library
		hostname: "goanimate-remastered.joseph-animate.repl.co",
		path: `/ajax/getCommunityAssetData/?type=${req.body.type}`,
		method: "POST",
		headers: {
			"User-Agent": req.headers['user-agent']
		}
	}, (res2) => {
		let buffers = [];
		res2.on("data", (c) => buffers.push(c)).on("end", async () => {
			const meta = JSON.parse(Buffer.concat(buffers));
			var tXml = `<theme id="Comm" name="Community Library">`
			for (const v of meta) tXml += Asset.meta2StoreXml(v);
			const zip = nodezip.create();
			fUtil.addToZip(zip, "desc.xml", tXml + "</theme>");
			for (const file of meta) {
				var buffer;
				if (file.mode != "char") buffer = await get(`http://localhost:4343/assets/${file.mId}`);
				else buffer = await get(`http://localhost:4343/characters/${file.id}`);
				fUtil.addToZip(zip, `${file.mode}/${file.id}`, buffer);
			}
			res.setHeader("Content-Type", "application/zip");
			res.end(Buffer.concat([base, await zip.zip()]));
		}).on("error", handleError);
	}).on("error", handleError).end();
})*/