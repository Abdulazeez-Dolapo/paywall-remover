async function getLink(url) {
	try {
		const BASE_URL = "http://localhost:8000"
		const rawResponse = await fetch(`${BASE_URL}/remove-paywall`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url }),
		})

		if (!rawResponse.ok) return { error: true, link: null }

		const { data } = await rawResponse.json()
		return { error: false, link: data.link }
	} catch (err) {
		console.log(err)
		return { error: true, link: null }
	}
}

const handleBtnClick = async () => {
	// const url = window.location.href?.split("?")?.[0]
	const url =
		"https://theathletic.com/5059090/2023/11/14/pochettino-chelsea-tottenham-city-fans/"
	console.log({ url })
	const { error, link } = await getLink(url)

	const paragraph = document.getElementById("error-message")

	if (error) {
		paragraph.innerText = "An error occurred. Please try again"
		return
	}

	// Remove error text if one exists from a previous button click
	paragraph.innerText = ""
	window.open(link, "_blank")
}

const btn = document.getElementById("btn")
btn.addEventListener("click", handleBtnClick)
