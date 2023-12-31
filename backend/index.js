import express from "express"
import puppeteer from "puppeteer"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

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

const PORT = normalizePort(process.env.PORT || 8000)

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})

const getLink = async url => {
	const browser = await puppeteer.launch({
		args: [
			"--disable-setuid-sandbox",
			"--no-sandbox",
			"--single-process",
			"--disable-dev-shm-usage",
			"--no-zygote",
		],
		executablePath:
			process.env.NODE_ENV === "production"
				? process.env.PUPPETEER_EXECUTABLE_PATH
				: puppeteer.executablePath(),
		headless: "new",
	})

	try {
		const page = await browser.newPage()
		const userAgent =
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
		await page.setUserAgent(userAgent)

		await page.goto(`https://archive.is/${url}`)
		await page.setViewport({ width: 1080, height: 1024 })

		await page.waitForSelector("a")

		let href

		try {
			href = await page.evaluate(() => {
				const linkSelector = "div#row0 > div.TEXT-BLOCK > a"
				const link = document.querySelector(linkSelector)

				if (link) return link.getAttribute("href")
			})
		} catch (error) {
			console.error("Error occurred while extracting the href:", error)
			throw error
		}

		return href
	} catch (error) {
		console.error("Some Error occurred:", error)
		throw error
	} finally {
		await page.close()
		await browser.close()
	}
}

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

const invalidPathHandler = (req, res, next) => {
	res.status(404).json({ status: "error", message: "Path not found" })
}

app.use(invalidPathHandler)
