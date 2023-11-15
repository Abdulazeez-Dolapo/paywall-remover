import puppeteer from "puppeteer"

const getLink = async url => {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
	})

	const page = await browser.newPage()

	await page.goto(`https://archive.is/${url}`, {
		waitUntil: "domcontentloaded",
	})

	let href

	try {
		href = await page.evaluate(() => {
			const link = document.querySelector("div#row0 > div.TEXT-BLOCK > a")

			if (link) return link.getAttribute("href")
		})
	} catch (error) {
		console.error("Error occurred while extracting the href:", error)
		throw error
	}

	await browser.close()
	return href
}

const normalizePort = val => {
	const port = parseInt(val, 10)

	if (isNaN(port)) {
		return val
	}
	if (port >= 0) {
		return port
	}
	return false
}

import express from "express"
import cors from "cors"

const PORT = normalizePort(8000)

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.get("/", (req, res) => {
	res.status(200).json({ status: "success", message: "Welcome" })
})

app.post("/remove-paywall", async (req, res) => {
	const url = req.body.url
	console.log({ url })

	if (!url) {
		return res.status(400).json({
			status: "error",
			message: "Please pass in a valid URL",
		})
	}

	try {
		const link = await getLink(url)
		console.log({ link })

		if (!link) {
			return res.status(404).json({
				status: "error",
				message: "No saved web page found",
			})
		}

		return res.status(200).json({ status: "success", data: { link } })
	} catch (error) {
		return res
			.status(500)
			.json({ status: "error", message: "A problem occurred" })
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})

const invalidPathHandler = (req, res, next) => {
	res.status(404).json({ status: "error", message: "Path not found" })
}

app.use(invalidPathHandler)
