/**
 * movie routes
 */
// modules
const ffmpeg = require("fluent-ffmpeg");
const httpz = require("@octanuary/httpz")
const https = require("https");
// stuff
const database = require("../../data/database"), DB = new database();
const Movie = require("../models/movie");
const fUtil = require("../../utils/fileUtil");
const fs = require("fs");
const path = require("path");
const folder = path.join(__dirname, "../../");
// create the group
const group = new httpz.Group();

group
	// delete
	.route("GET", /\/api\/movie\/delete\/([^/]+)$/, async (req, res) => {
		const id = req.matches[1];

		console.log(`(Warning!) Deleting movie #${id}`);
		try {
			await Movie.delete(id);
			res.json({ status: "ok" });
		} catch (e) {
			console.error("This movie just won't die!", e);
			res.status(404);
			res.json({ status: "error" });
		}
	})
	.route("GET", /\/goapi\/deleteUserTemplate\/([^/]+)$/, async (req, res) => {
		const id = req.matches[1];

		console.log(`(Warning!) Deleting movie #${id}`);
		try {
			await Movie.delete(id);
			res.json({ status: "ok" });
		} catch (e) {
			console.error("This movie just won't die!", e);
			res.status(404);
			res.json({ status: "error" });
		}
	})
	.route("GET", /\/goapi\/DeleteUserTemplate\/([^/]+)$/, async (req, res) => {
		const id = req.matches[1];

		console.log(`(Warning!) Deleting movie #${id}`);
		try {
			await Movie.delete(id);
			res.json({ status: "ok" });
		} catch (e) {
			console.error("This movie just won't die!", e);
			res.status(404);
			res.json({ status: "error" });
		}
	})
	// list
	.route("GET", "/api/movies/list", (req, res) => {
		res.json(DB.select("movies"));
	})
	.route("GET", "/get_video", (req, res) => {
		const movie = fs.readFileSync(path.join(folder, `videos/${req.query.video_id}.mp4`));
		res.end(movie);
	})
	.route("POST", "/log", (req, res) => {
		res.json({redirect:"https://flashthemes.net"});
	})
	// load
	.route(
		"*",
		["/goapi/getMovie/", "/fbapi/getMovie/", "/fbapi/getMovieInfo/", /\/file\/movie\/file\/([^/]+)$/],
		async (req, res) => {
			const isGet = req.method == "GET";
			let id
			if (!req.body.movieId)
			{
			id = isGet ?
				req.matches[1] :
				req.query.movieId;
			}
			else
			{
				id = req.body.movieId;
			}
			res.assert(id, 200, "0");
			
			try {
				const buf = await Movie.load(id, isGet);
				res.setHeader("Content-Type", "application/zip");
				res.end(buf);
			} catch (e) {
				console.log("Error loading movie:", e);
				res.status(404);
				res.end();
			}
		}
	)
	.route("GET", "/api/movie/exportmovie", (req, res) => {
	return;
	})
	.route("POST", "/api/movie/upload", (req, res) => {
		const file = req.files.import;
		if (!file) {
			console.log("Error uploading movie: No file.");
			res.statusCode = 400;
			return res.json({ msg: "No file" });
		}
		const isStarter = req.body.is_starter;
		const path = file.filepath, buffer = fs.readFileSync(path);
	
		if (
			file.mimetype !== "application/x-zip-compressed" &&
			file.mimetype !== "application/zip" &&
			!buffer.slice(0, 4).equals(
				Buffer.from([0x50, 0x4b, 0x03, 0x04])
			)
		) {
			console.error("Attempted movie upload with invalid file.");
			res.statusCode = 400;
			return res.json({ msg: "Movie is not a zip" });
		}
	
		Movie.upload(buffer, isStarter).then((id) => {
			fs.unlinkSync(path);
			res.json({ id: id });
		}).catch((err) => {
			console.error("Error uploading movie:", err);
			res.statusCode = 500;
			res.json({ msg: null });
		});
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
	.route("POST", "/goapi/sendShareEmail/", (req, res) => {
		const handleError = (err) => {
			console.log("Error sending email:", err);
			res.statusCode = 500;
			res.end("1");
		};

		const request = https.request({
			hostname: "discord.com",
			path: "/api/v9/channels/1066856497637769371/messages",
			method: "POST",
			headers: {
				"Authorization": req.body.sender_email
			},
			payload: {
					"content": req.body.custom_message,
					"tts": false,
					"flags": 0
			}
		},
		(res) => {
		request.end();		
		}).on("error", handleError);
		})
	// load
	.route(
		"*",
		["/goapi/getMovie/", /\/file\/movie\/file\/([^/]+)$/],
		async (req, res) => {
			const isGet = req.method == "GET";
			const id = isGet ?
				req.matches[1] :
				req.query.movieId;
			res.assert(id, 200, "0");
			
			try {
				const buf = await Movie.load(id, isGet);
				res.setHeader("Content-Type", "application/zip");
				res.end(buf);
			} catch (e) {
				console.log("Error loading movie:", e);
				res.status(404);
				res.end();
			}
		}
	)
	// redirect
	.route("*", /\/videomaker\/full\/tutorial$/, (req, res) => {
		const theme = req.matches[1];

		res.redirect(`/go_full?tray=custom&tutorial=0`);
	})

	// redirect
	.route("*", /\/videomaker\/full\/(\w+)\/tutorial?$/, (req, res) => {
		const theme = req.matches[1];

		res.redirect(`/go_full?tray=${theme}&tutorial=0`);
	})
	// save
	//  #movies
	.route("POST", "/goapi/saveMovie/", async (req, res) => {
		if (req.body.userId != "")
		{
		res.assert(req.body.body_zip, 200, "0");
		const trigAutosave = req.body.is_triggered_by_autosave;
		res.assert(!(trigAutosave && !req.body.movieId), 200, "0");

		const body = Buffer.from(req.body.body_zip, "base64");
		const thumb = trigAutosave ?
			null : Buffer.from(req.body.thumbnail_large, "base64");

		const id = await Movie.save(body, thumb, req.body.movieId)
		res.end("0" + id);
		}
		else
		{
		rej("Cant Save Movie Due to not being logged in");
		}
	})
	.route("POST", "/goapi/clientbug/", async (req, res) => {
	res.end("0OK");
	})
	//old movies
	.route("POST", "/goapi/saveOldMovie/", async (req, res) => {
		const body = req.body.body;
		const thumb = Buffer.from(req.body.thumbnail_large, "base64");
	
		Movie.oldSave(body, thumb, req.body.movieId).then((id) => {
			res.end("0" + id);
		}).catch((err) => {
			res.statusCode = 500;
			res.end("1" + err);
			console.error("Error saving movie:", err);
		});
	})
	//  #starter
	.route("POST", "/goapi/saveTemplate/", async (req, res) => {
		res.assert(req.body.body_zip, req.body.thumbnail_large, 200, "0");
		const body = Buffer.from(req.body.body_zip, "base64");
		const thumb = Buffer.from(req.body.thumbnail_large, "base64");

		const id = await Movie.save(body, thumb, req.body.movieId, true)
		res.end("0" + id);
	})
	// thumb
	.route("*", /\/file\/movie\/thumb\/([^/]+)$/, (req, res) => {
		const id = req.matches[1];

		const readStream = Movie.thumb(id);
		res.setHeader("Content-Type", "image/png");
		readStream.pipe(res); 
	});

module.exports = group;
