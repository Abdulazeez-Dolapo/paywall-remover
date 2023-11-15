async function getLink(url) {
	const BASE_URL = "http://localhost:8000"
	const rawResponse = await fetch(`${BASE_URL}/remove-paywall`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ url }),
	})

	if (!rawResponse.ok) {
		return {
			errorCode: rawResponse.status,
			link: null,
		}
	}

	const { data } = await rawResponse.json()
	return { errorCode: null, link: data.link }
}

const getErrorMessage = statusCode => {
	let errorMessage = "An error occurred. Please try again"

	switch (statusCode) {
		case 404:
			errorMessage =
				"We're unable to remove paywall from this page. Please try another page."
			break

		default:
			break
	}

	return errorMessage
}

const btn = document.getElementById("btn")

const handleBtnClick = async () => {
	btn.innerText = "Loading..."
	btn.disabled = true

	// const url = window.location.href?.split("?")?.[0]
	const url =
		"https://theathletic.com/5059090/2023/11/14/pochettino-chelsea-tottenham-city-fans/"
	console.log({ url })
	const { errorCode, link } = await getLink(url)

	const paragraph = document.getElementById("error-message")

	if (errorCode) {
		const errorMessage = getErrorMessage(errorCode)
		paragraph.innerText = errorMessage

		btn.innerText = "Remove paywall"
		btn.disabled = false

		return
	}

	// Remove error text if one exists from a previous button click
	paragraph.innerText = ""
	btn.innerText = "Remove paywall"
	btn.disabled = false

	window.open(link, "_blank")
}

btn.addEventListener("click", handleBtnClick)
