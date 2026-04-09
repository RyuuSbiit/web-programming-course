const filterButtons = document.querySelectorAll(".filter-button");
const galleryCards = document.querySelectorAll(".gallery-card");
const galleryTriggers = document.querySelectorAll(".gallery-trigger");
const modal = document.getElementById("gallery-modal");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalCloseTargets = document.querySelectorAll("[data-close-modal]");
const feedbackForm = document.getElementById("feedback-form");
const formStatus = document.getElementById("form-status");

const validators = {
    name: (value) => value.trim().length >= 2,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    service: (value) => value.trim().length > 0,
    message: (value) => value.trim().length >= 10,
};

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");

        galleryCards.forEach((card) => {
            const shouldShow =
                filter === "all" || card.dataset.category === filter;

            card.classList.toggle("is-hidden", !shouldShow);
        });
    });
});

const openModal = ({ image, title, description, alt }) => {
    modalImage.src = image;
    modalImage.alt = alt;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
};

const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
    modalImage.alt = "";
    document.body.style.overflow = "";
};

galleryTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        const imageElement = trigger.querySelector("img");

        openModal({
            image: trigger.dataset.image,
            title: trigger.dataset.title,
            description: trigger.dataset.description,
            alt: imageElement ? imageElement.alt : "",
        });
    });
});

modalCloseTargets.forEach((target) => {
    target.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
    }
});

const setFieldState = (field, isValid) => {
    const fieldWrapper = field.closest(".field");

    if (!fieldWrapper) {
        return;
    }

    fieldWrapper.classList.toggle("is-invalid", !isValid);
};

const validateField = (field) => {
    const validator = validators[field.name];

    if (!validator) {
        return true;
    }

    const isValid = validator(field.value);
    setFieldState(field, isValid);
    return isValid;
};

if (feedbackForm && formStatus) {
    const fields = Array.from(feedbackForm.elements).filter(
        (element) =>
            element instanceof HTMLInputElement ||
            element instanceof HTMLSelectElement ||
            element instanceof HTMLTextAreaElement
    );

    fields.forEach((field) => {
        field.addEventListener("input", () => validateField(field));
        field.addEventListener("blur", () => validateField(field));
    });

    feedbackForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const isFormValid = fields.every((field) => validateField(field));

        formStatus.classList.remove("is-error", "is-success");

        if (!isFormValid) {
            formStatus.textContent =
                "Проверьте форму: имя, email, формат съемки и сообщение обязательны.";
            formStatus.classList.add("is-error");
            return;
        }

        formStatus.textContent =
            "Спасибо! Заявка принята, я свяжусь с вами в ближайшее время.";
        formStatus.classList.add("is-success");
        feedbackForm.reset();
        fields.forEach((field) => setFieldState(field, true));
    });
}
