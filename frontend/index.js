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

const getCurrentTabUrl = async () => {
	try {
		const queryOptions = { active: true, currentWindow: true }
		const [tab] = await chrome?.tabs?.query(queryOptions)

		return tab?.url
	} catch (error) {
		console.log(error)
		return ""
	}
}

const btn = document.getElementById("btn")

const resetButtonState = () => {
	btn.innerText = "Remove paywall"
	btn.disabled = false
}

const updatePageText = message => {
	const paragraph = document.getElementById("error-message")
	paragraph.innerText = message
}

const handleBtnClick = async () => {
	btn.innerText = "Loading..."
	btn.disabled = true

	const url = await getCurrentTabUrl()
	console.log({ url })

	if (!url) {
		const errorMessage = "Couldn't fetch current page URL. Please try again."
		updatePageText(errorMessage)
		resetButtonState()

		return
	}

	const { errorCode, link } = await getLink(url)

	if (errorCode) {
		const errorMessage = getErrorMessage(errorCode)
		updatePageText(errorMessage)
		resetButtonState()

		return
	}

	// Remove error text if one exists from a previous button click
	updatePageText("")
	resetButtonState()

	window.open(link, "_blank")
}

btn.addEventListener("click", handleBtnClick)
