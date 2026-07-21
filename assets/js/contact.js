/* =========================================================
   SECUREHABIT — CONTACT PAGE
   File: assets/js/contact.js
   ========================================================= */

(function () {
    "use strict";

    const PAGE_ID = "contact";
    const MESSAGE_LIMIT = 2000;

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,

        form: null,
        submitting: false,

        sectionObserver: null,
        heroFrame: null,
        parallaxFrame: null,
        resizeFrame: null,

        cleanupCallbacks: []
    };


    /* =========================================================
       1. VALIDATION MESSAGES
       ========================================================= */

    const validationMessages = {
        fullName: {
            valueMissing:
                "Enter your full name.",

            tooShort:
                "Enter at least 2 characters.",

            tooLong:
                "Keep the name under 120 characters."
        },

        workEmail: {
            valueMissing:
                "Enter an email address.",

            typeMismatch:
                "Enter a valid email address.",

            tooLong:
                "Keep the email address under 180 characters."
        },

        inquiryType: {
            valueMissing:
                "Choose an inquiry type."
        },

        message: {
            valueMissing:
                "Tell us about your inquiry.",

            tooShort:
                "Include at least 20 characters.",

            tooLong:
                "Keep the message under 2000 characters."
        },

        privacyConsent: {
            valueMissing:
                "Confirm the privacy and sensitive-information statement."
        }
    };


    /* =========================================================
       2. PAGE INITIALIZATION
       ========================================================= */

    function initializeContactPage() {
        if (state.initialized) {
            return;
        }

        if (
            !document.body ||
            document.body.dataset.page !== PAGE_ID
        ) {
            return;
        }

        state.initialized = true;

        document.documentElement.classList.remove(
            "no-js"
        );

        document.documentElement.classList.add(
            "js"
        );

        state.motionQuery =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

        state.reducedMotion =
            state.motionQuery.matches;

        initializeMotionPreference();
        initializeContactIdentity();
        initializeContactForm();
        initializeInquiryPaths();
        initializeQueryParameters();
        initializeContactFAQ();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        refreshIcons();
        refreshAOS();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:contact-ready",
                {
                    detail: {
                        page: PAGE_ID
                    }
                }
            )
        );
    }

    window.addEventListener(
        "securehabit:ready",
        initializeContactPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeContactPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                initializeContactPage();
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyContactPage,
        {
            once: true
        }
    );


    /* =========================================================
       3. GENERAL HELPERS
       ========================================================= */

    function clamp(
        value,
        minimum,
        maximum
    ) {
        return Math.min(
            Math.max(
                value,
                minimum
            ),
            maximum
        );
    }

    function setText(
        element,
        value
    ) {
        if (!element) {
            return;
        }

        element.textContent =
            String(value ?? "");
    }

    function focusWithoutScroll(element) {
        if (!element) {
            return;
        }

        try {
            element.focus({
                preventScroll: true
            });
        } catch {
            element.focus();
        }
    }

    function registerCleanup(callback) {
        if (
            typeof callback ===
            "function"
        ) {
            state.cleanupCallbacks.push(
                callback
            );
        }
    }

    function addEvent(
        target,
        eventName,
        callback,
        options
    ) {
        if (
            !target ||
            typeof target.addEventListener !==
            "function"
        ) {
            return;
        }

        target.addEventListener(
            eventName,
            callback,
            options
        );

        registerCleanup(function () {
            target.removeEventListener(
                eventName,
                callback,
                options
            );
        });
    }

    function refreshIcons() {
        if (
            window.SecureHabit &&
            typeof window.SecureHabit.refreshIcons ===
            "function"
        ) {
            window.SecureHabit.refreshIcons();
            return;
        }

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
            "function"
        ) {
            window.lucide.createIcons();
        }
    }

    function refreshAOS() {
        if (
            window.SecureHabit &&
            typeof window.SecureHabit.refreshAOS ===
            "function"
        ) {
            window.SecureHabit.refreshAOS();
            return;
        }

        if (
            window.AOS &&
            typeof window.AOS.refreshHard ===
            "function"
        ) {
            window.AOS.refreshHard();
        }
    }

    function isElementVisible(element) {
        if (!element) {
            return false;
        }

        const rect =
            element.getBoundingClientRect();

        return (
            rect.bottom > 0 &&
            rect.top < window.innerHeight
        );
    }

    function getFieldWrapper(field) {
        if (!field) {
            return null;
        }

        if (
            field.id ===
            "privacyConsent"
        ) {
            return field.closest(
                ".contact-form__consent"
            );
        }

        return field.closest(
            ".form-field"
        );
    }

    function getErrorElement(field) {
        if (
            !field ||
            !field.id
        ) {
            return null;
        }

        return document.querySelector(
            `[data-error-for="${field.id}"]`
        );
    }

    function isValidSelectValue(
        select,
        value
    ) {
        if (
            !select ||
            !value
        ) {
            return false;
        }

        return Array.from(
            select.options
        ).some(function (option) {
            return option.value === value;
        });
    }


    /* =========================================================
       4. CONTACT IDENTITY
       ========================================================= */

    function initializeContactIdentity() {
        const email =
            getConfiguredEmail();

        if (!email) {
            return;
        }

        document
            .querySelectorAll(
                "[data-config-email]"
            )
            .forEach(function (element) {
                setText(
                    element,
                    email
                );
            });

        document
            .querySelectorAll(
                "[data-config-email-link]"
            )
            .forEach(function (element) {
                element.setAttribute(
                    "href",
                    `mailto:${email}`
                );
            });

        document
            .querySelectorAll(
                'a[data-config-email]'
            )
            .forEach(function (element) {
                element.setAttribute(
                    "href",
                    `mailto:${email}`
                );
            });
    }

    function getConfiguredEmail() {
        const candidates = [
            window.SECUREHABIT_CONFIG
                ?.contact?.email,

            window.SECUREHABIT_CONFIG
                ?.company?.email,

            window.SecureHabitConfig
                ?.contact?.email,

            window.SecureHabitConfig
                ?.company?.email,

            window.SecureHabit
                ?.config?.contact?.email,

            window.SecureHabit
                ?.config?.company?.email
        ];

        const configuredEmail =
            candidates.find(
                function (value) {
                    return (
                        typeof value ===
                        "string" &&
                        value.includes("@")
                    );
                }
            );

        return (
            configuredEmail ||
            "hello@securehabit.example"
        );
    }


    /* =========================================================
       5. FORM INITIALIZATION
       ========================================================= */

    function initializeContactForm() {
        const form =
            document.querySelector(
                "[data-contact-form]"
            );

        if (
            !form ||
            form.dataset.initialized ===
            "true"
        ) {
            return;
        }

        form.dataset.initialized =
            "true";

        state.form = form;

        initializeFormMetadata(form);
        initializeMessageCounter(form);
        initializeFieldValidation(form);

        addEvent(
            form,
            "submit",
            handleFormSubmission
        );

        addEvent(
            form,
            "reset",
            function () {
                window.requestAnimationFrame(
                    function () {
                        clearAllFieldStates(form);
                        updateMessageCounter(form);
                        clearFormStatus(form);
                    }
                );
            }
        );
    }

    function initializeFormMetadata(form) {
        const timestamp =
            form.querySelector(
                "[data-contact-timestamp]"
            );

        const source =
            form.querySelector(
                "[data-contact-source]"
            );

        if (timestamp) {
            timestamp.value =
                new Date().toISOString();
        }

        if (source) {
            source.value =
                `${window.location.pathname}${window.location.search}`;
        }
    }


    /* =========================================================
       6. MESSAGE COUNTER
       ========================================================= */

    function initializeMessageCounter(form) {
        const message =
            form.querySelector(
                "[data-contact-message]"
            );

        if (!message) {
            return;
        }

        addEvent(
            message,
            "input",
            function () {
                updateMessageCounter(form);
            }
        );

        updateMessageCounter(form);
    }

    function updateMessageCounter(form) {
        const message =
            form.querySelector(
                "[data-contact-message]"
            );

        const counter =
            form.querySelector(
                "[data-contact-message-count]"
            );

        if (
            !message ||
            !counter
        ) {
            return;
        }

        const length =
            message.value.length;

        const limit =
            Number(
                message.maxLength
            ) || MESSAGE_LIMIT;

        setText(
            counter,
            `${length} / ${limit}`
        );

        counter.classList.toggle(
            "is-near-limit",
            length >= limit * 0.85 &&
            length < limit
        );

        counter.classList.toggle(
            "is-at-limit",
            length >= limit
        );
    }


    /* =========================================================
       7. FIELD VALIDATION
       ========================================================= */

    function initializeFieldValidation(form) {
        const fields =
            Array.from(
                form.querySelectorAll(
                    [
                        "input[required]",
                        "select[required]",
                        "textarea[required]"
                    ].join(",")
                )
            );

        fields.forEach(function (field) {
            addEvent(
                field,
                "blur",
                function () {
                    validateField(
                        field,
                        true
                    );
                }
            );

            addEvent(
                field,
                field.type === "checkbox"
                    ? "change"
                    : "input",
                function () {
                    const wrapper =
                        getFieldWrapper(field);

                    if (
                        field.getAttribute(
                            "aria-invalid"
                        ) === "true" ||
                        wrapper?.classList.contains(
                            "is-invalid"
                        )
                    ) {
                        validateField(
                            field,
                            true
                        );
                    }
                }
            );

            if (
                field instanceof
                HTMLSelectElement
            ) {
                addEvent(
                    field,
                    "change",
                    function () {
                        validateField(
                            field,
                            true
                        );
                    }
                );
            }
        });
    }

    function validateField(
        field,
        showMessage
    ) {
        if (!field) {
            return true;
        }

        const valid =
            field.checkValidity();

        const wrapper =
            getFieldWrapper(field);

        const error =
            getErrorElement(field);

        field.setAttribute(
            "aria-invalid",
            String(!valid)
        );

        wrapper?.classList.toggle(
            "is-invalid",
            !valid
        );

        wrapper?.classList.toggle(
            "is-valid",
            valid &&
            field.value !== ""
        );

        if (
            field.type === "checkbox" &&
            valid
        ) {
            wrapper?.classList.add(
                "is-valid"
            );
        }

        if (
            showMessage &&
            error
        ) {
            setText(
                error,
                valid
                    ? ""
                    : getValidationMessage(
                        field
                    )
            );
        }

        return valid;
    }

    function getValidationMessage(field) {
        const messages =
            validationMessages[
            field.id
            ] || {};

        const validity =
            field.validity;

        if (
            validity.valueMissing
        ) {
            return (
                messages.valueMissing ||
                "Complete this field."
            );
        }

        if (
            validity.typeMismatch
        ) {
            return (
                messages.typeMismatch ||
                "Enter a valid value."
            );
        }

        if (
            validity.tooShort
        ) {
            return (
                messages.tooShort ||
                "Enter more information."
            );
        }

        if (
            validity.tooLong
        ) {
            return (
                messages.tooLong ||
                "Shorten this value."
            );
        }

        if (
            validity.patternMismatch
        ) {
            return (
                messages.patternMismatch ||
                "Review the entered format."
            );
        }

        return (
            field.validationMessage ||
            "Review this field."
        );
    }

    function validateForm(form) {
        const fields =
            Array.from(
                form.querySelectorAll(
                    [
                        "input[required]",
                        "select[required]",
                        "textarea[required]"
                    ].join(",")
                )
            );

        let firstInvalid = null;

        fields.forEach(function (field) {
            const valid =
                validateField(
                    field,
                    true
                );

            if (
                !valid &&
                !firstInvalid
            ) {
                firstInvalid = field;
            }
        });

        if (firstInvalid) {
            focusWithoutScroll(
                firstInvalid
            );

            firstInvalid.scrollIntoView({
                behavior:
                    state.reducedMotion
                        ? "auto"
                        : "smooth",

                block: "center"
            });

            return false;
        }

        return true;
    }

    function clearAllFieldStates(form) {
        form
            .querySelectorAll(
                ".is-invalid, .is-valid"
            )
            .forEach(function (element) {
                element.classList.remove(
                    "is-invalid",
                    "is-valid"
                );
            });

        form
            .querySelectorAll(
                '[aria-invalid="true"]'
            )
            .forEach(function (field) {
                field.removeAttribute(
                    "aria-invalid"
                );
            });

        form
            .querySelectorAll(
                "[data-error-for]"
            )
            .forEach(function (error) {
                setText(
                    error,
                    ""
                );
            });
    }


    /* =========================================================
       8. FORM SUBMISSION
       ========================================================= */

    function handleFormSubmission(event) {
        const form =
            event.currentTarget;

        event.preventDefault();

        if (
            state.submitting ||
            !form
        ) {
            return;
        }

        clearFormStatus(form);

        const honeypot =
            form.elements
                .namedItem(
                    "companyWebsite"
                );

        if (
            honeypot &&
            String(
                honeypot.value || ""
            ).trim() !== ""
        ) {
            showFormStatus(
                form,
                "The inquiry could not be processed. Refresh the page and try again.",
                "warning"
            );

            return;
        }

        if (!validateForm(form)) {
            showFormStatus(
                form,
                "Review the highlighted fields before continuing.",
                "error"
            );

            return;
        }

        const action =
            resolveFormAction(form);

        if (
            isStaticContactAction(action)
        ) {
            openEmailFallback(form);
            return;
        }

        submitToConfiguredEndpoint(
            form
        );
    }

    function resolveFormAction(form) {
        try {
            return new URL(
                form.getAttribute(
                    "action"
                ) || window.location.href,
                window.location.href
            );
        } catch {
            return new URL(
                window.location.href
            );
        }
    }

    function isStaticContactAction(action) {
        const currentPath =
            normalizePathname(
                window.location.pathname
            );

        const actionPath =
            normalizePathname(
                action.pathname
            );

        return (
            actionPath === currentPath ||
            actionPath.endsWith(
                "/contact.html"
            ) ||
            actionPath.endsWith(
                "/contact"
            )
        );
    }

    function normalizePathname(pathname) {
        const value =
            pathname || "/";

        return value.length > 1
            ? value.replace(
                /\/+$/,
                ""
            )
            : value;
    }

    function submitToConfiguredEndpoint(form) {
        state.submitting = true;

        form.classList.add(
            "is-submitting"
        );

        const submitButton =
            form.querySelector(
                "[data-contact-submit]"
            );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.setAttribute(
                "aria-disabled",
                "true"
            );

            const label =
                submitButton.querySelector(
                    "span"
                );

            if (label) {
                label.dataset.originalText =
                    label.textContent;

                setText(
                    label,
                    "Sending Inquiry"
                );
            }
        }

        showFormStatus(
            form,
            "Submitting your inquiry through the configured contact endpoint.",
            "info",
            false
        );

        window.setTimeout(
            function () {
                HTMLFormElement.prototype.submit.call(
                    form
                );
            },
            state.reducedMotion
                ? 0
                : 180
        );
    }

    function openEmailFallback(form) {
        const email =
            getConfiguredEmail();

        const values =
            getFormValues(form);

        const subject =
            buildEmailSubject(values);

        const body =
            buildEmailBody(values);

        const mailto =
            `mailto:${encodeURIComponent(email)}` +
            `?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;

        showFormStatus(
            form,
            `The online form endpoint is not configured yet. Your email application will open with the inquiry details addressed to ${email}.`,
            "warning"
        );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:contact-email-fallback",
                {
                    detail: {
                        email,
                        values
                    }
                }
            )
        );

        window.setTimeout(
            function () {
                window.location.href =
                    mailto;
            },
            state.reducedMotion
                ? 0
                : 280
        );
    }

    function getFormValues(form) {
        const formData =
            new FormData(form);

        return {
            fullName:
                String(
                    formData.get(
                        "fullName"
                    ) || ""
                ).trim(),

            workEmail:
                String(
                    formData.get(
                        "workEmail"
                    ) || ""
                ).trim(),

            organization:
                String(
                    formData.get(
                        "organization"
                    ) || ""
                ).trim(),

            role:
                String(
                    formData.get(
                        "role"
                    ) || ""
                ).trim(),

            inquiryType:
                String(
                    formData.get(
                        "inquiryType"
                    ) || ""
                ).trim(),

            trainingTopic:
                String(
                    formData.get(
                        "trainingTopic"
                    ) || ""
                ).trim(),

            teamSize:
                String(
                    formData.get(
                        "teamSize"
                    ) || ""
                ).trim(),

            targetTiming:
                String(
                    formData.get(
                        "targetTiming"
                    ) || ""
                ).trim(),

            deliveryFormats:
                formData
                    .getAll(
                        "deliveryFormat[]"
                    )
                    .map(function (value) {
                        return String(value);
                    }),

            message:
                String(
                    formData.get(
                        "message"
                    ) || ""
                ).trim()
        };
    }

    function buildEmailSubject(values) {
        const inquiryLabel =
            formatValueLabel(
                values.inquiryType
            );

        return inquiryLabel
            ? `SecureHabit inquiry — ${inquiryLabel}`
            : "SecureHabit inquiry";
    }

    function buildEmailBody(values) {
        const lines = [
            "SecureHabit contact inquiry",
            "",
            `Name: ${values.fullName}`,
            `Email: ${values.workEmail}`,
            `Organization: ${values.organization || "Not provided"}`,
            `Role: ${values.role || "Not provided"}`,
            `Inquiry type: ${formatValueLabel(values.inquiryType) || "Not provided"}`,
            `Training topic: ${formatValueLabel(values.trainingTopic) || "Not provided"}`,
            `Team size: ${formatValueLabel(values.teamSize) || "Not provided"}`,
            `Preferred timing: ${formatValueLabel(values.targetTiming) || "Not provided"}`,
            `Preferred formats: ${values.deliveryFormats.length
                ? values.deliveryFormats
                    .map(
                        formatValueLabel
                    )
                    .join(", ")
                : "Not provided"
            }`,
            "",
            "Message:",
            values.message,
            "",
            "Sensitive-information confirmation:",
            "No passwords, credentials, confidential incident evidence or regulated personal information are intentionally included."
        ];

        return lines.join("\n");
    }

    function formatValueLabel(value) {
        if (!value) {
            return "";
        }

        return String(value)
            .replace(
                /[-_]+/g,
                " "
            )
            .replace(
                /\b\w/g,
                function (character) {
                    return character.toUpperCase();
                }
            );
    }


    /* =========================================================
       9. FORM STATUS
       ========================================================= */

    function showFormStatus(
        form,
        message,
        type,
        focusStatus = true
    ) {
        const status =
            form.querySelector(
                "[data-contact-form-status]"
            );

        if (!status) {
            return;
        }

        status.hidden = false;

        status.classList.remove(
            "is-error",
            "is-success",
            "is-warning"
        );

        if (
            type === "error"
        ) {
            status.classList.add(
                "is-error"
            );
        }

        if (
            type === "success"
        ) {
            status.classList.add(
                "is-success"
            );
        }

        if (
            type === "warning"
        ) {
            status.classList.add(
                "is-warning"
            );
        }

        setText(
            status,
            message
        );

        if (focusStatus) {
            window.requestAnimationFrame(
                function () {
                    focusWithoutScroll(
                        status
                    );
                }
            );
        }
    }

    function clearFormStatus(form) {
        const status =
            form.querySelector(
                "[data-contact-form-status]"
            );

        if (!status) {
            return;
        }

        status.hidden = true;

        status.classList.remove(
            "is-error",
            "is-success",
            "is-warning"
        );

        setText(
            status,
            ""
        );
    }


    /* =========================================================
       10. INQUIRY PATHS
       ========================================================= */

    function initializeInquiryPaths() {
        const links =
            Array.from(
                document.querySelectorAll(
                    "[data-contact-path][data-inquiry-value]"
                )
            );

        if (!links.length) {
            return;
        }

        links.forEach(function (link) {
            addEvent(
                link,
                "click",
                function (event) {
                    event.preventDefault();

                    selectInquiryPath(
                        link.dataset.inquiryValue,
                        {
                            scroll: true,
                            focus: true
                        }
                    );
                }
            );
        });
    }

    function selectInquiryPath(
        value,
        options = {}
    ) {
        const {
            scroll = false,
            focus = false
        } = options;

        const form =
            state.form ||
            document.querySelector(
                "[data-contact-form]"
            );

        const select =
            form?.querySelector(
                "[data-contact-inquiry]"
            );

        const formSection =
            document.querySelector(
                "#contact-form"
            );

        const formPanel =
            document.querySelector(
                ".contact-form-panel"
            );

        if (
            !form ||
            !select ||
            !isValidSelectValue(
                select,
                value
            )
        ) {
            return false;
        }

        select.value = value;

        validateField(
            select,
            true
        );

        formPanel?.setAttribute(
            "data-selected-inquiry",
            value
        );

        document
            .querySelectorAll(
                "[data-contact-path][data-inquiry-value]"
            )
            .forEach(function (element) {
                const selected =
                    element.dataset
                        .inquiryValue === value;

                element.classList.toggle(
                    "is-selected",
                    selected
                );

                if (
                    element.tagName === "A"
                ) {
                    element.setAttribute(
                        "aria-current",
                        selected
                            ? "true"
                            : "false"
                    );
                }
            });

        formPanel?.classList.remove(
            "is-highlighted"
        );

        window.requestAnimationFrame(
            function () {
                formPanel?.classList.add(
                    "is-highlighted"
                );
            }
        );

        if (
            scroll &&
            formSection
        ) {
            formSection.scrollIntoView({
                behavior:
                    state.reducedMotion
                        ? "auto"
                        : "smooth",

                block: "start"
            });
        }

        if (focus) {
            window.setTimeout(
                function () {
                    focusWithoutScroll(
                        select
                    );
                },
                state.reducedMotion
                    ? 0
                    : 520
            );
        }

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:contact-path-change",
                {
                    detail: {
                        inquiryType: value
                    }
                }
            )
        );

        return true;
    }


    /* =========================================================
       11. QUERY PARAMETERS
       ========================================================= */

    function initializeQueryParameters() {
        const parameters =
            new URLSearchParams(
                window.location.search
            );

        const topic =
            parameters.get(
                "topic"
            );

        const inquiry =
            parameters.get(
                "inquiry"
            );

        const topicSelect =
            state.form?.querySelector(
                "[data-contact-topic]"
            );

        if (
            topic &&
            topicSelect &&
            isValidSelectValue(
                topicSelect,
                topic
            )
        ) {
            topicSelect.value = topic;

            if (
                !inquiry
            ) {
                selectInquiryPath(
                    "training-inquiry"
                );
            }
        }

        if (inquiry) {
            selectInquiryPath(
                inquiry
            );
        }

        if (
            window.location.hash ===
            "#contact-form"
        ) {
            window.requestAnimationFrame(
                function () {
                    document
                        .querySelector(
                            "#contact-form"
                        )
                        ?.scrollIntoView({
                            behavior: "auto",
                            block: "start"
                        });
                }
            );
        }
    }


    /* =========================================================
       12. CONTACT FAQ
       ========================================================= */

    function initializeContactFAQ() {
        const accordion =
            document.querySelector(
                "[data-contact-faq]"
            );

        if (
            !accordion ||
            accordion.dataset.initialized ===
            "true"
        ) {
            return;
        }

        accordion.dataset.initialized =
            "true";

        const items =
            Array.from(
                accordion.querySelectorAll(
                    ".contact-faq__item"
                )
            );

        if (!items.length) {
            return;
        }

        let synchronizing = false;

        items.forEach(function (
            item,
            index
        ) {
            const summary =
                item.querySelector(
                    "summary"
                );

            const answer =
                item.querySelector(
                    ".contact-faq__answer"
                );

            if (
                !summary ||
                !answer
            ) {
                return;
            }

            if (!summary.id) {
                summary.id =
                    `contact-faq-summary-${index + 1}`;
            }

            if (!answer.id) {
                answer.id =
                    `contact-faq-answer-${index + 1}`;
            }

            summary.setAttribute(
                "aria-controls",
                answer.id
            );

            answer.setAttribute(
                "role",
                "region"
            );

            answer.setAttribute(
                "aria-labelledby",
                summary.id
            );

            function synchronizeItem() {
                summary.setAttribute(
                    "aria-expanded",
                    String(item.open)
                );

                answer.setAttribute(
                    "aria-hidden",
                    String(!item.open)
                );

                item.classList.toggle(
                    "is-open",
                    item.open
                );
            }

            function handleToggle() {
                synchronizeItem();

                if (
                    item.open &&
                    !synchronizing
                ) {
                    synchronizing = true;

                    items.forEach(function (
                        otherItem
                    ) {
                        if (
                            otherItem !== item &&
                            otherItem.open
                        ) {
                            otherItem.open = false;
                        }
                    });

                    synchronizing = false;
                }
            }

            addEvent(
                item,
                "toggle",
                handleToggle
            );

            synchronizeItem();
        });

        const openItem =
            items.find(function (item) {
                return item.open;
            });

        if (
            !openItem &&
            items[0]
        ) {
            items[0].open = true;
        }
    }


    /* =========================================================
       13. MOTION PREFERENCE
       ========================================================= */

    function initializeMotionPreference() {
        if (!state.motionQuery) {
            return;
        }

        const handleMotionChange =
            function (event) {
                state.reducedMotion =
                    event.matches;

                if (state.reducedMotion) {
                    resetMotionStyles();
                } else {
                    scheduleFinalCtaParallax();
                }
            };

        if (
            typeof state.motionQuery
                .addEventListener ===
            "function"
        ) {
            state.motionQuery.addEventListener(
                "change",
                handleMotionChange
            );

            registerCleanup(function () {
                state.motionQuery
                    .removeEventListener(
                        "change",
                        handleMotionChange
                    );
            });

            return;
        }

        if (
            typeof state.motionQuery
                .addListener ===
            "function"
        ) {
            state.motionQuery.addListener(
                handleMotionChange
            );

            registerCleanup(function () {
                state.motionQuery
                    .removeListener(
                        handleMotionChange
                    );
            });
        }
    }

    function resetMotionStyles() {
        const signal =
            document.querySelector(
                ".contact-hero__signal"
            );

        const mark =
            document.querySelector(
                ".contact-hero__mark"
            );

        const finalBackground =
            document.querySelector(
                ".contact-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".contact-final-cta__geometry"
            );

        signal?.removeAttribute(
            "style"
        );

        mark?.removeAttribute(
            "style"
        );

        finalBackground?.removeAttribute(
            "style"
        );

        finalGeometry?.removeAttribute(
            "style"
        );

        if (state.heroFrame) {
            window.cancelAnimationFrame(
                state.heroFrame
            );

            state.heroFrame = null;
        }

        if (state.parallaxFrame) {
            window.cancelAnimationFrame(
                state.parallaxFrame
            );

            state.parallaxFrame = null;
        }
    }


    /* =========================================================
       14. HERO POINTER MOTION
       ========================================================= */

    function initializeHeroMotion() {
        const hero =
            document.querySelector(
                ".contact-hero"
            );

        const signal =
            hero?.querySelector(
                ".contact-hero__signal"
            );

        const mark =
            hero?.querySelector(
                ".contact-hero__mark"
            );

        if (
            !hero ||
            (
                !signal &&
                !mark
            )
        ) {
            return;
        }

        const finePointer =
            window.matchMedia(
                "(hover: hover) and (pointer: fine)"
            );

        let targetX = 0;
        let targetY = 0;

        let currentX = 0;
        let currentY = 0;

        function render() {
            state.heroFrame = null;

            if (state.reducedMotion) {
                resetMotionStyles();
                return;
            }

            currentX +=
                (
                    targetX -
                    currentX
                ) * 0.075;

            currentY +=
                (
                    targetY -
                    currentY
                ) * 0.075;

            if (signal) {
                signal.style.transform =
                    `translate3d(` +
                    `${currentX * 17}px, ` +
                    `calc(-50% + ${currentY * 13}px), 0) ` +
                    `rotate(3deg)`;
            }

            if (mark) {
                mark.style.transform =
                    `translate3d(` +
                    `${currentX * -13}px, ` +
                    `calc(-50% + ${currentY * -9}px), 0) ` +
                    `rotate(10deg)`;
            }

            const unfinished =
                Math.abs(
                    targetX -
                    currentX
                ) > 0.001 ||
                Math.abs(
                    targetY -
                    currentY
                ) > 0.001;

            if (unfinished) {
                state.heroFrame =
                    window.requestAnimationFrame(
                        render
                    );
            }
        }

        function scheduleRender() {
            if (
                state.heroFrame ||
                state.reducedMotion
            ) {
                return;
            }

            state.heroFrame =
                window.requestAnimationFrame(
                    render
                );
        }

        function handlePointerMove(event) {
            if (
                !finePointer.matches ||
                state.reducedMotion
            ) {
                return;
            }

            const rect =
                hero.getBoundingClientRect();

            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return;
            }

            targetX =
                clamp(
                    (
                        (
                            event.clientX -
                            rect.left
                        ) /
                        rect.width
                    ) - 0.5,
                    -0.5,
                    0.5
                );

            targetY =
                clamp(
                    (
                        (
                            event.clientY -
                            rect.top
                        ) /
                        rect.height
                    ) - 0.5,
                    -0.5,
                    0.5
                );

            scheduleRender();
        }

        function resetPointer() {
            targetX = 0;
            targetY = 0;

            scheduleRender();
        }

        addEvent(
            hero,
            "pointermove",
            handlePointerMove,
            {
                passive: true
            }
        );

        addEvent(
            hero,
            "pointerleave",
            resetPointer,
            {
                passive: true
            }
        );
    }


    /* =========================================================
       15. FINAL CTA PARALLAX
       ========================================================= */

    function initializeFinalCtaParallax() {
        const section =
            document.querySelector(
                ".contact-final-cta"
            );

        const background =
            section?.querySelector(
                ".contact-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".contact-final-cta__geometry"
            );

        if (
            !section ||
            !background
        ) {
            return;
        }

        function update() {
            state.parallaxFrame = null;

            if (
                state.reducedMotion ||
                !isElementVisible(section)
            ) {
                return;
            }

            const rect =
                section.getBoundingClientRect();

            const viewportCenter =
                window.innerHeight / 2;

            const sectionCenter =
                rect.top +
                rect.height / 2;

            const distance =
                sectionCenter -
                viewportCenter;

            const backgroundOffset =
                clamp(
                    distance * -0.055,
                    -44,
                    44
                );

            const geometryOffset =
                clamp(
                    distance * 0.035,
                    -27,
                    27
                );

            background.style.transform =
                `translate3d(0, ${backgroundOffset}px, 0) scale(1.09)`;

            if (geometry) {
                geometry.style.transform =
                    `translate3d(0, calc(-50% + ${geometryOffset}px), 0) rotate(8deg)`;
            }
        }

        function scheduleUpdate() {
            if (
                state.parallaxFrame ||
                state.reducedMotion
            ) {
                return;
            }

            state.parallaxFrame =
                window.requestAnimationFrame(
                    update
                );
        }

        window
            .SecureHabitContactScheduleParallax =
            scheduleUpdate;

        addEvent(
            window,
            "scroll",
            scheduleUpdate,
            {
                passive: true
            }
        );

        addEvent(
            window,
            "resize",
            function () {
                if (state.resizeFrame) {
                    window.cancelAnimationFrame(
                        state.resizeFrame
                    );
                }

                state.resizeFrame =
                    window.requestAnimationFrame(
                        function () {
                            state.resizeFrame =
                                null;

                            scheduleUpdate();
                        }
                    );
            },
            {
                passive: true
            }
        );

        update();
    }

    function scheduleFinalCtaParallax() {
        if (
            typeof window
                .SecureHabitContactScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitContactScheduleParallax();
        }
    }


    /* =========================================================
       16. SECTION VISIBILITY
       ========================================================= */

    function initializeSectionStates() {
        const sections =
            Array.from(
                document.querySelectorAll(
                    [
                        ".contact-main",
                        ".contact-paths",
                        ".contact-next",
                        ".contact-faq",
                        ".contact-final-cta"
                    ].join(",")
                )
            );

        if (!sections.length) {
            return;
        }

        if (
            !(
                "IntersectionObserver" in
                window
            )
        ) {
            sections.forEach(function (
                section
            ) {
                section.classList.add(
                    "is-in-view"
                );

                section.dataset.hasEntered =
                    "true";
            });

            return;
        }

        state.sectionObserver =
            new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (
                        entry
                    ) {
                        entry.target.classList.toggle(
                            "is-in-view",
                            entry.isIntersecting
                        );

                        if (entry.isIntersecting) {
                            entry.target.dataset
                                .hasEntered = "true";
                        }
                    });
                },
                {
                    root: null,
                    rootMargin:
                        "-10% 0px -12% 0px",
                    threshold: 0.08
                }
            );

        sections.forEach(function (
            section
        ) {
            state.sectionObserver.observe(
                section
            );
        });
    }


    /* =========================================================
       17. CLEANUP
       ========================================================= */

    function destroyContactPage() {
        state.sectionObserver
            ?.disconnect();

        if (state.heroFrame) {
            window.cancelAnimationFrame(
                state.heroFrame
            );
        }

        if (state.parallaxFrame) {
            window.cancelAnimationFrame(
                state.parallaxFrame
            );
        }

        if (state.resizeFrame) {
            window.cancelAnimationFrame(
                state.resizeFrame
            );
        }

        state.cleanupCallbacks.forEach(
            function (callback) {
                try {
                    callback();
                } catch (error) {
                    console.warn(
                        "SecureHabit could not remove a Contact page event listener.",
                        error
                    );
                }
            }
        );

        delete window
            .SecureHabitContactScheduleParallax;

        state.cleanupCallbacks = [];
        state.sectionObserver = null;
        state.heroFrame = null;
        state.parallaxFrame = null;
        state.resizeFrame = null;
        state.form = null;
        state.submitting = false;
        state.initialized = false;
    }


    /* =========================================================
       18. PUBLIC PAGE API
       ========================================================= */

    window.SecureHabitContact =
        Object.freeze({
            selectInquiry:
                function (value) {
                    return selectInquiryPath(
                        String(value || ""),
                        {
                            scroll: true,
                            focus: true
                        }
                    );
                },

            validate:
                function () {
                    if (!state.form) {
                        return false;
                    }

                    return validateForm(
                        state.form
                    );
                },

            reset:
                function () {
                    if (!state.form) {
                        return;
                    }

                    state.form.reset();
                },

            focusForm:
                function () {
                    const formSection =
                        document.querySelector(
                            "#contact-form"
                        );

                    formSection?.scrollIntoView({
                        behavior:
                            state.reducedMotion
                                ? "auto"
                                : "smooth",

                        block: "start"
                    });
                },

            refreshParallax:
                scheduleFinalCtaParallax,

            refreshIcons:
                refreshIcons,

            destroy:
                destroyContactPage
        });
})();