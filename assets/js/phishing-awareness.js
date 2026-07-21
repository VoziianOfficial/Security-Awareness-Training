/* =========================================================
   SECUREHABIT — PHISHING AWARENESS PAGE
   File: assets/js/phishing-awareness.js
   ========================================================= */

(function () {
    "use strict";

    const PAGE_ID = "phishing-awareness";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,
        reviewIndex: 0,
        scenarioIndex: 0,
        processObserver: null,
        sectionObserver: null,
        heroFrame: null,
        parallaxFrame: null,
        resizeFrame: null,
        cleanupCallbacks: []
    };


    /* =========================================================
       1. WARNING-SIGN CONTENT
       ========================================================= */

    const warningSignContent = {
        sender: {
            icon: "at-sign",
            title: "Sender address",
            value:
                "finance-director@executive-request.example",
            copy:
                "The display name says “Finance Director,” but the complete address uses an unfamiliar fictional domain.",
            guidance:
                "Compare the full address with expected company domains and verify the request through a known contact method."
        },

        "reply-to": {
            icon: "reply",
            title: "Reply-to address",
            value:
                "private-instruction@outside-mail.example",
            copy:
                "Replies are directed to a different address and another fictional domain than the visible sender address.",
            guidance:
                "An unexpected reply-to difference should be reviewed before responding. Use an approved separate channel to confirm the request."
        },

        authority: {
            icon: "briefcase-business",
            title: "Authority claim",
            value:
                "“I am in a confidential meeting and cannot take calls.”",
            copy:
                "The message claims to come from a senior employee and uses authority to discourage questions or normal review.",
            guidance:
                "Senior titles do not replace verification. Follow the normal approval process even when a request appears to come from leadership."
        },

        secrecy: {
            icon: "message-circle-off",
            title: "Secrecy request",
            value:
                "“Do not discuss this request with anyone else.”",
            copy:
                "The recipient is asked to keep the request secret, reducing the chance that another person will question or verify it.",
            guidance:
                "Be cautious when secrecy is combined with unusual financial, account or information requests. Use the approved escalation route."
        },

        link: {
            icon: "link-2",
            title: "Link destination",
            value:
                "training.invalid/payment-update",
            copy:
                "The button describes a secure payment document, but its fictional destination is unrelated to an approved company service.",
            guidance:
                "Do not open the embedded link. Access the normal company system independently through a saved bookmark or approved portal."
        },

        attachment: {
            icon: "file-archive",
            title: "Unexpected attachment",
            value:
                "Updated-Bank-Details.zip",
            copy:
                "The message includes an unexpected compressed file that supposedly contains sensitive supplier payment information.",
            guidance:
                "Do not open the file until the sender, purpose and file type have been independently confirmed through the approved process."
        },

        urgency: {
            icon: "timer-alert",
            title: "Urgency and pressure",
            value:
                "“Complete this within ten minutes.”",
            copy:
                "The short deadline is designed to reduce review time and encourage the recipient to act before asking questions.",
            guidance:
                "Urgency should not replace verification. Pause, review the details and use the normal approval route."
        }
    };


    /* =========================================================
       2. PAGE INITIALIZATION
       ========================================================= */

    function initializePhishingAwarenessPage() {
        if (state.initialized) {
            return;
        }

        if (document.body?.dataset.page !== PAGE_ID) {
            return;
        }

        state.initialized = true;

        state.motionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        state.reducedMotion =
            state.motionQuery.matches;

        initializeMotionPreference();
        initializeMessageReview();
        initializeScenarioSlider();
        initializeResponseProcess();
        initializeChecklist();
        initializePhishingFAQ();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        window.SecureHabit?.refreshIcons?.();
        window.SecureHabit?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:phishing-awareness-ready",
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
        initializePhishingAwarenessPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializePhishingAwarenessPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializePhishingAwarenessPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyPhishingAwarenessPage,
        {
            once: true
        }
    );


    /* =========================================================
       3. GENERAL HELPERS
       ========================================================= */

    function clamp(value, minimum, maximum) {
        return Math.min(
            Math.max(value, minimum),
            maximum
        );
    }

    function requestFrame(callback) {
        return window.requestAnimationFrame(
            callback
        );
    }

    function setText(element, value) {
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

    function createUniqueId(prefix, index) {
        return `${prefix}-${index + 1}`;
    }

    function registerCleanup(callback) {
        if (typeof callback === "function") {
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

    function updateLucideIcon(
        element,
        iconName
    ) {
        if (!element || !iconName) {
            return;
        }

        element.setAttribute(
            "data-lucide",
            iconName
        );

        window.SecureHabit?.refreshIcons?.();
    }


    /* =========================================================
       4. MOTION PREFERENCE
       ========================================================= */

    function initializeMotionPreference() {
        if (!state.motionQuery) {
            return;
        }

        const handleMotionChange = function (
            event
        ) {
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
                .addEventListener === "function"
        ) {
            state.motionQuery.addEventListener(
                "change",
                handleMotionChange
            );

            registerCleanup(function () {
                state.motionQuery.removeEventListener(
                    "change",
                    handleMotionChange
                );
            });

            return;
        }

        if (
            typeof state.motionQuery
                .addListener === "function"
        ) {
            state.motionQuery.addListener(
                handleMotionChange
            );

            registerCleanup(function () {
                state.motionQuery.removeListener(
                    handleMotionChange
                );
            });
        }
    }

    function resetMotionStyles() {
        const message =
            document.querySelector(
                ".phishing-hero__message"
            );

        const network =
            document.querySelector(
                ".phishing-hero__network"
            );

        const mark =
            document.querySelector(
                ".phishing-hero__mark"
            );

        const finalBackground =
            document.querySelector(
                ".phishing-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".phishing-final-cta__geometry"
            );

        if (message) {
            message.style.transform = "";
        }

        if (network) {
            network.style.transform = "";
        }

        if (mark) {
            mark.style.transform = "";
        }

        if (finalBackground) {
            finalBackground.style.transform = "";
        }

        if (finalGeometry) {
            finalGeometry.style.transform = "";
        }

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
       5. INTERACTIVE MESSAGE REVIEW
       ========================================================= */

    function initializeMessageReview() {
        const root =
            document.querySelector(
                "[data-phishing-review]"
            );

        if (
            !root ||
            root.dataset.initialized ===
            "true"
        ) {
            return;
        }

        root.dataset.initialized = "true";

        const markers = Array.from(
            root.querySelectorAll(
                "[data-phishing-marker]"
            )
        );

        const explanation =
            root.querySelector(
                "[data-phishing-explanation]"
            );

        if (!markers.length || !explanation) {
            return;
        }

        const elements = {
            step:
                explanation.querySelector(
                    "[data-phishing-step]"
                ),

            icon:
                explanation.querySelector(
                    "[data-phishing-icon]"
                ),

            title:
                explanation.querySelector(
                    "[data-phishing-title]"
                ),

            copy:
                explanation.querySelector(
                    "[data-phishing-copy]"
                ),

            value:
                explanation.querySelector(
                    "[data-phishing-value]"
                ),

            guidance:
                explanation.querySelector(
                    "[data-phishing-guidance]"
                ),

            previous:
                explanation.querySelector(
                    "[data-phishing-previous]"
                ),

            next:
                explanation.querySelector(
                    "[data-phishing-next]"
                )
        };

        function activateMarker(
            index,
            {
                focusMarker = false,
                focusExplanation = false
            } = {}
        ) {
            const safeIndex =
                (
                    index +
                    markers.length
                ) % markers.length;

            const marker =
                markers[safeIndex];

            const markerId =
                marker.dataset
                    .phishingMarker;

            const content =
                warningSignContent[
                markerId
                ];

            if (!content) {
                return;
            }

            state.reviewIndex =
                safeIndex;

            markers.forEach(function (
                item,
                markerIndex
            ) {
                const active =
                    markerIndex === safeIndex;

                item.classList.toggle(
                    "is-active",
                    active
                );

                item.setAttribute(
                    "aria-pressed",
                    String(active)
                );

                item.tabIndex =
                    active ? 0 : -1;
            });

            setText(
                elements.step,
                `Warning sign ${safeIndex + 1} ` +
                `of ${markers.length}`
            );

            setText(
                elements.title,
                content.title
            );

            setText(
                elements.copy,
                content.copy
            );

            setText(
                elements.value,
                content.value
            );

            setText(
                elements.guidance,
                content.guidance
            );

            updateLucideIcon(
                elements.icon,
                content.icon
            );

            explanation.dataset.activeWarning =
                markerId;

            if (focusMarker) {
                focusWithoutScroll(marker);
            }

            if (focusExplanation) {
                requestFrame(function () {
                    focusWithoutScroll(
                        explanation
                    );
                });
            }

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:phishing-warning-change",
                    {
                        detail: {
                            index: safeIndex,
                            markerId,
                            content
                        }
                    }
                )
            );
        }

        markers.forEach(function (
            marker,
            index
        ) {
            addEvent(
                marker,
                "click",
                function () {
                    activateMarker(index);
                }
            );

            addEvent(
                marker,
                "pointerenter",
                function () {
                    const supportsHover =
                        window.matchMedia(
                            "(hover: hover)"
                        ).matches;

                    if (supportsHover) {
                        activateMarker(index);
                    }
                }
            );

            addEvent(
                marker,
                "focus",
                function () {
                    activateMarker(index);
                }
            );

            addEvent(
                marker,
                "keydown",
                function (event) {
                    let nextIndex = null;

                    switch (event.key) {
                        case "ArrowRight":
                        case "ArrowDown":
                            nextIndex =
                                (index + 1) %
                                markers.length;
                            break;

                        case "ArrowLeft":
                        case "ArrowUp":
                            nextIndex =
                                (
                                    index -
                                    1 +
                                    markers.length
                                ) % markers.length;
                            break;

                        case "Home":
                            nextIndex = 0;
                            break;

                        case "End":
                            nextIndex =
                                markers.length - 1;
                            break;

                        default:
                            return;
                    }

                    event.preventDefault();

                    activateMarker(
                        nextIndex,
                        {
                            focusMarker: true
                        }
                    );
                }
            );
        });

        addEvent(
            elements.previous,
            "click",
            function () {
                activateMarker(
                    state.reviewIndex - 1,
                    {
                        focusExplanation: true
                    }
                );
            }
        );

        addEvent(
            elements.next,
            "click",
            function () {
                activateMarker(
                    state.reviewIndex + 1,
                    {
                        focusExplanation: true
                    }
                );
            }
        );

        activateMarker(0);
    }


    /* =========================================================
       6. PHISHING SCENARIO SLIDER
       ========================================================= */

    function initializeScenarioSlider() {
        const slider =
            document.querySelector(
                "[data-phishing-scenarios]"
            );

        if (
            !slider ||
            slider.dataset.initialized ===
            "true"
        ) {
            return;
        }

        slider.dataset.initialized = "true";

        const slides = Array.from(
            slider.querySelectorAll(
                "[data-phishing-scenario-slide]"
            )
        );

        const paginationButtons =
            Array.from(
                slider.querySelectorAll(
                    "[data-phishing-scenario-index]"
                )
            );

        const previousButton =
            document.querySelector(
                "[data-phishing-scenario-previous]"
            );

        const nextButton =
            document.querySelector(
                "[data-phishing-scenario-next]"
            );

        const status =
            slider.querySelector(
                "[data-phishing-scenario-status]"
            );

        if (!slides.length) {
            return;
        }

        let touchStartX = null;
        let touchStartY = null;

        function showScenario(
            index,
            {
                focusPagination = false
            } = {}
        ) {
            const safeIndex =
                (
                    index +
                    slides.length
                ) % slides.length;

            state.scenarioIndex =
                safeIndex;

            slides.forEach(function (
                slide,
                slideIndex
            ) {
                const active =
                    slideIndex === safeIndex;

                slide.hidden = !active;

                slide.classList.toggle(
                    "is-active",
                    active
                );

                slide.setAttribute(
                    "aria-hidden",
                    String(!active)
                );
            });

            paginationButtons.forEach(
                function (button, buttonIndex) {
                    const active =
                        buttonIndex === safeIndex;

                    button.classList.toggle(
                        "is-active",
                        active
                    );

                    button.setAttribute(
                        "aria-selected",
                        String(active)
                    );

                    button.tabIndex =
                        active ? 0 : -1;
                }
            );

            const activeSlide =
                slides[safeIndex];

            const title =
                activeSlide.dataset
                    .scenarioTitle ||
                `Scenario ${safeIndex + 1}`;

            setText(
                status,
                `Showing scenario ` +
                `${safeIndex + 1} of ` +
                `${slides.length}: ${title}.`
            );

            slider.dataset.activeScenario =
                String(safeIndex + 1);

            if (focusPagination) {
                focusWithoutScroll(
                    paginationButtons[safeIndex]
                );
            }

            window.SecureHabit?.refreshAOS?.();

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:phishing-scenario-change",
                    {
                        detail: {
                            index: safeIndex,
                            slide: activeSlide,
                            title
                        }
                    }
                )
            );
        }

        paginationButtons.forEach(function (
            button,
            index
        ) {
            addEvent(
                button,
                "click",
                function () {
                    showScenario(index);
                }
            );

            addEvent(
                button,
                "keydown",
                function (event) {
                    let nextIndex = null;

                    switch (event.key) {
                        case "ArrowRight":
                        case "ArrowDown":
                            nextIndex =
                                (index + 1) %
                                slides.length;
                            break;

                        case "ArrowLeft":
                        case "ArrowUp":
                            nextIndex =
                                (
                                    index -
                                    1 +
                                    slides.length
                                ) % slides.length;
                            break;

                        case "Home":
                            nextIndex = 0;
                            break;

                        case "End":
                            nextIndex =
                                slides.length - 1;
                            break;

                        default:
                            return;
                    }

                    event.preventDefault();

                    showScenario(
                        nextIndex,
                        {
                            focusPagination: true
                        }
                    );
                }
            );
        });

        addEvent(
            previousButton,
            "click",
            function () {
                showScenario(
                    state.scenarioIndex - 1
                );
            }
        );

        addEvent(
            nextButton,
            "click",
            function () {
                showScenario(
                    state.scenarioIndex + 1
                );
            }
        );

        addEvent(
            slider,
            "touchstart",
            function (event) {
                const touch =
                    event.touches[0];

                touchStartX =
                    touch?.clientX ?? null;

                touchStartY =
                    touch?.clientY ?? null;
            },
            {
                passive: true
            }
        );

        addEvent(
            slider,
            "touchend",
            function (event) {
                if (
                    touchStartX === null ||
                    touchStartY === null
                ) {
                    return;
                }

                const touch =
                    event.changedTouches[0];

                const endX =
                    touch?.clientX ??
                    touchStartX;

                const endY =
                    touch?.clientY ??
                    touchStartY;

                const distanceX =
                    endX - touchStartX;

                const distanceY =
                    endY - touchStartY;

                touchStartX = null;
                touchStartY = null;

                if (
                    Math.abs(distanceX) < 48 ||
                    Math.abs(distanceX) <=
                    Math.abs(distanceY)
                ) {
                    return;
                }

                if (distanceX < 0) {
                    showScenario(
                        state.scenarioIndex + 1
                    );
                } else {
                    showScenario(
                        state.scenarioIndex - 1
                    );
                }
            },
            {
                passive: true
            }
        );

        showScenario(0);
    }


    /* =========================================================
       7. RESPONSE PROCESS
       ========================================================= */

    function initializeResponseProcess() {
        const root =
            document.querySelector(
                "[data-phishing-response-process]"
            );

        if (!root) {
            return;
        }

        const steps = Array.from(
            root.querySelectorAll(
                "[data-phishing-response-step]"
            )
        );

        if (!steps.length) {
            return;
        }

        steps.forEach(function (
            step,
            index
        ) {
            step.dataset.responseIndex =
                String(index);

            step.setAttribute(
                "aria-current",
                index === 0
                    ? "step"
                    : "false"
            );
        });

        setActiveResponseStep(
            root,
            steps,
            0
        );

        if (
            !("IntersectionObserver" in window)
        ) {
            initializeResponseFallback(
                root,
                steps
            );

            return;
        }

        state.processObserver =
            new IntersectionObserver(
                function (entries) {
                    const visibleEntries =
                        entries
                            .filter(function (entry) {
                                return entry.isIntersecting;
                            })
                            .sort(function (
                                first,
                                second
                            ) {
                                return (
                                    second.intersectionRatio -
                                    first.intersectionRatio
                                );
                            });

                    if (!visibleEntries.length) {
                        return;
                    }

                    const activeStep =
                        visibleEntries[0].target;

                    const activeIndex =
                        steps.indexOf(activeStep);

                    if (activeIndex < 0) {
                        return;
                    }

                    setActiveResponseStep(
                        root,
                        steps,
                        activeIndex
                    );
                },
                {
                    root: null,
                    rootMargin:
                        "-23% 0px -46% 0px",
                    threshold: [
                        0.1,
                        0.25,
                        0.45,
                        0.65,
                        0.82
                    ]
                }
            );

        steps.forEach(function (step) {
            state.processObserver.observe(
                step
            );
        });
    }

    function setActiveResponseStep(
        root,
        steps,
        activeIndex
    ) {
        const safeIndex = clamp(
            activeIndex,
            0,
            steps.length - 1
        );

        steps.forEach(function (
            step,
            index
        ) {
            const active =
                index === safeIndex;

            const complete =
                index < safeIndex;

            step.classList.toggle(
                "is-active",
                active
            );

            step.classList.toggle(
                "is-complete",
                complete
            );

            step.setAttribute(
                "aria-current",
                active
                    ? "step"
                    : "false"
            );
        });

        root.dataset.activeStep =
            String(safeIndex + 1);

        root.style.setProperty(
            "--phishing-response-progress",
            `${(
                (safeIndex + 1) /
                steps.length
            ) * 100
            }%`
        );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:phishing-response-change",
                {
                    detail: {
                        activeIndex: safeIndex,
                        activeStep:
                            steps[safeIndex],
                        totalSteps:
                            steps.length
                    }
                }
            )
        );
    }

    function initializeResponseFallback(
        root,
        steps
    ) {
        let frame = null;

        function update() {
            frame = null;

            const viewportTarget =
                window.innerHeight * 0.43;

            let closestIndex = 0;
            let closestDistance =
                Number.POSITIVE_INFINITY;

            steps.forEach(function (
                step,
                index
            ) {
                const rect =
                    step.getBoundingClientRect();

                const center =
                    rect.top +
                    rect.height / 2;

                const distance =
                    Math.abs(
                        center -
                        viewportTarget
                    );

                if (
                    distance <
                    closestDistance
                ) {
                    closestDistance =
                        distance;

                    closestIndex =
                        index;
                }
            });

            setActiveResponseStep(
                root,
                steps,
                closestIndex
            );
        }

        function scheduleUpdate() {
            if (frame) {
                return;
            }

            frame =
                requestFrame(update);
        }

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
            scheduleUpdate,
            {
                passive: true
            }
        );

        update();

        registerCleanup(function () {
            if (frame) {
                window.cancelAnimationFrame(
                    frame
                );
            }
        });
    }


    /* =========================================================
       8. PHISHING CHECKLIST
       ========================================================= */

    function initializeChecklist() {
        const checklist =
            document.querySelector(
                "[data-phishing-checklist]"
            );

        if (
            !checklist ||
            checklist.dataset.initialized ===
            "true"
        ) {
            return;
        }

        checklist.dataset.initialized = "true";

        const checkboxes = Array.from(
            checklist.querySelectorAll(
                'input[type="checkbox"]'
            )
        );

        const counter =
            checklist.querySelector(
                "[data-phishing-checklist-count]"
            );

        const progress =
            checklist.querySelector(
                "[data-phishing-checklist-progress]"
            );

        const progressBar =
            checklist.querySelector(
                "[data-phishing-checklist-progress] span"
            );

        const resetButton =
            checklist.querySelector(
                "[data-phishing-checklist-reset]"
            );

        if (!checkboxes.length) {
            return;
        }

        function updateChecklist() {
            const completed =
                checkboxes.filter(function (
                    checkbox
                ) {
                    return checkbox.checked;
                }).length;

            const total =
                checkboxes.length;

            const percentage =
                total > 0
                    ? (completed / total) * 100
                    : 0;

            setText(
                counter,
                `${completed} of ${total} ` +
                `${completed === 1
                    ? "check"
                    : "checks"} completed`
            );

            if (progressBar) {
                progressBar.style.width =
                    `${percentage}%`;
            }

            progress?.setAttribute(
                "aria-valuemax",
                String(total)
            );

            progress?.setAttribute(
                "aria-valuenow",
                String(completed)
            );

            checklist.dataset.completed =
                String(completed === total);

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:phishing-checklist-change",
                    {
                        detail: {
                            completed,
                            total,
                            percentage
                        }
                    }
                )
            );
        }

        checkboxes.forEach(function (
            checkbox
        ) {
            addEvent(
                checkbox,
                "change",
                updateChecklist
            );
        });

        addEvent(
            resetButton,
            "click",
            function () {
                checkboxes.forEach(
                    function (checkbox) {
                        checkbox.checked = false;
                    }
                );

                updateChecklist();

                focusWithoutScroll(
                    checkboxes[0]
                );
            }
        );

        updateChecklist();
    }


    /* =========================================================
       9. FAQ ACCORDION
       ========================================================= */

    function initializePhishingFAQ() {
        const accordion =
            document.querySelector(
                "[data-phishing-faq]"
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

        const items = Array.from(
            accordion.querySelectorAll(
                ".phishing-faq__item"
            )
        );

        if (!items.length) {
            return;
        }

        items.forEach(function (
            item,
            index
        ) {
            const summary =
                item.querySelector("summary");

            const answer =
                item.querySelector(
                    ".phishing-faq__answer"
                );

            if (!summary || !answer) {
                return;
            }

            const summaryId =
                summary.id ||
                createUniqueId(
                    "phishing-faq-summary",
                    index
                );

            const answerId =
                answer.id ||
                createUniqueId(
                    "phishing-faq-answer",
                    index
                );

            summary.id = summaryId;
            answer.id = answerId;

            summary.setAttribute(
                "aria-controls",
                answerId
            );

            answer.setAttribute(
                "role",
                "region"
            );

            answer.setAttribute(
                "aria-labelledby",
                summaryId
            );

            function updateItem() {
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

                if (item.open) {
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
                }

                window.dispatchEvent(
                    new CustomEvent(
                        "securehabit:phishing-faq-toggle",
                        {
                            detail: {
                                index,
                                item,
                                open: item.open
                            }
                        }
                    )
                );
            }

            addEvent(
                item,
                "toggle",
                updateItem
            );

            updateItem();
        });

        const openItem =
            items.find(function (item) {
                return item.open;
            });

        if (!openItem && items[0]) {
            items[0].open = true;
        }
    }


    /* =========================================================
       10. HERO POINTER MOTION
       ========================================================= */

    function initializeHeroMotion() {
        const hero =
            document.querySelector(
                ".phishing-hero"
            );

        const message =
            hero?.querySelector(
                ".phishing-hero__message"
            );

        const network =
            hero?.querySelector(
                ".phishing-hero__network"
            );

        const mark =
            hero?.querySelector(
                ".phishing-hero__mark"
            );

        if (
            !hero ||
            (!message && !network && !mark)
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
                (targetX - currentX) *
                0.075;

            currentY +=
                (targetY - currentY) *
                0.075;

            if (message) {
                message.style.transform =
                    `translate3d(${currentX * 17
                    }px, calc(-50% + ${currentY * 13
                    }px), 0) rotate(4deg)`;
            }

            if (network) {
                network.style.transform =
                    `translate3d(${currentX * -10
                    }px, ${currentY * -8
                    }px, 0)`;
            }

            if (mark) {
                mark.style.transform =
                    `translate3d(${currentX * -13
                    }px, calc(-50% + ${currentY * -9
                    }px), 0) rotate(10deg)`;
            }

            const unfinished =
                Math.abs(
                    targetX - currentX
                ) > 0.001 ||
                Math.abs(
                    targetY - currentY
                ) > 0.001;

            if (unfinished) {
                state.heroFrame =
                    requestFrame(render);
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
                requestFrame(render);
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

            targetX = clamp(
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width -
                0.5,
                -0.5,
                0.5
            );

            targetY = clamp(
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height -
                0.5,
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
       11. FINAL CTA PARALLAX
       ========================================================= */

    function initializeFinalCtaParallax() {
        const section =
            document.querySelector(
                ".phishing-final-cta"
            );

        const background =
            section?.querySelector(
                ".phishing-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".phishing-final-cta__geometry"
            );

        if (!section || !background) {
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
                `translate3d(0, ${backgroundOffset
                }px, 0) scale(1.09)`;

            if (geometry) {
                geometry.style.transform =
                    `translate3d(0, calc(-50% + ${geometryOffset
                    }px), 0) rotate(8deg)`;
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
                requestFrame(update);
        }

        window
            .SecureHabitPhishingScheduleParallax =
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
                    requestFrame(function () {
                        state.resizeFrame = null;
                        scheduleUpdate();
                    });
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
                .SecureHabitPhishingScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitPhishingScheduleParallax();
        }
    }


    /* =========================================================
       12. SECTION VISIBILITY STATES
       ========================================================= */

    function initializeSectionStates() {
        const sections = Array.from(
            document.querySelectorAll(
                [
                    ".phishing-overview",
                    ".phishing-review",
                    ".phishing-scenarios",
                    ".phishing-response",
                    ".phishing-faq",
                    ".phishing-final-cta"
                ].join(",")
            )
        );

        if (!sections.length) {
            return;
        }

        if (
            !("IntersectionObserver" in window)
        ) {
            sections.forEach(function (
                section
            ) {
                section.classList.add(
                    "is-in-view"
                );
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

        sections.forEach(function (section) {
            state.sectionObserver.observe(
                section
            );
        });
    }


    /* =========================================================
       13. CLEANUP
       ========================================================= */

    function destroyPhishingAwarenessPage() {
        state.processObserver?.disconnect();
        state.sectionObserver?.disconnect();

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
                        "SecureHabit could not remove a Phishing Awareness event listener.",
                        error
                    );
                }
            }
        );

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    /* =========================================================
       14. PUBLIC PAGE API
       ========================================================= */

    window.SecureHabitPhishingAwareness =
        Object.freeze({
            showWarning: function (index) {
                const markers = Array.from(
                    document.querySelectorAll(
                        "[data-phishing-marker]"
                    )
                );

                const marker =
                    markers[index];

                marker?.click();
            },

            showScenario: function (index) {
                const buttons = Array.from(
                    document.querySelectorAll(
                        "[data-phishing-scenario-index]"
                    )
                );

                buttons[index]?.click();
            },

            resetChecklist: function () {
                document
                    .querySelector(
                        "[data-phishing-checklist-reset]"
                    )
                    ?.click();
            },

            refreshParallax:
                scheduleFinalCtaParallax,

            refreshIcons: function () {
                window.SecureHabit?.refreshIcons?.();
            },

            destroy:
                destroyPhishingAwarenessPage
        });
})();