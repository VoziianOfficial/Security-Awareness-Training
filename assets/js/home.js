/* =========================================================
   SECUREHABIT — HOMEPAGE INTERACTIONS
   File: assets/js/home.js
   ========================================================= */

(function () {
    "use strict";

    const HOME_PAGE_ID = "home";

    const state = {
        initialized: false,
        reducedMotion: false,
        inbox: null,
        quiz: null,
        formatsSwiper: null,
        animationFrame: null,
        resizeFrame: null
    };

    const inboxMessages = {
        payroll: {
            id: "payroll",
            category: "Account notice",
            subject: "Immediate account confirmation required",
            from:
                "Payroll Messages <notice@payroll-message.example>",
            replyTo:
                "access-review@outside-mail.example",
            attachment: "1 attachment",
            attachmentVisible: true,
            body: `
        <p>Hello,</p>

        <p>
          Your payroll access is awaiting confirmation.
          Complete the attached review immediately to avoid
          restrictions to your next payment.
        </p>

        <p>
          Sign in using your company email and password.
        </p>

        <a
          class="home-inbox__fictional-link"
          href="https://training.invalid/payroll-review"
          tabindex="-1"
          aria-disabled="true"
        >
          Confirm payroll access
        </a>

        <p>Payroll Message Center</p>
      `,
            linkPreview:
                "https://training.invalid/payroll-review",
            expectedAnswer: "suspicious",
            feedback: {
                correctTitle: "Good decision to pause and review",
                incorrectTitle: "This message needs further verification",
                correctCopy:
                    "The message combines urgency, an external reply-to address, a request for credentials and an unexpected attachment.",
                incorrectCopy:
                    "A familiar subject such as payroll does not make a message safe. Review the sender, reply-to address, attachment and requested action before continuing.",
                warningSigns: [
                    "The message creates pressure around salary access.",
                    "The reply-to address differs from the visible sender.",
                    "It requests a company email address and password.",
                    "The attachment and sign-in request were not expected."
                ]
            }
        },

        project: {
            id: "project",
            category: "Shared document",
            subject: "Updated project documents",
            from:
                "Alex Rowan <alex.rowan@project-team.example>",
            replyTo:
                "shared-files@new-access.example",
            attachment: "No attachment",
            attachmentVisible: false,
            body: `
        <p>Hello,</p>

        <p>
          I moved the current project documents to a new
          sharing portal because the usual workspace is
          temporarily unavailable.
        </p>

        <p>
          Please use the link below and sign in with your
          work account before the client meeting.
        </p>

        <a
          class="home-inbox__fictional-link"
          href="https://training.invalid/new-project-share"
          tabindex="-1"
          aria-disabled="true"
        >
          Open updated documents
        </a>

        <p>Thanks,<br>Alex</p>
      `,
            linkPreview:
                "https://training.invalid/new-project-share",
            expectedAnswer: "suspicious",
            feedback: {
                correctTitle: "Independent verification is appropriate",
                incorrectTitle: "The context appears familiar, but the route changed",
                correctCopy:
                    "The sender name may be familiar, yet the message introduces an unexpected portal and asks for account access outside the usual workspace.",
                incorrectCopy:
                    "A known name does not confirm that the request is genuine. Contact the sender through an approved channel and verify the new sharing method.",
                warningSigns: [
                    "The normal workspace is supposedly unavailable.",
                    "A new external sharing domain is introduced.",
                    "The message asks for work-account credentials.",
                    "The upcoming meeting creates subtle time pressure."
                ]
            }
        },

        meeting: {
            id: "meeting",
            category: "Internal learning",
            subject: "Thursday awareness session",
            from:
                "Internal Training <training@internal-learning.example>",
            replyTo:
                "training@internal-learning.example",
            attachment: "No attachment",
            attachmentVisible: false,
            body: `
        <p>Hello team,</p>

        <p>
          Thursday’s awareness session will review fictional
          email examples and the internal reporting process.
        </p>

        <p>
          The agenda is available in the approved team
          workspace. Open the workspace independently or use
          the saved company bookmark.
        </p>

        <p>
          No password, payment or account information is
          requested in this message.
        </p>

        <p>Internal Training Team</p>
      `,
            linkPreview:
                "No external link included",
            expectedAnswer: "safe",
            feedback: {
                correctTitle: "The message contains fewer warning signs",
                incorrectTitle: "Careful review is useful, but context matters",
                correctCopy:
                    "The sender and reply-to addresses match, no credentials are requested and the message directs employees to an approved workspace rather than an embedded sign-in link.",
                incorrectCopy:
                    "Not every workplace message is suspicious. Review the details and compare them with expected communication and organizational procedures.",
                warningSigns: [
                    "The visible sender and reply-to address match.",
                    "No external sign-in link is included.",
                    "No credentials or payment action is requested.",
                    "The message recommends opening the approved workspace independently."
                ]
            }
        }
    };

    const warningSigns = {
        urgency: {
            label: "Unexpected urgency",
            title: "Pressure can reduce careful review.",
            copy:
                "A request that demands immediate action should still be checked through the organization’s approved verification route."
        },

        domain: {
            label: "Mismatched sender domain",
            title: "A display name is not the full sender identity.",
            copy:
                "Review the complete sender and reply-to addresses. Small domain changes can make an unfamiliar message appear connected with a known team."
        },

        attachment: {
            label: "Unusual file attachment",
            title: "Unexpected files deserve additional review.",
            copy:
                "Do not open an attachment only because the message appears work-related. Confirm whether the file and file type were expected."
        },

        credentials: {
            label: "Request for credentials",
            title: "Passwords should not be entered because an email asks.",
            copy:
                "Open approved services independently and follow the organization’s normal sign-in or recovery process."
        },

        payment: {
            label: "Account-change request",
            title: "Changes to payment details require independent confirmation.",
            copy:
                "Verify account or payment changes through an approved channel that is separate from the message requesting the change."
        },

        pressure: {
            label: "Emotional pressure",
            title: "Secrecy and authority can discourage verification.",
            copy:
                "Instructions not to contact a normal approver may be designed to bypass the checks that protect the organization."
        }
    };

    const quizFeedback = {
        login: {
            correct: {
                title: "Careful verification",
                copy:
                    "Opening the approved service independently avoids relying on the message link and allows you to verify whether the alert is genuine."
            },
            incorrect: {
                title: "Pause before using the message",
                copy:
                    "Urgency should not replace verification. Open the approved service independently and check the account through the normal route."
            }
        },

        password: {
            correct: {
                title: "Unique credentials reduce reuse risk",
                copy:
                    "A long password can still create risk when reused. Follow the organization’s approved password and password-manager guidance."
            },
            incorrect: {
                title: "Length does not make reuse appropriate",
                copy:
                    "Each important account should use a unique approved credential. Small changes to a reused password do not make it meaningfully unique."
            }
        },

        share: {
            correct: {
                title: "Verify the sender and sharing method",
                copy:
                    "Unexpected document invitations should be checked before signing in. Organizational policy should guide the approved sharing route."
            },
            incorrect: {
                title: "A common invitation can still be unexpected",
                copy:
                    "Do not use personal accounts or unfamiliar sign-in routes to work around uncertainty. Verify the sender and follow the approved process."
            }
        }
    };


    /* =========================================================
       INITIALIZATION
       ========================================================= */

    function initializeHomePage() {
        if (state.initialized) {
            return;
        }

        if (document.body?.dataset.page !== HOME_PAGE_ID) {
            return;
        }

        state.initialized = true;
        state.reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        initializeHeroParallax();
        initializeInboxSimulator();
        initializeTopicShowcase();
        initializeTrainingJourney();
        initializeWarningSigns();
        initializeOnboardingTimeline();
        initializeQuiz();
        initializeFormatsSwiper();
        initializeFinalParallax();

        window.SecureHabit?.refreshIcons?.();
        window.SecureHabit?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent("securehabit:home-ready")
        );
    }

    window.addEventListener(
        "securehabit:ready",
        initializeHomePage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeHomePage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            () => {
                if (window.SecureHabit) {
                    initializeHomePage();
                }
            },
            {
                once: true
            }
        );
    }


    /* =========================================================
       GENERAL HELPERS
       ========================================================= */

    function requestFrame(callback) {
        return window.requestAnimationFrame(callback);
    }

    function clamp(value, minimum, maximum) {
        return Math.min(
            Math.max(value, minimum),
            maximum
        );
    }

    function isElementVisible(element) {
        if (!element) {
            return false;
        }

        const rect = element.getBoundingClientRect();

        return (
            rect.bottom > 0 &&
            rect.top < window.innerHeight
        );
    }

    function setText(element, value) {
        if (element) {
            element.textContent = String(value ?? "");
        }
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


    /* =========================================================
       HERO PARALLAX
       ========================================================= */

    function initializeHeroParallax() {
        const visual = document.querySelector(
            "[data-home-hero-parallax]"
        );

        const symbol = document.querySelector(
            "[data-home-symbol]"
        );

        if (
            !visual ||
            state.reducedMotion
        ) {
            return;
        }

        const primary = visual.querySelector(
            ".home-hero__media--primary"
        );

        const secondary = visual.querySelector(
            ".home-hero__media--secondary"
        );

        const signal = visual.querySelector(
            ".home-hero__signal-card"
        );

        let pointerX = 0;
        let pointerY = 0;
        let currentX = 0;
        let currentY = 0;
        let frame = null;

        const finePointer = window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        );

        function renderPointerMotion() {
            frame = null;

            currentX += (pointerX - currentX) * 0.08;
            currentY += (pointerY - currentY) * 0.08;

            primary?.style.setProperty(
                "transform",
                `translate3d(${currentX * 7}px, ${currentY * 7}px, 0)`
            );

            secondary?.style.setProperty(
                "transform",
                `translate3d(${currentX * -10}px, ${currentY * -8}px, 0)`
            );

            symbol?.style.setProperty(
                "transform",
                `translate3d(${currentX * -14}px, ${currentY * -12}px, 0)`
            );

            signal?.style.setProperty(
                "transform",
                `translate3d(${currentX * 9}px, ${currentY * -6}px, 0)`
            );

            const unfinished =
                Math.abs(pointerX - currentX) > 0.001 ||
                Math.abs(pointerY - currentY) > 0.001;

            if (unfinished) {
                frame = requestFrame(renderPointerMotion);
            }
        }

        function schedulePointerMotion() {
            if (!frame) {
                frame = requestFrame(renderPointerMotion);
            }
        }

        function handlePointerMove(event) {
            if (!finePointer.matches) {
                return;
            }

            const rect = visual.getBoundingClientRect();

            pointerX = clamp(
                (event.clientX - rect.left) / rect.width - 0.5,
                -0.5,
                0.5
            );

            pointerY = clamp(
                (event.clientY - rect.top) / rect.height - 0.5,
                -0.5,
                0.5
            );

            schedulePointerMotion();
        }

        function resetPointerMotion() {
            pointerX = 0;
            pointerY = 0;
            schedulePointerMotion();
        }

        visual.addEventListener(
            "pointermove",
            handlePointerMove,
            {
                passive: true
            }
        );

        visual.addEventListener(
            "pointerleave",
            resetPointerMotion,
            {
                passive: true
            }
        );
    }


    /* =========================================================
       PHISHING INBOX SIMULATOR
       ========================================================= */

    function initializeInboxSimulator() {
        const root = document.querySelector(
            "[data-inbox-simulator]"
        );

        if (!root) {
            return;
        }

        const messageButtons = Array.from(
            root.querySelectorAll(
                "[data-inbox-message]"
            )
        );

        const elements = {
            panel: root.querySelector(
                "[data-inbox-email-panel]"
            ),
            subject: root.querySelector(
                "[data-inbox-subject]"
            ),
            from: root.querySelector(
                "[data-inbox-from]"
            ),
            reply: root.querySelector(
                "[data-inbox-reply]"
            ),
            attachment: root.querySelector(
                "[data-inbox-attachment]"
            ),
            body: root.querySelector(
                "[data-inbox-body]"
            ),
            linkPreview: root.querySelector(
                "[data-inbox-link-preview]"
            ),
            feedback: root.querySelector(
                "[data-inbox-feedback]"
            ),
            feedbackTitle: root.querySelector(
                "[data-inbox-feedback-title]"
            ),
            feedbackCopy: root.querySelector(
                "[data-inbox-feedback-copy]"
            ),
            warningList: root.querySelector(
                "[data-inbox-warning-list]"
            ),
            resetButton: root.querySelector(
                "[data-inbox-reset]"
            ),
            archiveButton: root.querySelector(
                '[data-inbox-demo-action="archive"]'
            ),
            answerButtons: Array.from(
                root.querySelectorAll(
                    "[data-inbox-answer]"
                )
            )
        };

        state.inbox = {
            root,
            messageButtons,
            elements,
            selectedId: "payroll",
            answered: false
        };

        messageButtons.forEach(
            (button, index) => {
                button.addEventListener(
                    "click",
                    () => {
                        selectInboxMessage(
                            button.dataset.inboxMessage,
                            {
                                focusPanel: false
                            }
                        );
                    }
                );

                button.addEventListener(
                    "keydown",
                    (event) => {
                        handleInboxKeyboard(
                            event,
                            messageButtons,
                            index
                        );
                    }
                );
            }
        );

        elements.answerButtons.forEach(
            (button) => {
                button.addEventListener(
                    "click",
                    () => {
                        answerInboxMessage(
                            button.dataset.inboxAnswer
                        );
                    }
                );
            }
        );

        elements.resetButton?.addEventListener(
            "click",
            resetInboxSimulator
        );

        elements.archiveButton?.addEventListener(
            "click",
            showArchiveExplanation
        );

        selectInboxMessage("payroll", {
            focusPanel: false
        });
    }

    function selectInboxMessage(
        messageId,
        {
            focusPanel = false
        } = {}
    ) {
        const inbox = state.inbox;
        const message = inboxMessages[messageId];

        if (!inbox || !message) {
            return;
        }

        inbox.selectedId = messageId;
        inbox.answered = false;

        inbox.messageButtons.forEach((button) => {
            const selected =
                button.dataset.inboxMessage === messageId;

            button.classList.toggle(
                "is-active",
                selected
            );

            button.setAttribute(
                "aria-selected",
                String(selected)
            );

            button.tabIndex = selected ? 0 : -1;
        });

        setText(
            inbox.elements.subject,
            message.subject
        );

        setText(
            inbox.elements.from,
            message.from
        );

        setText(
            inbox.elements.reply,
            message.replyTo
        );

        setText(
            inbox.elements.linkPreview,
            message.linkPreview
        );

        if (inbox.elements.body) {
            inbox.elements.body.innerHTML =
                message.body;
        }

        if (inbox.elements.attachment) {
            inbox.elements.attachment.hidden =
                !message.attachmentVisible;

            inbox.elements.attachment.setAttribute(
                "aria-hidden",
                String(!message.attachmentVisible)
            );

            if (message.attachmentVisible) {
                const textNode =
                    inbox.elements.attachment.lastChild;

                if (textNode) {
                    textNode.textContent =
                        ` ${message.attachment}`;
                }
            }
        }

        resetInboxAnswerButtons();
        hideInboxFeedback();

        if (focusPanel) {
            inbox.elements.panel?.focus();
        }
    }

    function answerInboxMessage(answer) {
        const inbox = state.inbox;
        const message =
            inboxMessages[inbox?.selectedId];

        if (
            !inbox ||
            !message ||
            inbox.answered
        ) {
            return;
        }

        inbox.answered = true;

        const isCorrect =
            answer === message.expectedAnswer;

        inbox.elements.answerButtons.forEach(
            (button) => {
                const selected =
                    button.dataset.inboxAnswer === answer;

                button.disabled = true;
                button.classList.toggle(
                    "is-selected",
                    selected
                );

                button.setAttribute(
                    "aria-pressed",
                    String(selected)
                );
            }
        );

        showInboxFeedback({
            title: isCorrect
                ? message.feedback.correctTitle
                : message.feedback.incorrectTitle,

            copy: isCorrect
                ? message.feedback.correctCopy
                : message.feedback.incorrectCopy,

            warningSigns:
                message.feedback.warningSigns
        });
    }

    function showInboxFeedback({
        title,
        copy,
        warningSigns = []
    }) {
        const elements =
            state.inbox?.elements;

        if (!elements?.feedback) {
            return;
        }

        setText(
            elements.feedbackTitle,
            title
        );

        setText(
            elements.feedbackCopy,
            copy
        );

        if (elements.warningList) {
            elements.warningList.innerHTML =
                warningSigns
                    .map((item) => {
                        return `<li>${escapeHTML(item)}</li>`;
                    })
                    .join("");
        }

        elements.feedback.hidden = false;

        requestFrame(() => {
            elements.feedback.focus();
        });
    }

    function hideInboxFeedback() {
        const feedback =
            state.inbox?.elements.feedback;

        if (!feedback) {
            return;
        }

        feedback.hidden = true;
    }

    function resetInboxAnswerButtons() {
        state.inbox?.elements.answerButtons.forEach(
            (button) => {
                button.disabled = false;

                button.classList.remove(
                    "is-selected",
                    "is-correct",
                    "is-incorrect"
                );

                button.setAttribute(
                    "aria-pressed",
                    "false"
                );
            }
        );
    }

    function resetInboxSimulator() {
        selectInboxMessage("payroll", {
            focusPanel: false
        });

        const firstButton =
            state.inbox?.messageButtons.find(
                (button) =>
                    button.dataset.inboxMessage ===
                    "payroll"
            );

        firstButton?.focus();
    }

    function showArchiveExplanation() {
        const inbox = state.inbox;

        if (!inbox) {
            return;
        }

        showInboxFeedback({
            title: "This is a fictional training inbox",
            copy:
                "The archive control is included to make the exercise feel familiar. No real email is stored, moved or deleted.",
            warningSigns: [
                "Use the organization’s approved reporting process for real suspicious messages.",
                "Do not rely on deleting or archiving a message as the only response."
            ]
        });
    }

    function handleInboxKeyboard(
        event,
        buttons,
        currentIndex
    ) {
        let nextIndex = null;

        switch (event.key) {
            case "ArrowDown":
            case "ArrowRight":
                nextIndex =
                    (currentIndex + 1) %
                    buttons.length;
                break;

            case "ArrowUp":
            case "ArrowLeft":
                nextIndex =
                    (
                        currentIndex -
                        1 +
                        buttons.length
                    ) % buttons.length;
                break;

            case "Home":
                nextIndex = 0;
                break;

            case "End":
                nextIndex =
                    buttons.length - 1;
                break;

            default:
                return;
        }

        event.preventDefault();

        const nextButton =
            buttons[nextIndex];

        nextButton?.focus();

        selectInboxMessage(
            nextButton?.dataset.inboxMessage,
            {
                focusPanel: false
            }
        );
    }


    /* =========================================================
       TOPIC SHOWCASE
       ========================================================= */

    function initializeTopicShowcase() {
        const root = document.querySelector(
            "[data-topic-showcase]"
        );

        if (!root) {
            return;
        }

        const panels = Array.from(
            root.querySelectorAll(
                "[data-showcase-panel]"
            )
        );

        function activatePanel(activePanel) {
            panels.forEach((panel) => {
                panel.classList.toggle(
                    "is-active",
                    panel === activePanel
                );
            });
        }

        panels.forEach((panel) => {
            panel.addEventListener(
                "pointerenter",
                () => activatePanel(panel)
            );

            panel.addEventListener(
                "focus",
                () => activatePanel(panel)
            );
        });

        root.addEventListener(
            "pointerleave",
            () => {
                activatePanel(
                    panels[0]
                );
            }
        );
    }


    /* =========================================================
       STICKY TRAINING JOURNEY
       ========================================================= */

    function initializeTrainingJourney() {
        const root = document.querySelector(
            "[data-training-journey]"
        );

        if (!root) {
            return;
        }

        const steps = Array.from(
            root.querySelectorAll(
                "[data-journey-step]"
            )
        );

        if (
            !steps.length ||
            !("IntersectionObserver" in window)
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (first, second) =>
                            second.intersectionRatio -
                            first.intersectionRatio
                    );

                if (!visibleEntries.length) {
                    return;
                }

                const activeStep =
                    visibleEntries[0].target;

                steps.forEach((step) => {
                    step.classList.toggle(
                        "is-active",
                        step === activeStep
                    );
                });
            },
            {
                root: null,
                rootMargin: "-28% 0px -46% 0px",
                threshold: [
                    0.15,
                    0.35,
                    0.55,
                    0.75
                ]
            }
        );

        steps.forEach((step) => {
            observer.observe(step);
        });
    }


    /* =========================================================
       WARNING-SIGN SWITCHER
       ========================================================= */

    function initializeWarningSigns() {
        const root = document.querySelector(
            "[data-warning-switcher]"
        );

        if (!root) {
            return;
        }

        const buttons = Array.from(
            root.querySelectorAll(
                "[data-warning-id]"
            )
        );

        const targets = Array.from(
            root.querySelectorAll(
                "[data-warning-target]"
            )
        );

        const label = root.querySelector(
            "[data-warning-label]"
        );

        const title = root.querySelector(
            "[data-warning-title]"
        );

        const copy = root.querySelector(
            "[data-warning-copy]"
        );

        function activateWarning(
            warningId,
            {
                moveFocus = false
            } = {}
        ) {
            const warning =
                warningSigns[warningId];

            if (!warning) {
                return;
            }

            buttons.forEach((button) => {
                const active =
                    button.dataset.warningId ===
                    warningId;

                button.classList.toggle(
                    "is-active",
                    active
                );

                button.setAttribute(
                    "aria-selected",
                    String(active)
                );

                button.tabIndex = active ? 0 : -1;

                if (active && moveFocus) {
                    button.focus();
                }
            });

            targets.forEach((target) => {
                target.classList.toggle(
                    "is-highlighted",
                    target.dataset.warningTarget ===
                    warningId
                );
            });

            setText(label, warning.label);
            setText(title, warning.title);
            setText(copy, warning.copy);
        }

        buttons.forEach(
            (button, index) => {
                button.addEventListener(
                    "click",
                    () => {
                        activateWarning(
                            button.dataset.warningId
                        );
                    }
                );

                button.addEventListener(
                    "pointerenter",
                    () => {
                        if (
                            window.matchMedia(
                                "(hover: hover)"
                            ).matches
                        ) {
                            activateWarning(
                                button.dataset.warningId
                            );
                        }
                    }
                );

                button.addEventListener(
                    "focus",
                    () => {
                        activateWarning(
                            button.dataset.warningId
                        );
                    }
                );

                button.addEventListener(
                    "keydown",
                    (event) => {
                        let nextIndex = null;

                        switch (event.key) {
                            case "ArrowDown":
                            case "ArrowRight":
                                nextIndex =
                                    (index + 1) %
                                    buttons.length;
                                break;

                            case "ArrowUp":
                            case "ArrowLeft":
                                nextIndex =
                                    (
                                        index -
                                        1 +
                                        buttons.length
                                    ) % buttons.length;
                                break;

                            case "Home":
                                nextIndex = 0;
                                break;

                            case "End":
                                nextIndex =
                                    buttons.length - 1;
                                break;

                            default:
                                return;
                        }

                        event.preventDefault();

                        activateWarning(
                            buttons[nextIndex]
                                .dataset.warningId,
                            {
                                moveFocus: true
                            }
                        );
                    }
                );
            }
        );

        activateWarning("urgency");
    }


    /* =========================================================
       ONBOARDING TIMELINE
       ========================================================= */

    function initializeOnboardingTimeline() {
        const root = document.querySelector(
            "[data-onboarding-timeline]"
        );

        if (!root) {
            return;
        }

        const stages = Array.from(
            root.querySelectorAll(
                "[data-onboarding-stage]"
            )
        );

        const progress = root.querySelector(
            "[data-onboarding-progress]"
        );

        if (!stages.length) {
            return;
        }

        let activeIndex = 0;

        function updateTimeline(index) {
            activeIndex = clamp(
                index,
                0,
                stages.length - 1
            );

            stages.forEach(
                (stage, stageIndex) => {
                    stage.classList.toggle(
                        "is-active",
                        stageIndex <= activeIndex
                    );
                }
            );

            const percentage =
                (
                    (activeIndex + 1) /
                    stages.length
                ) * 100;

            updateTimelineProgress(
                progress,
                percentage
            );
        }

        if ("IntersectionObserver" in window) {
            const observer =
                new IntersectionObserver(
                    (entries) => {
                        const visible = entries
                            .filter(
                                (entry) =>
                                    entry.isIntersecting
                            )
                            .sort(
                                (first, second) =>
                                    second.intersectionRatio -
                                    first.intersectionRatio
                            );

                        if (!visible.length) {
                            return;
                        }

                        const index = stages.indexOf(
                            visible[0].target
                        );

                        if (index >= 0) {
                            updateTimeline(index);
                        }
                    },
                    {
                        root: null,
                        rootMargin:
                            "-22% 0px -48% 0px",
                        threshold: [
                            0.2,
                            0.45,
                            0.7
                        ]
                    }
                );

            stages.forEach((stage) => {
                observer.observe(stage);
            });
        }

        updateTimeline(0);

        window.addEventListener(
            "resize",
            () => {
                if (state.resizeFrame) {
                    cancelAnimationFrame(
                        state.resizeFrame
                    );
                }

                state.resizeFrame = requestFrame(
                    () => {
                        state.resizeFrame = null;

                        updateTimelineProgress(
                            progress,
                            (
                                (activeIndex + 1) /
                                stages.length
                            ) * 100
                        );
                    }
                );
            },
            {
                passive: true
            }
        );
    }

    function updateTimelineProgress(
        element,
        percentage
    ) {
        if (!element) {
            return;
        }

        const mobile =
            window.matchMedia(
                "(max-width: 768px)"
            ).matches;

        if (mobile) {
            element.style.width = "2px";
            element.style.height =
                `${percentage}%`;
        } else {
            element.style.width =
                `${percentage}%`;

            element.style.height = "2px";
        }
    }


    /* =========================================================
       HOMEPAGE QUIZ
       ========================================================= */

    function initializeQuiz() {
        const root = document.querySelector(
            "[data-home-quiz]"
        );

        if (!root) {
            return;
        }

        const questions = Array.from(
            root.querySelectorAll(
                "[data-quiz-question]"
            )
        );

        if (!questions.length) {
            return;
        }

        state.quiz = {
            root,
            questions,
            currentIndex: 0,
            selectedAnswers:
                new Array(questions.length).fill(null),
            correctAnswers: 0,

            counter: root.querySelector(
                "[data-quiz-counter]"
            ),

            progress: root.querySelector(
                "[data-quiz-progress]"
            ),

            progressBar: root.querySelector(
                "[data-quiz-progress] span"
            ),

            feedback: root.querySelector(
                "[data-quiz-feedback]"
            ),

            feedbackTitle: root.querySelector(
                "[data-quiz-feedback-title]"
            ),

            feedbackCopy: root.querySelector(
                "[data-quiz-feedback-copy]"
            ),

            nextButton: root.querySelector(
                "[data-quiz-next]"
            ),

            result: root.querySelector(
                "[data-quiz-result]"
            ),

            resultCopy: root.querySelector(
                "[data-quiz-result-copy]"
            ),

            restartButton: root.querySelector(
                "[data-quiz-restart]"
            ),

            questionContainer: root.querySelector(
                "[data-quiz-questions]"
            )
        };

        questions.forEach(
            (question, questionIndex) => {
                const answerButtons = Array.from(
                    question.querySelectorAll(
                        "[data-quiz-answer]"
                    )
                );

                answerButtons.forEach((button) => {
                    button.addEventListener(
                        "click",
                        () => {
                            answerQuizQuestion(
                                questionIndex,
                                button
                            );
                        }
                    );
                });
            }
        );

        state.quiz.nextButton?.addEventListener(
            "click",
            showNextQuizQuestion
        );

        state.quiz.restartButton?.addEventListener(
            "click",
            resetQuiz
        );

        showQuizQuestion(0);
    }

    function showQuizQuestion(index) {
        const quiz = state.quiz;

        if (!quiz) {
            return;
        }

        quiz.currentIndex = clamp(
            index,
            0,
            quiz.questions.length - 1
        );

        quiz.questions.forEach(
            (question, questionIndex) => {
                const active =
                    questionIndex ===
                    quiz.currentIndex;

                question.hidden = !active;
                question.classList.toggle(
                    "is-active",
                    active
                );
            }
        );

        const questionNumber =
            quiz.currentIndex + 1;

        setText(
            quiz.counter,
            `Question ${questionNumber} of ${quiz.questions.length}`
        );

        const progressPercentage =
            (
                questionNumber /
                quiz.questions.length
            ) * 100;

        if (quiz.progressBar) {
            quiz.progressBar.style.width =
                `${progressPercentage}%`;
        }

        quiz.progress?.setAttribute(
            "aria-valuenow",
            String(questionNumber)
        );

        if (quiz.feedback) {
            quiz.feedback.hidden = true;
        }

        if (quiz.nextButton) {
            quiz.nextButton.disabled =
                quiz.selectedAnswers[
                quiz.currentIndex
                ] === null;

            const isLast =
                quiz.currentIndex ===
                quiz.questions.length - 1;

            const label =
                quiz.nextButton.querySelector(
                    "span"
                );

            setText(
                label,
                isLast
                    ? "View Learning Feedback"
                    : "Next Question"
            );
        }

        quiz.result.hidden = true;
        quiz.questionContainer.hidden = false;

        const activeQuestion =
            quiz.questions[
            quiz.currentIndex
            ];

        const firstAnswer =
            activeQuestion.querySelector(
                "[data-quiz-answer]"
            );

        requestFrame(() => {
            focusWithoutScroll(firstAnswer);
        });
    }

    function answerQuizQuestion(
        questionIndex,
        selectedButton
    ) {
        const quiz = state.quiz;

        if (
            !quiz ||
            quiz.selectedAnswers[
            questionIndex
            ] !== null
        ) {
            return;
        }

        const question =
            quiz.questions[questionIndex];

        const questionId =
            question.dataset.questionId;

        const isCorrect =
            selectedButton.dataset.correct ===
            "true";

        quiz.selectedAnswers[questionIndex] = {
            value:
                selectedButton.dataset.quizAnswer,
            correct: isCorrect
        };

        if (isCorrect) {
            quiz.correctAnswers += 1;
        }

        const answerButtons = Array.from(
            question.querySelectorAll(
                "[data-quiz-answer]"
            )
        );

        answerButtons.forEach((button) => {
            const selected =
                button === selectedButton;

            button.disabled = true;

            button.classList.toggle(
                "is-selected",
                selected
            );

            if (selected) {
                button.classList.add(
                    isCorrect
                        ? "is-correct"
                        : "is-incorrect"
                );
            }
        });

        const feedback =
            quizFeedback[questionId]?.[
            isCorrect
                ? "correct"
                : "incorrect"
            ];

        if (feedback) {
            setText(
                quiz.feedbackTitle,
                feedback.title
            );

            setText(
                quiz.feedbackCopy,
                feedback.copy
            );
        }

        quiz.feedback.hidden = false;
        quiz.nextButton.disabled = false;

        requestFrame(() => {
            quiz.feedback.focus();
        });
    }

    function showNextQuizQuestion() {
        const quiz = state.quiz;

        if (!quiz) {
            return;
        }

        if (
            quiz.selectedAnswers[
            quiz.currentIndex
            ] === null
        ) {
            return;
        }

        const isLast =
            quiz.currentIndex ===
            quiz.questions.length - 1;

        if (isLast) {
            showQuizResult();
            return;
        }

        showQuizQuestion(
            quiz.currentIndex + 1
        );
    }

    function showQuizResult() {
        const quiz = state.quiz;

        if (!quiz) {
            return;
        }

        quiz.questionContainer.hidden = true;
        quiz.feedback.hidden = true;
        quiz.nextButton.closest(
            ".home-quiz__navigation"
        ).hidden = true;

        quiz.result.hidden = false;

        const feedback =
            getQuizResultCopy(
                quiz.correctAnswers,
                quiz.questions.length
            );

        setText(
            quiz.resultCopy,
            feedback
        );

        requestFrame(() => {
            quiz.result.focus();
        });
    }

    function getQuizResultCopy(
        correct,
        total
    ) {
        if (correct === total) {
            return (
                "You identified the careful response in each fictional " +
                "scenario. Continue reviewing the explanations and connect " +
                "them with your organization’s own procedures."
            );
        }

        if (correct >= 2) {
            return (
                "You recognized several useful verification habits. Review " +
                "the explanations again and explore the topic pages for the " +
                "situations that required more attention."
            );
        }

        return (
            "This activity is designed for learning rather than certification. " +
            "Review each explanation and use the topic pages to practise the " +
            "decision process again."
        );
    }

    function resetQuiz() {
        const quiz = state.quiz;

        if (!quiz) {
            return;
        }

        quiz.currentIndex = 0;
        quiz.correctAnswers = 0;
        quiz.selectedAnswers =
            new Array(
                quiz.questions.length
            ).fill(null);

        quiz.questions.forEach((question) => {
            question
                .querySelectorAll(
                    "[data-quiz-answer]"
                )
                .forEach((button) => {
                    button.disabled = false;

                    button.classList.remove(
                        "is-selected",
                        "is-correct",
                        "is-incorrect"
                    );
                });
        });

        const navigation =
            quiz.nextButton.closest(
                ".home-quiz__navigation"
            );

        if (navigation) {
            navigation.hidden = false;
        }

        quiz.result.hidden = true;

        showQuizQuestion(0);
    }


    /* =========================================================
       CORPORATE FORMATS SWIPER
       ========================================================= */

    function initializeFormatsSwiper() {
        const element = document.querySelector(
            "[data-formats-swiper]"
        );

        if (
            !element ||
            element.dataset.swiperInitialized ===
            "true"
        ) {
            return;
        }

        if (
            !window.Swiper ||
            typeof window.Swiper !== "function"
        ) {
            element.classList.add(
                "home-formats__swiper--fallback"
            );

            return;
        }

        const previous = document.querySelector(
            ".home-formats__previous"
        );

        const next = document.querySelector(
            ".home-formats__next"
        );

        const pagination = document.querySelector(
            ".home-formats__pagination"
        );

        try {
            state.formatsSwiper =
                new window.Swiper(element, {
                    slidesPerView: 1.08,
                    spaceBetween: 16,
                    speed: state.reducedMotion
                        ? 0
                        : 620,
                    grabCursor: true,
                    watchOverflow: true,
                    loop: false,
                    rewind: false,
                    autoHeight: false,
                    observer: true,
                    observeParents: true,

                    keyboard: {
                        enabled: true,
                        onlyInViewport: true
                    },

                    a11y: {
                        enabled: true,
                        prevSlideMessage:
                            "Show previous training format",
                        nextSlideMessage:
                            "Show next training format",
                        firstSlideMessage:
                            "This is the first training format",
                        lastSlideMessage:
                            "This is the last training format"
                    },

                    navigation: {
                        prevEl: previous,
                        nextEl: next
                    },

                    pagination: {
                        el: pagination,
                        clickable: true
                    },

                    breakpoints: {
                        560: {
                            slidesPerView: 1.45,
                            spaceBetween: 18
                        },

                        768: {
                            slidesPerView: 2.15,
                            spaceBetween: 20
                        },

                        1024: {
                            slidesPerView: 2.7,
                            spaceBetween: 22
                        },

                        1280: {
                            slidesPerView: 3.35,
                            spaceBetween: 24
                        }
                    },

                    on: {
                        init() {
                            element.dataset.swiperInitialized =
                                "true";
                        }
                    }
                });

            element.dataset.swiperInitialized =
                "true";

            window.SecureHabit?.refreshAOS?.();
        } catch (error) {
            element.classList.add(
                "home-formats__swiper--fallback"
            );

            console.warn(
                "SecureHabit could not initialize the training formats slider.",
                error
            );
        }
    }


    /* =========================================================
       FINAL CTA PARALLAX
       ========================================================= */

    function initializeFinalParallax() {
        const section = document.querySelector(
            "[data-parallax-section]"
        );

        const background =
            section?.querySelector(
                ".home-final-cta__background"
            );

        if (
            !section ||
            !background ||
            state.reducedMotion
        ) {
            return;
        }

        let frame = null;

        function update() {
            frame = null;

            if (!isElementVisible(section)) {
                return;
            }

            const rect =
                section.getBoundingClientRect();

            const viewportCenter =
                window.innerHeight / 2;

            const sectionCenter =
                rect.top + rect.height / 2;

            const distance =
                sectionCenter - viewportCenter;

            const offset = clamp(
                distance * -0.055,
                -38,
                38
            );

            background.style.transform =
                `translate3d(0, ${offset}px, 0) scale(1.08)`;
        }

        function scheduleUpdate() {
            if (frame) {
                return;
            }

            frame = requestFrame(update);
        }

        update();

        window.addEventListener(
            "scroll",
            scheduleUpdate,
            {
                passive: true
            }
        );

        window.addEventListener(
            "resize",
            scheduleUpdate,
            {
                passive: true
            }
        );
    }


    /* =========================================================
       SAFE INTERNAL HTML ESCAPING
       ========================================================= */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();