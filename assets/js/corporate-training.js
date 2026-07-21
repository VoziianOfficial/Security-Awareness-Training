




(function () {
    "use strict";

    const PAGE_ID = "corporate-training";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,
        processObserver: null,
        sectionObserver: null,
        heroFrame: null,
        parallaxFrame: null,
        resizeFrame: null,
        cleanupCallbacks: []
    };


    



    const builderContent = {
        audiences: {
            "all-employees": {
                label: "All employees",
                title: "Employee",
                description:
                    "a broad employee audience with responsibilities involving workplace messages, accounts, shared information and digital communication"
            },

            "new-employees": {
                label: "New employees",
                title: "New employee",
                description:
                    "employees beginning a new role who need an introduction to approved tools, account expectations and reporting routes"
            },

            managers: {
                label: "Managers",
                title: "Manager",
                description:
                    "managers who influence access decisions, approval processes and the workplace culture around verification"
            },

            "remote-teams": {
                label: "Remote teams",
                title: "Remote team",
                description:
                    "distributed employees working across home offices, shared spaces, multiple locations and online collaboration tools"
            }
        },

        priorities: {
            phishing: {
                label: "Phishing awareness",
                title: "phishing",
                description:
                    "suspicious messages, sender details, links, attachments, urgency and independent verification",
                content: [
                    "Sender and reply-to review",
                    "Urgency and authority cues",
                    "Link and attachment decisions",
                    "Independent verification"
                ]
            },

            accounts: {
                label: "Password and account security",
                title: "account security",
                description:
                    "unique credentials, approved password management, authentication prompts and account recovery",
                content: [
                    "Unique credential habits",
                    "Approved password-manager use",
                    "Unexpected authentication prompts",
                    "Account recovery procedures"
                ]
            },

            "remote-work": {
                label: "Safe remote work",
                title: "remote-work security",
                description:
                    "approved devices, connections, updates, workspace privacy and remote collaboration",
                content: [
                    "Approved devices and connections",
                    "Updates and account access",
                    "Workspace and screen privacy",
                    "Remote reporting procedures"
                ]
            },

            data: {
                label: "Data handling",
                title: "data-protection",
                description:
                    "information access, recipients, approved sharing methods, retention and responsible disposal",
                content: [
                    "Information classification",
                    "Recipient authorization",
                    "Approved sharing methods",
                    "Retention and disposal decisions"
                ]
            }
        },

        formats: {
            workshop: {
                label: "Live workshop",
                title: "workshop",
                description:
                    "A facilitated session can combine explanations, fictional scenarios, discussion and connections with approved organizational procedures.",
                queryValue: "workshop"
            },

            virtual: {
                label: "Virtual session",
                title: "virtual session",
                description:
                    "A live online session can support distributed teams while preserving guided discussion and opportunities for questions.",
                queryValue: "virtual-session"
            },

            "short-lessons": {
                label: "Short lessons",
                title: "short learning path",
                description:
                    "A sequence of focused lessons can reinforce one decision at a time and support recurring awareness throughout the year.",
                queryValue: "short-lessons"
            },

            discussion: {
                label: "Discussion guide",
                title: "discussion programme",
                description:
                    "A manager-led discussion can use fictional scenarios, practical prompts and internal reporting guidance.",
                queryValue: "discussion-guide"
            }
        }
    };


    



    function initializeCorporateTrainingPage() {
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
        initializeFormatTabs();
        initializeTrainingProcess();
        initializeProgrammeBuilder();
        initializeCorporateFAQ();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        window.SecureHabit?.refreshIcons?.();
        window.SecureHabit?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:corporate-training-ready",
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
        initializeCorporateTrainingPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeCorporateTrainingPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializeCorporateTrainingPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyCorporateTrainingPage,
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
        const signal =
            document.querySelector(
                ".corporate-hero__signal"
            );

        const heroMark =
            document.querySelector(
                ".corporate-hero__mark"
            );

        const finalBackground =
            document.querySelector(
                ".corporate-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".corporate-final-cta__geometry"
            );

        if (signal) {
            signal.style.transform = "";
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


    



    function initializeFormatTabs() {
        const root =
            document.querySelector(
                "[data-corporate-format-tabs]"
            );

        if (
            !root ||
            root.dataset.initialized ===
            "true"
        ) {
            return;
        }

        root.dataset.initialized = "true";

        const tabs = Array.from(
            root.querySelectorAll(
                "[data-corporate-format-tab]"
            )
        );

        const panels = Array.from(
            root.querySelectorAll(
                "[data-corporate-format-panel]"
            )
        );

        if (!tabs.length || !panels.length) {
            return;
        }

        function activateFormat(
            format,
            {
                focusTab = false,
                focusPanel = false
            } = {}
        ) {
            const activeTab =
                tabs.find(function (tab) {
                    return (
                        tab.dataset
                            .corporateFormatTab ===
                        format
                    );
                });

            const activePanel =
                panels.find(function (panel) {
                    return (
                        panel.dataset
                            .corporateFormatPanel ===
                        format
                    );
                });

            if (!activeTab || !activePanel) {
                return;
            }

            tabs.forEach(function (tab) {
                const active =
                    tab === activeTab;

                tab.classList.toggle(
                    "is-active",
                    active
                );

                tab.setAttribute(
                    "aria-selected",
                    String(active)
                );

                tab.tabIndex =
                    active ? 0 : -1;
            });

            panels.forEach(function (panel) {
                const active =
                    panel === activePanel;

                panel.hidden = !active;

                panel.classList.toggle(
                    "is-active",
                    active
                );

                panel.setAttribute(
                    "aria-hidden",
                    String(!active)
                );
            });

            root.dataset.activeFormat =
                format;

            if (focusTab) {
                focusWithoutScroll(activeTab);
            }

            if (focusPanel) {
                requestFrame(function () {
                    focusWithoutScroll(
                        activePanel
                    );
                });
            }

            window.SecureHabit?.refreshAOS?.();

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:corporate-format-change",
                    {
                        detail: {
                            format,
                            tab: activeTab,
                            panel: activePanel
                        }
                    }
                )
            );
        }

        tabs.forEach(function (tab, index) {
            const format =
                tab.dataset
                    .corporateFormatTab;

            addEvent(
                tab,
                "click",
                function () {
                    activateFormat(format);
                }
            );

            addEvent(
                tab,
                "keydown",
                function (event) {
                    let nextIndex = null;

                    switch (event.key) {
                        case "ArrowRight":
                        case "ArrowDown":
                            nextIndex =
                                (index + 1) %
                                tabs.length;
                            break;

                        case "ArrowLeft":
                        case "ArrowUp":
                            nextIndex =
                                (
                                    index -
                                    1 +
                                    tabs.length
                                ) % tabs.length;
                            break;

                        case "Home":
                            nextIndex = 0;
                            break;

                        case "End":
                            nextIndex =
                                tabs.length - 1;
                            break;

                        default:
                            return;
                    }

                    event.preventDefault();

                    activateFormat(
                        tabs[nextIndex].dataset
                            .corporateFormatTab,
                        {
                            focusTab: true
                        }
                    );
                }
            );
        });

        const selectedTab =
            tabs.find(function (tab) {
                return (
                    tab.getAttribute(
                        "aria-selected"
                    ) === "true"
                );
            }) || tabs[0];

        activateFormat(
            selectedTab.dataset
                .corporateFormatTab
        );
    }


    



    function initializeTrainingProcess() {
        const root =
            document.querySelector(
                "[data-training-process]"
            );

        if (!root) {
            return;
        }

        const steps = Array.from(
            root.querySelectorAll(
                "[data-training-process-step]"
            )
        );

        if (!steps.length) {
            return;
        }

        steps.forEach(function (
            step,
            index
        ) {
            step.dataset.processIndex =
                String(index);

            step.setAttribute(
                "aria-current",
                index === 0
                    ? "step"
                    : "false"
            );
        });

        setActiveProcessStep(
            root,
            steps,
            0
        );

        if (
            !("IntersectionObserver" in window)
        ) {
            initializeProcessFallback(
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

                    setActiveProcessStep(
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

    function setActiveProcessStep(
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

            const completed =
                index < safeIndex;

            step.classList.toggle(
                "is-active",
                active
            );

            step.classList.toggle(
                "is-complete",
                completed
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
            "--training-process-progress",
            `${(
                (safeIndex + 1) /
                steps.length
            ) * 100
            }%`
        );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:training-process-change",
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

    function initializeProcessFallback(
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

            setActiveProcessStep(
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


    



    function initializeProgrammeBuilder() {
        const root =
            document.querySelector(
                "[data-programme-builder]"
            );

        if (
            !root ||
            root.dataset.initialized ===
            "true"
        ) {
            return;
        }

        root.dataset.initialized = "true";

        const optionButtons = Array.from(
            root.querySelectorAll(
                "[data-builder-option]"
            )
        );

        const summary =
            root.querySelector(
                "[data-builder-summary]"
            );

        if (!optionButtons.length || !summary) {
            return;
        }

        const elements = {
            title:
                summary.querySelector(
                    "[data-builder-title]"
                ),

            description:
                summary.querySelector(
                    "[data-builder-description]"
                ),

            audience:
                summary.querySelector(
                    "[data-builder-audience]"
                ),

            priority:
                summary.querySelector(
                    "[data-builder-priority]"
                ),

            format:
                summary.querySelector(
                    "[data-builder-format]"
                ),

            contentList:
                summary.querySelector(
                    "[data-builder-content-list]"
                ),

            contactLink:
                summary.querySelector(
                    "[data-builder-contact-link]"
                )
        };

        const selections = {
            audience:
                getInitialBuilderValue(
                    optionButtons,
                    "audience",
                    "all-employees"
                ),

            priority:
                getInitialBuilderValue(
                    optionButtons,
                    "priority",
                    "phishing"
                ),

            format:
                getInitialBuilderValue(
                    optionButtons,
                    "format",
                    "workshop"
                )
        };

        function selectOption(
            type,
            value,
            {
                focusSummary = false
            } = {}
        ) {
            const relevantButtons =
                optionButtons.filter(
                    function (button) {
                        return (
                            button.dataset
                                .builderOption ===
                            type
                        );
                    }
                );

            const selectedButton =
                relevantButtons.find(
                    function (button) {
                        return (
                            button.dataset
                                .builderValue ===
                            value
                        );
                    }
                );

            if (!selectedButton) {
                return;
            }

            relevantButtons.forEach(
                function (button) {
                    const selected =
                        button ===
                        selectedButton;

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

            selections[type] = value;

            renderBuilderSummary(
                selections,
                elements
            );

            root.dataset[
                `selected${capitalize(type)}`
            ] = value;

            if (focusSummary) {
                requestFrame(function () {
                    focusWithoutScroll(summary);
                });
            }

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:programme-builder-change",
                    {
                        detail: {
                            type,
                            value,
                            selections: {
                                ...selections
                            }
                        }
                    }
                )
            );
        }

        optionButtons.forEach(function (
            button
        ) {
            addEvent(
                button,
                "click",
                function () {
                    selectOption(
                        button.dataset.builderOption,
                        button.dataset.builderValue
                    );
                }
            );

            addEvent(
                button,
                "keydown",
                function (event) {
                    if (
                        event.key !== "ArrowRight" &&
                        event.key !== "ArrowDown" &&
                        event.key !== "ArrowLeft" &&
                        event.key !== "ArrowUp"
                    ) {
                        return;
                    }

                    const type =
                        button.dataset.builderOption;

                    const relevantButtons =
                        optionButtons.filter(
                            function (item) {
                                return (
                                    item.dataset
                                        .builderOption ===
                                    type
                                );
                            }
                        );

                    const currentIndex =
                        relevantButtons.indexOf(
                            button
                        );

                    if (currentIndex < 0) {
                        return;
                    }

                    const direction =
                        event.key === "ArrowRight" ||
                            event.key === "ArrowDown"
                            ? 1
                            : -1;

                    const nextIndex =
                        (
                            currentIndex +
                            direction +
                            relevantButtons.length
                        ) %
                        relevantButtons.length;

                    event.preventDefault();

                    const nextButton =
                        relevantButtons[nextIndex];

                    selectOption(
                        type,
                        nextButton.dataset
                            .builderValue
                    );

                    focusWithoutScroll(
                        nextButton
                    );
                }
            );
        });

        renderBuilderSummary(
            selections,
            elements
        );
    }

    function getInitialBuilderValue(
        buttons,
        type,
        fallback
    ) {
        const selectedButton =
            buttons.find(function (button) {
                return (
                    button.dataset
                        .builderOption ===
                    type &&
                    button.getAttribute(
                        "aria-pressed"
                    ) === "true"
                );
            });

        return (
            selectedButton?.dataset
                .builderValue ||
            fallback
        );
    }

    function renderBuilderSummary(
        selections,
        elements
    ) {
        const audience =
            builderContent.audiences[
            selections.audience
            ];

        const priority =
            builderContent.priorities[
            selections.priority
            ];

        const format =
            builderContent.formats[
            selections.format
            ];

        if (
            !audience ||
            !priority ||
            !format
        ) {
            return;
        }

        const title =
            `${audience.title} ` +
            `${priority.title} ` +
            `${format.title}`;

        const description =
            `${format.description} ` +
            `This example is organized for ` +
            `${audience.description} and ` +
            `focuses on ${priority.description}.`;

        setText(
            elements.title,
            title
        );

        setText(
            elements.description,
            description
        );

        setText(
            elements.audience,
            audience.label
        );

        setText(
            elements.priority,
            priority.label
        );

        setText(
            elements.format,
            format.label
        );

        renderBuilderContentList(
            elements.contentList,
            priority.content
        );

        updateBuilderContactLink(
            elements.contactLink,
            selections,
            audience,
            priority,
            format
        );
    }

    function renderBuilderContentList(
        list,
        items
    ) {
        if (!list) {
            return;
        }

        list.replaceChildren();

        items.forEach(function (item) {
            const listItem =
                document.createElement("li");

            listItem.textContent = item;

            list.appendChild(listItem);
        });
    }

    function updateBuilderContactLink(
        link,
        selections,
        audience,
        priority,
        format
    ) {
        if (!link) {
            return;
        }

        const parameters =
            new URLSearchParams({
                inquiry: "corporate-training",
                audience:
                    selections.audience,
                priority:
                    selections.priority,
                format:
                    format.queryValue,
                programme:
                    `${audience.label} — ` +
                    `${priority.label} — ` +
                    `${format.label}`
            });

        link.href =
            `contact.html?` +
            `${parameters.toString()}` +
            `#contact-form`;
    }

    function capitalize(value) {
        if (!value) {
            return "";
        }

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    }


    



    function initializeCorporateFAQ() {
        const accordion =
            document.querySelector(
                "[data-corporate-faq]"
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
                ".corporate-faq__item"
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
                    ".corporate-faq__answer"
                );

            if (!summary || !answer) {
                return;
            }

            const summaryId =
                summary.id ||
                createUniqueId(
                    "corporate-faq-summary",
                    index
                );

            const answerId =
                answer.id ||
                createUniqueId(
                    "corporate-faq-answer",
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
                        "securehabit:corporate-faq-toggle",
                        {
                            detail: {
                                item,
                                index,
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


    



    function initializeHeroMotion() {
        const hero =
            document.querySelector(
                ".corporate-hero"
            );

        const signal =
            hero?.querySelector(
                ".corporate-hero__signal"
            );

        const mark =
            hero?.querySelector(
                ".corporate-hero__mark"
            );

        if (
            !hero ||
            (!signal && !mark)
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

            if (signal) {
                signal.style.transform =
                    `translate3d(${currentX * 16
                    }px, calc(-50% + ${currentY * 12
                    }px), 0)`;
            }

            if (mark) {
                mark.style.transform =
                    `translate3d(${currentX * -12
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


    



    function initializeFinalCtaParallax() {
        const section =
            document.querySelector(
                ".corporate-final-cta"
            );

        const background =
            section?.querySelector(
                ".corporate-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".corporate-final-cta__geometry"
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
            .SecureHabitCorporateScheduleParallax =
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
                .SecureHabitCorporateScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitCorporateScheduleParallax();
        }
    }


    



    function initializeSectionStates() {
        const sections = Array.from(
            document.querySelectorAll(
                [
                    ".corporate-approach",
                    ".corporate-formats",
                    ".corporate-audiences",
                    ".corporate-process",
                    ".corporate-builder",
                    ".corporate-delivery",
                    ".corporate-faq",
                    ".corporate-final-cta"
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


    



    function destroyCorporateTrainingPage() {
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
                        "SecureHabit could not remove a Corporate Training event listener.",
                        error
                    );
                }
            }
        );

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    



    window.SecureHabitCorporateTraining =
        Object.freeze({
            refreshProcess: function () {
                const root =
                    document.querySelector(
                        "[data-training-process]"
                    );

                const steps = root
                    ? Array.from(
                        root.querySelectorAll(
                            "[data-training-process-step]"
                        )
                    )
                    : [];

                if (!root || !steps.length) {
                    return;
                }

                const activeIndex =
                    steps.findIndex(function (
                        step
                    ) {
                        return step.classList.contains(
                            "is-active"
                        );
                    });

                setActiveProcessStep(
                    root,
                    steps,
                    activeIndex >= 0
                        ? activeIndex
                        : 0
                );
            },

            refreshParallax:
                scheduleFinalCtaParallax,

            refreshIcons: function () {
                window.SecureHabit?.refreshIcons?.();
            },

            destroy:
                destroyCorporateTrainingPage
        });
})();