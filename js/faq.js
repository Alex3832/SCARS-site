const faqDropdownQuestions = document.getElementsByClassName("question")

for (const question of faqDropdownQuestions) {
    question.addEventListener("click", () => {
        const answer = question.parentElement.getElementsByClassName("answer")[0]
        const computedHeight = getComputedStyle(answer).height;

        const dropdownArrow = question.parentElement.getElementsByClassName("dropdown-arrow")[0]

        if (computedHeight == "0px") {
            answer.style.height = "100%"
            answer.style.marginBottom = "15px"
            answer.style.marginTop = "15px"
            dropdownArrow.style.transform = "rotate(180deg)"
        } else {
            answer.style.height = "0"
            answer.style.marginBottom = "0px"
            answer.style.marginTop = "0px"
            dropdownArrow.style.transform = "rotate(0deg)"
        }
    })
}