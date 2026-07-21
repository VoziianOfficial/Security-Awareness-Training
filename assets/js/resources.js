




(function () {
    "use strict";

    const PAGE_ID = "training-resources";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,
        heroFrame: null,
        parallaxFrame: null,
        resizeFrame: null,
        sectionObserver: null,
        cleanupCallbacks: [],
        printTarget: null
    };


    



    const emailAnatomyContent = {
        "display-name": {
            icon: "contact",
            title: "Display name",
            value: "Account Team",
            copy:
                "The visible name can be edited by the sender and does not independently confirm who sent the message.",
            guidance:
                "Review the complete sender address and surrounding workplace context before trusting the display name."
        },

        "sender-address": {
            icon: "at-sign",
            title: "Real sender address",
            value:
                "account-alert@access-message.example",
            copy:
                "The full address provides more information than the display name, but it still needs to be compared with expected organizational domains.",
            guidance:
                "Check spelling, domain structure and whether this address is normally used for account-related communication."
        },

        "reply-to": {
            icon: "reply",
            title: "Reply-to address",
            value:
                "verify-access@outside-mail.example",
            copy:
                "The reply-to address differs from the visible sender address and sends responses to another fictional domain.",
            guidance:
                "A different reply-to address is not always malicious, but unexpected differences require additional verification."
        },

        "link-destination": {
            icon: "link-2",
            title: "Link destination",
            value:
                "training.invalid/account-review",
            copy:
                "The button text suggests an account service, while the fictional destination uses an unrelated training domain.",
            guidance:
                "Do not use the message link. Open the approved service independently through a saved bookmark or known company route."
        },

        attachment: {
            icon: "file-archive",
            title: "Attachment",
            value: "Account-Review.zip",
            copy:
                "The message includes an unexpected compressed file that supposedly contains an account report.",
            guidance:
                "Do not open unexpected attachments. Confirm whether the file and file type were expected through an approved channel."
        },

        "message-tone": {
            icon: "timer-alert",
            title: "Message tone",
            value:
                "Confirm within fifteen minutes",
            copy:
                "The message creates urgency and threatens permanent account loss to reduce the time available for careful review.",
            guidance:
                "Urgency should not replace verification. Pause and check the request through the normal account process."
        },

        "requested-action": {
            icon: "mouse-pointer-click",
            title: "Requested action",
            value:
                "Open the link and enter account details",
            copy:
                "The recipient is asked to use an embedded sign-in route rather than open the approved service independently.",
            guidance:
                "Use the organization’s normal sign-in, recovery and reporting procedures instead of following the message instructions."
        }
    };


    



    const resourceQuizFeedback = {
        checklist: {
            correct: {
                title: "Use a structured review and verify independently",
                copy:
                    "The checklist helps identify warning signs, while a separate approved channel helps confirm whether the payment change is genuine."
            },

            incorrect: {
                title: "Do not rely on the original message route",
                copy:
                    "A reply, forward or informal question may keep the discussion inside the same unverified communication. Use the review checklist and an approved independent verification process."
            }
        },

        policy: {
            correct: {
                title: "Organizational policy takes priority",
                copy:
                    "SecureHabit provides general awareness information. Internal policies, approved tools and instructions from appropriate organizational contacts should guide the actual action."
            },

            incorrect: {
                title: "General guidance cannot replace internal policy",
                copy:
                    "Do not combine conflicting instructions or choose the shortest option without clarification. Follow organizational policy and ask the appropriate internal contact when needed."
            }
        },

        discussion: {
            correct: {
                title: "Use a fictional or appropriately sanitized example",
                copy:
                    "A fictional scenario can preserve the learning value without unnecessarily exposing real employee, customer or organizational information."
            },

            incorrect: {
                title: "Protect real incident and employee information",
                copy:
                    "Do not broadly share complete real messages or incident details. Use an approved, appropriately sanitized or fictional example for awareness discussion."
            }
        }
    };


    



    function initializeResourcesPage() {
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
        initializeResourceFilters();
        initializeSecurityChecklist();
        initializePrintActions();
        initializeEmailAnatomy();
        initializeScenarioSlider();
        initializeResourceQuiz();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        window.SecureHabit?.refreshIcons?.();
        window.SecureHabit?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:training-resources-ready",
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
        initializeResourcesPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeResourcesPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializeResourcesPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyResourcesPage,
        {
            once: true
        }
    );


    



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

    function createUniqueId(prefix, index) {
        return `${prefix}-${index + 1}`;
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
        const documentStack =
            document.querySelector(
                ".resources-hero__document-stack"
            );

        const heroMark =
            document.querySelector(
                ".resources-hero__mark"
            );

        const finalBackground =
            document.querySelector(
                ".resources-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".resources-final-cta__geometry"
            );

        if (documentStack) {
            documentStack.style.transform = "";
        }

        if (heroMark) {
            heroMark.style.transform = "";
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


    



    function initializeResourceFilters() {
        const controls =
            document.querySelector(
                "[data-resource-filters]"
            );

        const library =
            document.querySelector(
                "[data-resource-library]"
            );

        if (
            !controls ||
            !library ||
            controls.dataset.initialized ===
            "true"
        ) {
            return;
        }

        controls.dataset.initialized = "true";

        const buttons = Array.from(
            controls.querySelectorAll(
                "[data-resource-filter]"
            )
        );

        const items = Array.from(
            library.querySelectorAll(
                "[data-resource-item]"
            )
        );

        const status =
            document.querySelector(
                "[data-resource-filter-status]"
            );

        const emptyState =
            document.querySelector(
                "[data-resource-empty]"
            );

        const showAllButton =
            document.querySelector(
                "[data-resource-show-all]"
            );

        if (!buttons.length || !items.length) {
            return;
        }

        function applyFilter(
            filter,
            {
                focusButton = false
            } = {}
        ) {
            const activeButton =
                buttons.find(function (button) {
                    return (
                        button.dataset.resourceFilter ===
                        filter
                    );
                }) || buttons[0];

            let visibleCount = 0;

            buttons.forEach(function (button) {
                const active =
                    button === activeButton;

                button.classList.toggle(
                    "is-active",
                    active
                );

                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );
            });

            items.forEach(function (item) {
                const categories =
                    String(
                        item.dataset
                            .resourceCategories || ""
                    )
                        .split(/\s+/)
                        .filter(Boolean);

                const visible =
                    filter === "all" ||
                    categories.includes(filter);

                item.hidden = !visible;
                item.setAttribute(
                    "aria-hidden",
                    String(!visible)
                );

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden =
                    visibleCount !== 0;
            }

            setText(
                status,
                createFilterStatus(
                    filter,
                    visibleCount
                )
            );

            controls.dataset.activeFilter =
                filter;

            if (focusButton) {
                focusWithoutScroll(activeButton);
            }

            window.SecureHabit?.refreshAOS?.();

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:resource-filter-change",
                    {
                        detail: {
                            filter,
                            visibleCount
                        }
                    }
                )
            );
        }

        buttons.forEach(function (button) {
            addEvent(
                button,
                "click",
                function () {
                    applyFilter(
                        button.dataset.resourceFilter
                    );
                }
            );
        });

        addEvent(
            showAllButton,
            "click",
            function () {
                applyFilter("all", {
                    focusButton: true
                });
            }
        );

        applyFilter("all");
    }

    function createFilterStatus(
        filter,
        visibleCount
    ) {
        if (filter === "all") {
            return (
                `Showing all ${visibleCount} ` +
                `${visibleCount === 1
                    ? "training resource"
                    : "training resources"}.`
            );
        }

        const label = filter
            .split("-")
            .map(function (word) {
                return (
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
                );
            })
            .join(" ");

        if (visibleCount === 0) {
            return (
                `No resources match the ` +
                `${label} filter.`
            );
        }

        return (
            `Showing ${visibleCount} ` +
            `${visibleCount === 1
                ? "resource"
                : "resources"} ` +
            `for ${label}.`
        );
    }


    



    function initializeSecurityChecklist() {
        const checklist =
            document.querySelector(
                "[data-security-checklist]"
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
                "[data-checklist-count]"
            );

        const progress =
            checklist.querySelector(
                "[data-checklist-progress]"
            );

        const progressBar =
            checklist.querySelector(
                "[data-checklist-progress] span"
            );

        const resetButton =
            document.querySelector(
                "[data-checklist-reset]"
            );

        if (!checkboxes.length) {
            return;
        }

        function updateChecklist() {
            const checkedCount =
                checkboxes.filter(function (
                    checkbox
                ) {
                    return checkbox.checked;
                }).length;

            const total =
                checkboxes.length;

            const percentage =
                total > 0
                    ? (checkedCount / total) * 100
                    : 0;

            setText(
                counter,
                `${checkedCount} of ${total} ` +
                `${checkedCount === 1
                    ? "item"
                    : "items"} reviewed`
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
                String(checkedCount)
            );

            checklist.dataset.completed =
                String(checkedCount === total);

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:checklist-progress",
                    {
                        detail: {
                            checkedCount,
                            total,
                            percentage
                        }
                    }
                )
            );
        }

        checkboxes.forEach(function (checkbox) {
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


    



    function initializePrintActions() {
        const buttons = Array.from(
            document.querySelectorAll(
                [
                    "[data-resource-print]",
                    "[data-checklist-print]"
                ].join(",")
            )
        );

        if (!buttons.length) {
            return;
        }

        buttons.forEach(function (button) {
            addEvent(
                button,
                "click",
                function () {
                    const selector =
                        button.dataset.printTarget;

                    printResource(selector);
                }
            );
        });

        addEvent(
            window,
            "afterprint",
            clearPrintTarget
        );
    }

    function printResource(selector) {
        if (!selector) {
            window.print();
            return;
        }

        let target = null;

        try {
            target =
                document.querySelector(selector);
        } catch (error) {
            console.warn(
                "SecureHabit received an invalid print target selector.",
                error
            );
        }

        if (!target) {
            window.print();
            return;
        }

        clearPrintTarget();

        state.printTarget = target;

        document.body.classList.add(
            "has-print-target"
        );

        target.classList.add(
            "is-print-target"
        );

        requestFrame(function () {
            window.print();
        });
    }

    function clearPrintTarget() {
        document.body.classList.remove(
            "has-print-target"
        );

        state.printTarget?.classList.remove(
            "is-print-target"
        );

        state.printTarget = null;
    }


    



    function initializeEmailAnatomy() {
        const root =
            document.querySelector(
                "[data-email-anatomy]"
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
                "[data-email-marker]"
            )
        );

        const explanation =
            root.querySelector(
                "[data-email-explanation]"
            );

        if (!markers.length || !explanation) {
            return;
        }

        const elements = {
            step:
                explanation.querySelector(
                    "[data-email-step]"
                ),

            icon:
                explanation.querySelector(
                    "[data-email-icon]"
                ),

            title:
                explanation.querySelector(
                    "[data-email-title]"
                ),

            copy:
                explanation.querySelector(
                    "[data-email-copy]"
                ),

            value:
                explanation.querySelector(
                    "[data-email-value]"
                ),

            guidance:
                explanation.querySelector(
                    "[data-email-guidance]"
                ),

            previous:
                explanation.querySelector(
                    "[data-email-previous]"
                ),

            next:
                explanation.querySelector(
                    "[data-email-next]"
                )
        };

        let activeIndex = 0;

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

            const key =
                marker.dataset.emailMarker;

            const content =
                emailAnatomyContent[key];

            if (!content) {
                return;
            }

            activeIndex = safeIndex;

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
            });

            setText(
                elements.step,
                `Marker ${safeIndex + 1} ` +
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

            explanation.dataset.activeMarker =
                key;

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
                    "securehabit:email-anatomy-change",
                    {
                        detail: {
                            index: safeIndex,
                            marker: key,
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
                    activeIndex - 1,
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
                    activeIndex + 1,
                    {
                        focusExplanation: true
                    }
                );
            }
        );

        activateMarker(0);
    }


    



    function initializeScenarioSlider() {
        const slider =
            document.querySelector(
                "[data-phishing-slider]"
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
                "[data-scenario-slide]"
            )
        );

        const paginationButtons =
            Array.from(
                slider.querySelectorAll(
                    "[data-scenario-index]"
                )
            );

        const previousButton =
            document.querySelector(
                "[data-scenario-previous]"
            );

        const nextButton =
            document.querySelector(
                "[data-scenario-next]"
            );

        const status =
            slider.querySelector(
                "[data-scenario-status]"
            );

        if (!slides.length) {
            return;
        }

        let activeIndex = 0;
        let touchStartX = null;
        let touchStartY = null;

        function showSlide(
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

            activeIndex = safeIndex;

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

            slider.dataset.activeSlide =
                String(safeIndex);

            if (focusPagination) {
                focusWithoutScroll(
                    paginationButtons[safeIndex]
                );
            }

            window.SecureHabit?.refreshAOS?.();

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:scenario-change",
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
                    showSlide(index);
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

                    showSlide(
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
                showSlide(activeIndex - 1);
            }
        );

        addEvent(
            nextButton,
            "click",
            function () {
                showSlide(activeIndex + 1);
            }
        );

        addEvent(
            slider,
            "keydown",
            function (event) {
                if (
                    event.target.closest(
                        "button, a, input, textarea, select"
                    )
                ) {
                    return;
                }

                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    showSlide(activeIndex - 1);
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    showSlide(activeIndex + 1);
                }
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
                    touch?.clientX ?? touchStartX;

                const endY =
                    touch?.clientY ?? touchStartY;

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
                    showSlide(activeIndex + 1);
                } else {
                    showSlide(activeIndex - 1);
                }
            },
            {
                passive: true
            }
        );

        showSlide(0);
    }


    



    function initializeResourceQuiz() {
        const root =
            document.querySelector(
                "[data-resource-quiz]"
            );

        if (
            !root ||
            root.dataset.initialized ===
            "true"
        ) {
            return;
        }

        root.dataset.initialized = "true";

        const questions = Array.from(
            root.querySelectorAll(
                "[data-resource-quiz-question]"
            )
        );

        if (!questions.length) {
            return;
        }

        const elements = {
            questionsContainer:
                root.querySelector(
                    "[data-resource-quiz-questions]"
                ),

            counter:
                root.querySelector(
                    "[data-resource-quiz-counter]"
                ),

            progress:
                root.querySelector(
                    "[data-resource-quiz-progress]"
                ),

            progressBar:
                root.querySelector(
                    "[data-resource-quiz-progress] span"
                ),

            feedback:
                root.querySelector(
                    "[data-resource-quiz-feedback]"
                ),

            feedbackTitle:
                root.querySelector(
                    "[data-resource-quiz-feedback-title]"
                ),

            feedbackCopy:
                root.querySelector(
                    "[data-resource-quiz-feedback-copy]"
                ),

            result:
                root.querySelector(
                    "[data-resource-quiz-result]"
                ),

            resultCopy:
                root.querySelector(
                    "[data-resource-quiz-result-copy]"
                ),

            nextButton:
                root.querySelector(
                    "[data-resource-quiz-next]"
                ),

            restartButton:
                root.querySelector(
                    "[data-resource-quiz-restart]"
                ),

            navigation:
                root.querySelector(
                    ".resources-quiz__navigation"
                )
        };

        const quizState = {
            currentIndex: 0,
            correctAnswers: 0,
            answers:
                new Array(
                    questions.length
                ).fill(null)
        };

        function showQuestion(
            index,
            {
                focusFirstAnswer = false
            } = {}
        ) {
            const safeIndex = clamp(
                index,
                0,
                questions.length - 1
            );

            quizState.currentIndex =
                safeIndex;

            questions.forEach(function (
                question,
                questionIndex
            ) {
                const active =
                    questionIndex === safeIndex;

                question.hidden = !active;

                question.classList.toggle(
                    "is-active",
                    active
                );

                question.setAttribute(
                    "aria-hidden",
                    String(!active)
                );
            });

            const questionNumber =
                safeIndex + 1;

            setText(
                elements.counter,
                `Question ${questionNumber} ` +
                `of ${questions.length}`
            );

            const percentage =
                (
                    questionNumber /
                    questions.length
                ) * 100;

            if (elements.progressBar) {
                elements.progressBar.style.width =
                    `${percentage}%`;
            }

            elements.progress?.setAttribute(
                "aria-valuenow",
                String(questionNumber)
            );

            elements.feedback.hidden = true;
            elements.result.hidden = true;
            elements.questionsContainer.hidden =
                false;

            elements.navigation.hidden = false;

            const answered =
                quizState.answers[safeIndex] !==
                null;

            elements.nextButton.disabled =
                !answered;

            const buttonLabel =
                elements.nextButton.querySelector(
                    "span"
                );

            const isLast =
                safeIndex ===
                questions.length - 1;

            setText(
                buttonLabel,
                isLast
                    ? "View Learning Feedback"
                    : "Next Question"
            );

            if (focusFirstAnswer) {
                const activeQuestion =
                    questions[safeIndex];

                const selected =
                    activeQuestion.querySelector(
                        ".is-selected[data-resource-quiz-answer]"
                    );

                const firstAnswer =
                    activeQuestion.querySelector(
                        "[data-resource-quiz-answer]"
                    );

                requestFrame(function () {
                    focusWithoutScroll(
                        selected || firstAnswer
                    );
                });
            }
        }

        function answerQuestion(
            questionIndex,
            button
        ) {
            if (
                quizState.answers[
                questionIndex
                ] !== null
            ) {
                return;
            }

            const question =
                questions[questionIndex];

            const questionId =
                question.dataset.questionId;

            const correct =
                button.dataset.correct ===
                "true";

            quizState.answers[
                questionIndex
            ] = {
                value:
                    button.dataset
                        .resourceQuizAnswer,
                correct
            };

            if (correct) {
                quizState.correctAnswers += 1;
            }

            const answerButtons =
                Array.from(
                    question.querySelectorAll(
                        "[data-resource-quiz-answer]"
                    )
                );

            answerButtons.forEach(function (
                answerButton
            ) {
                const selected =
                    answerButton === button;

                answerButton.disabled = true;

                answerButton.classList.toggle(
                    "is-selected",
                    selected
                );

                if (selected) {
                    answerButton.classList.add(
                        correct
                            ? "is-correct"
                            : "is-incorrect"
                    );
                }
            });

            const feedback =
                resourceQuizFeedback[
                questionId
                ]?.[
                correct
                    ? "correct"
                    : "incorrect"
                ];

            if (feedback) {
                setText(
                    elements.feedbackTitle,
                    feedback.title
                );

                setText(
                    elements.feedbackCopy,
                    feedback.copy
                );
            }

            elements.feedback.hidden = false;
            elements.nextButton.disabled = false;

            requestFrame(function () {
                focusWithoutScroll(
                    elements.feedback
                );
            });

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:resource-quiz-answer",
                    {
                        detail: {
                            questionIndex,
                            questionId,
                            correct
                        }
                    }
                )
            );
        }

        function showNextQuestion() {
            if (
                quizState.answers[
                quizState.currentIndex
                ] === null
            ) {
                return;
            }

            const isLast =
                quizState.currentIndex ===
                questions.length - 1;

            if (isLast) {
                showResult();
                return;
            }

            showQuestion(
                quizState.currentIndex + 1,
                {
                    focusFirstAnswer: true
                }
            );
        }

        function showResult() {
            elements.questionsContainer.hidden =
                true;

            elements.feedback.hidden = true;
            elements.navigation.hidden = true;
            elements.result.hidden = false;

            setText(
                elements.counter,
                "Learning activity complete"
            );

            if (elements.progressBar) {
                elements.progressBar.style.width =
                    "100%";
            }

            setText(
                elements.resultCopy,
                createQuizResultCopy(
                    quizState.correctAnswers,
                    questions.length
                )
            );

            requestFrame(function () {
                focusWithoutScroll(
                    elements.result
                );
            });

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:resource-quiz-complete",
                    {
                        detail: {
                            correctAnswers:
                                quizState.correctAnswers,

                            totalQuestions:
                                questions.length
                        }
                    }
                )
            );
        }

        function resetQuiz() {
            quizState.currentIndex = 0;
            quizState.correctAnswers = 0;

            quizState.answers =
                new Array(
                    questions.length
                ).fill(null);

            questions.forEach(function (
                question
            ) {
                question
                    .querySelectorAll(
                        "[data-resource-quiz-answer]"
                    )
                    .forEach(function (button) {
                        button.disabled = false;

                        button.classList.remove(
                            "is-selected",
                            "is-correct",
                            "is-incorrect"
                        );
                    });
            });

            showQuestion(0, {
                focusFirstAnswer: true
            });
        }

        questions.forEach(function (
            question,
            questionIndex
        ) {
            question
                .querySelectorAll(
                    "[data-resource-quiz-answer]"
                )
                .forEach(function (button) {
                    addEvent(
                        button,
                        "click",
                        function () {
                            answerQuestion(
                                questionIndex,
                                button
                            );
                        }
                    );
                });
        });

        addEvent(
            elements.nextButton,
            "click",
            showNextQuestion
        );

        addEvent(
            elements.restartButton,
            "click",
            resetQuiz
        );

        showQuestion(0);
    }

    function createQuizResultCopy(
        correctAnswers,
        totalQuestions
    ) {
        if (correctAnswers === totalQuestions) {
            return (
                "You selected the careful resource or process in each " +
                "fictional situation. Continue connecting these examples " +
                "with your organization’s own policies and reporting routes."
            );
        }

        if (
            correctAnswers >=
            Math.ceil(totalQuestions / 2)
        ) {
            return (
                "You recognized several useful awareness practices. Review " +
                "the explanations again and revisit the resource sections " +
                "connected with the questions that required more attention."
            );
        }

        return (
            "This activity is designed for learning rather than scoring " +
            "or certification. Review each explanation and practise using " +
            "approved organizational processes when a situation is unclear."
        );
    }


    



    function initializeHeroMotion() {
        const hero =
            document.querySelector(
                ".resources-hero"
            );

        const documentStack =
            hero?.querySelector(
                ".resources-hero__document-stack"
            );

        const mark =
            hero?.querySelector(
                ".resources-hero__mark"
            );

        if (
            !hero ||
            (!documentStack && !mark)
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

            if (documentStack) {
                documentStack.style.transform =
                    `translate3d(${currentX * 16
                    }px, calc(-50% + ${currentY * 12
                    }px), 0)`;
            }

            if (mark) {
                mark.style.transform =
                    `translate3d(${currentX * -12
                    }px, calc(-50% + ${currentY * -9
                    }px), 0) rotate(11deg)`;
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


    



    function initializeFinalCtaParallax() {
        const section =
            document.querySelector(
                ".resources-final-cta"
            );

        const background =
            section?.querySelector(
                ".resources-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".resources-final-cta__geometry"
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
                rect.top + rect.height / 2;

            const distance =
                sectionCenter - viewportCenter;

            const backgroundOffset = clamp(
                distance * -0.055,
                -42,
                42
            );

            const geometryOffset = clamp(
                distance * 0.035,
                -26,
                26
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
            .SecureHabitResourcesScheduleParallax =
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
                .SecureHabitResourcesScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitResourcesScheduleParallax();
        }
    }


    



    function initializeSectionStates() {
        const sections = Array.from(
            document.querySelectorAll(
                [
                    ".resources-library",
                    ".resources-checklist",
                    ".resources-email",
                    ".resources-scenarios",
                    ".resources-quiz",
                    ".resources-printables",
                    ".resources-final-cta"
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


    



    function destroyResourcesPage() {
        state.sectionObserver?.disconnect();

        clearPrintTarget();

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
                        "SecureHabit could not remove a Training Resources event listener.",
                        error
                    );
                }
            }
        );

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    



    window.SecureHabitResources =
        Object.freeze({
            printResource,

            clearPrintTarget,

            refreshIcons: function () {
                window.SecureHabit?.refreshIcons?.();
            },

            refreshParallax:
                scheduleFinalCtaParallax,

            destroy:
                destroyResourcesPage
        });
})();