




(function () {
    "use strict";

    const PAGE_ID = "safe-remote-work";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,

        workspaceIndex: 0,
        scenarioIndex: 0,

        processObserver: null,
        sectionObserver: null,

        heroFrame: null,
        parallaxFrame: null,
        resizeFrame: null,

        printTarget: null,
        cleanupCallbacks: []
    };


    



    const workspaceContent = {
        screen: {
            icon: "monitor",
            title: "Screen visibility",

            copy:
                "A workplace screen may be visible to visitors, household members or people outside a nearby window.",

            question:
                "Can anyone who is not authorized see the information displayed on the screen?",

            guidance:
                "Reposition the screen, close unnecessary windows and follow organizational privacy guidance for the work being completed."
        },

        network: {
            icon: "wifi",
            title: "Network connection",

            copy:
                "The available network may not match the connection method approved for workplace systems and information.",

            question:
                "Does this connection follow the employer’s approved remote-access and network process?",

            guidance:
                "Use the approved connection route, remote-access application or support process rather than entering workplace credentials into an unfamiliar page."
        },

        documents: {
            icon: "files",
            title: "Paper documents",

            copy:
                "Printed notes, customer records and other workplace documents may remain visible or accessible outside the office.",

            question:
                "Are paper documents stored, transported and disposed of according to workplace policy?",

            guidance:
                "Keep documents out of unauthorized view and use the employer’s approved storage and disposal process."
        },

        phone: {
            icon: "smartphone",
            title: "Mobile device",

            copy:
                "A mobile device may provide authentication prompts, workplace messages and access to company applications.",

            question:
                "Is the approved mobile device under your control and protected from unauthorized use?",

            guidance:
                "Keep the device with you, review authentication prompts carefully and follow organizational lock-screen and mobile-use requirements."
        },

        conversation: {
            icon: "messages-square",
            title: "Private conversations",

            copy:
                "Calls and meetings may be overheard by household members, visitors or people in nearby shared spaces.",

            question:
                "Is the environment appropriate for the information being discussed?",

            guidance:
                "Move to a suitable private space, use approved audio equipment and postpone sensitive discussions when privacy cannot be maintained."
        },

        absence: {
            icon: "lock-keyhole",
            title: "Leaving the workspace",

            copy:
                "A device or document can remain exposed even when the employee steps away only briefly.",

            question:
                "Will the device and workplace information remain protected while you are away?",

            guidance:
                "Lock the screen, secure documents and keep the device under control according to workplace policy."
        },

        "shared-access": {
            icon: "users-round",
            title: "Shared household access",

            copy:
                "Another person may ask to use the workplace device, account session, application or connected accessories.",

            question:
                "Does organizational policy permit anyone else to use the workplace device or active session?",

            guidance:
                "Keep workplace devices, accounts and sessions limited to authorized use unless the employer explicitly permits another arrangement."
        }
    };


    



    function initializeSafeRemoteWorkPage() {
        if (state.initialized) {
            return;
        }

        if (
            document.body?.dataset.page !==
            PAGE_ID
        ) {
            return;
        }

        state.initialized = true;

        state.motionQuery =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

        state.reducedMotion =
            state.motionQuery.matches;

        initializeMotionPreference();
        initializeWorkspaceReview();
        initializeScenarioSlider();
        initializeResponseProcess();
        initializeRemoteChecklist();
        initializeRemoteFAQ();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        window.SecureHabit
            ?.refreshIcons?.();

        window.SecureHabit
            ?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:safe-remote-work-ready",
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
        initializeSafeRemoteWorkPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeSafeRemoteWorkPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializeSafeRemoteWorkPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroySafeRemoteWorkPage,
        {
            once: true
        }
    );


    



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

    function requestFrame(callback) {
        return window.requestAnimationFrame(
            callback
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

    function isElementVisible(element) {
        if (!element) {
            return false;
        }

        const rect =
            element.getBoundingClientRect();

        return (
            rect.bottom > 0 &&
            rect.top <
            window.innerHeight
        );
    }

    function createUniqueId(
        prefix,
        index
    ) {
        return `${prefix}-${index + 1}`;
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

    function updateLucideIcon(
        element,
        iconName
    ) {
        if (
            !element ||
            !iconName
        ) {
            return;
        }

        element.setAttribute(
            "data-lucide",
            iconName
        );

        window.SecureHabit
            ?.refreshIcons?.();
    }


    



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
        const workspace =
            document.querySelector(
                ".remote-hero__workspace"
            );

        const network =
            document.querySelector(
                ".remote-hero__network"
            );

        const mark =
            document.querySelector(
                ".remote-hero__mark"
            );

        const finalBackground =
            document.querySelector(
                ".remote-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".remote-final-cta__geometry"
            );

        if (workspace) {
            workspace.style.transform = "";
        }

        if (network) {
            network.style.transform = "";
        }

        if (mark) {
            mark.style.transform = "";
        }

        if (finalBackground) {
            finalBackground.style.transform =
                "";
        }

        if (finalGeometry) {
            finalGeometry.style.transform =
                "";
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


    



    function initializeWorkspaceReview() {
        const root =
            document.querySelector(
                "[data-remote-workspace]"
            );

        if (
            !root ||
            root.dataset.initialized ===
            "true"
        ) {
            return;
        }

        root.dataset.initialized =
            "true";

        const markers =
            Array.from(
                root.querySelectorAll(
                    "[data-remote-marker]"
                )
            );

        const explanation =
            root.querySelector(
                "[data-remote-explanation]"
            );

        if (
            !markers.length ||
            !explanation
        ) {
            return;
        }

        const elements = {
            step:
                explanation.querySelector(
                    "[data-remote-step]"
                ),

            icon:
                explanation.querySelector(
                    "[data-remote-icon]"
                ),

            title:
                explanation.querySelector(
                    "[data-remote-title]"
                ),

            copy:
                explanation.querySelector(
                    "[data-remote-copy]"
                ),

            question:
                explanation.querySelector(
                    "[data-remote-question]"
                ),

            guidance:
                explanation.querySelector(
                    "[data-remote-guidance]"
                ),

            previous:
                explanation.querySelector(
                    "[data-remote-previous]"
                ),

            next:
                explanation.querySelector(
                    "[data-remote-next]"
                )
        };

        function activateWorkspaceDetail(
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

            const detailId =
                marker.dataset.remoteMarker;

            const content =
                workspaceContent[detailId];

            if (!content) {
                return;
            }

            state.workspaceIndex =
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
                `Workspace detail ${safeIndex + 1} of ${markers.length}`
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
                elements.question,
                content.question
            );

            setText(
                elements.guidance,
                content.guidance
            );

            updateLucideIcon(
                elements.icon,
                content.icon
            );

            explanation.dataset.activeDetail =
                detailId;

            root.dataset.activeDetail =
                detailId;

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
                    "securehabit:remote-workspace-change",
                    {
                        detail: {
                            index: safeIndex,
                            detailId,
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
                    activateWorkspaceDetail(
                        index
                    );
                }
            );

            addEvent(
                marker,
                "pointerenter",
                function () {
                    const supportsHover =
                        window.matchMedia(
                            "(hover: hover) and (pointer: fine)"
                        ).matches;

                    if (supportsHover) {
                        activateWorkspaceDetail(
                            index
                        );
                    }
                }
            );

            addEvent(
                marker,
                "focus",
                function () {
                    activateWorkspaceDetail(
                        index
                    );
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
                                (
                                    index + 1
                                ) % markers.length;
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

                    activateWorkspaceDetail(
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
                activateWorkspaceDetail(
                    state.workspaceIndex - 1,
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
                activateWorkspaceDetail(
                    state.workspaceIndex + 1,
                    {
                        focusExplanation: true
                    }
                );
            }
        );

        const activeMarkerIndex =
            markers.findIndex(
                function (marker) {
                    return (
                        marker.getAttribute(
                            "aria-pressed"
                        ) === "true"
                    );
                }
            );

        activateWorkspaceDetail(
            activeMarkerIndex >= 0
                ? activeMarkerIndex
                : 0
        );

        window
            .SecureHabitRemoteActivateWorkspaceDetail =
            activateWorkspaceDetail;
    }


    



    function initializeScenarioSlider() {
        const slider =
            document.querySelector(
                "[data-remote-scenarios]"
            );

        if (
            !slider ||
            slider.dataset.initialized ===
            "true"
        ) {
            return;
        }

        slider.dataset.initialized =
            "true";

        const slides =
            Array.from(
                slider.querySelectorAll(
                    "[data-remote-scenario-slide]"
                )
            );

        const paginationButtons =
            Array.from(
                slider.querySelectorAll(
                    "[data-remote-scenario-index]"
                )
            );

        const previousButton =
            document.querySelector(
                "[data-remote-scenario-previous]"
            );

        const nextButton =
            document.querySelector(
                "[data-remote-scenario-next]"
            );

        const status =
            slider.querySelector(
                "[data-remote-scenario-status]"
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
                function (
                    button,
                    buttonIndex
                ) {
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
                `Showing scenario ${safeIndex + 1} of ${slides.length}: ${title}.`
            );

            slider.dataset.activeScenario =
                String(safeIndex + 1);

            if (focusPagination) {
                focusWithoutScroll(
                    paginationButtons[safeIndex]
                );
            }

            window.SecureHabit
                ?.refreshAOS?.();

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:remote-scenario-change",
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

        paginationButtons.forEach(
            function (
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
                                    (
                                        index + 1
                                    ) % slides.length;
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
            }
        );

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
            "keydown",
            function (event) {
                const target =
                    event.target;

                if (
                    target instanceof
                    HTMLInputElement ||
                    target instanceof
                    HTMLTextAreaElement ||
                    target instanceof
                    HTMLSelectElement
                ) {
                    return;
                }

                if (
                    event.key ===
                    "PageDown"
                ) {
                    event.preventDefault();

                    showScenario(
                        state.scenarioIndex + 1
                    );
                }

                if (
                    event.key ===
                    "PageUp"
                ) {
                    event.preventDefault();

                    showScenario(
                        state.scenarioIndex - 1
                    );
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

                showScenario(
                    distanceX < 0
                        ? state.scenarioIndex + 1
                        : state.scenarioIndex - 1
                );
            },
            {
                passive: true
            }
        );

        showScenario(0);

        window
            .SecureHabitRemoteShowScenario =
            showScenario;
    }


    



    function initializeResponseProcess() {
        const root =
            document.querySelector(
                "[data-remote-response-process]"
            );

        if (!root) {
            return;
        }

        const steps =
            Array.from(
                root.querySelectorAll(
                    "[data-remote-response-step]"
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
            !(
                "IntersectionObserver" in
                window
            )
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
                            .filter(
                                function (entry) {
                                    return (
                                        entry.isIntersecting
                                    );
                                }
                            )
                            .sort(
                                function (
                                    first,
                                    second
                                ) {
                                    return (
                                        second.intersectionRatio -
                                        first.intersectionRatio
                                    );
                                }
                            );

                    if (
                        !visibleEntries.length
                    ) {
                        return;
                    }

                    const activeStep =
                        visibleEntries[0].target;

                    const activeIndex =
                        steps.indexOf(
                            activeStep
                        );

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
        const safeIndex =
            clamp(
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
            "--remote-response-progress",
            `${(
                (safeIndex + 1) /
                steps.length
            ) * 100
            }%`
        );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:remote-response-change",
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


    



    function initializeRemoteChecklist() {
        const checklist =
            document.querySelector(
                "[data-remote-checklist]"
            );

        if (
            !checklist ||
            checklist.dataset.initialized ===
            "true"
        ) {
            return;
        }

        checklist.dataset.initialized =
            "true";

        const checkboxes =
            Array.from(
                checklist.querySelectorAll(
                    'input[type="checkbox"]'
                )
            );

        const counter =
            checklist.querySelector(
                "[data-remote-checklist-count]"
            );

        const progress =
            checklist.querySelector(
                "[data-remote-checklist-progress]"
            );

        const progressBar =
            checklist.querySelector(
                "[data-remote-checklist-progress] span"
            );

        const resetButton =
            checklist.querySelector(
                "[data-remote-checklist-reset]"
            );

        const printButton =
            checklist.querySelector(
                "[data-remote-checklist-print]"
            );

        if (!checkboxes.length) {
            return;
        }

        function updateChecklist() {
            const completed =
                checkboxes.filter(
                    function (checkbox) {
                        return checkbox.checked;
                    }
                ).length;

            const total =
                checkboxes.length;

            const percentage =
                total > 0
                    ? (
                        completed /
                        total
                    ) * 100
                    : 0;

            setText(
                counter,
                `${completed} of ${total} ${completed === 1
                    ? "check"
                    : "checks"
                } completed`
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
                String(
                    completed === total
                );

            checklist.dataset.completedCount =
                String(completed);

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:remote-checklist-change",
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

        checkboxes.forEach(
            function (checkbox) {
                addEvent(
                    checkbox,
                    "change",
                    updateChecklist
                );
            }
        );

        addEvent(
            resetButton,
            "click",
            function () {
                checkboxes.forEach(
                    function (checkbox) {
                        checkbox.checked =
                            false;
                    }
                );

                updateChecklist();

                focusWithoutScroll(
                    checkboxes[0]
                );
            }
        );

        addEvent(
            printButton,
            "click",
            function () {
                printRemoteChecklist(
                    printButton.dataset
                        .printTarget
                );
            }
        );

        addEvent(
            window,
            "afterprint",
            clearPrintTarget
        );

        updateChecklist();
    }

    function printRemoteChecklist(
        selector
    ) {
        let target = null;

        if (selector) {
            try {
                target =
                    document.querySelector(
                        selector
                    );
            } catch (error) {
                console.warn(
                    "SecureHabit received an invalid remote-work checklist print selector.",
                    error
                );
            }
        }

        clearPrintTarget();

        state.printTarget = target;

        document.body.classList.add(
            "has-print-target"
        );

        target?.classList.add(
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

        state.printTarget
            ?.classList.remove(
                "is-print-target"
            );

        state.printTarget = null;
    }


    



    function initializeRemoteFAQ() {
        const accordion =
            document.querySelector(
                "[data-remote-faq]"
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
                    ".remote-faq__item"
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
                    ".remote-faq__answer"
                );

            if (
                !summary ||
                !answer
            ) {
                return;
            }

            const summaryId =
                summary.id ||
                createUniqueId(
                    "remote-faq-summary",
                    index
                );

            const answerId =
                answer.id ||
                createUniqueId(
                    "remote-faq-answer",
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

                window.dispatchEvent(
                    new CustomEvent(
                        "securehabit:remote-faq-toggle",
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


    



    function initializeHeroMotion() {
        const hero =
            document.querySelector(
                ".remote-hero"
            );

        const workspace =
            hero?.querySelector(
                ".remote-hero__workspace"
            );

        const network =
            hero?.querySelector(
                ".remote-hero__network"
            );

        const mark =
            hero?.querySelector(
                ".remote-hero__mark"
            );

        if (
            !hero ||
            (
                !workspace &&
                !network &&
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

            if (workspace) {
                workspace.style.transform =
                    `translate3d(` +
                    `${currentX * 17}px, ` +
                    `calc(-50% + ${currentY * 13
                    }px), 0) ` +
                    `rotate(3deg)`;
            }

            if (network) {
                network.style.transform =
                    `translate3d(` +
                    `${currentX * -10}px, ` +
                    `calc(-50% + ${currentY * -8
                    }px), 0)`;
            }

            if (mark) {
                mark.style.transform =
                    `translate3d(` +
                    `${currentX * -13}px, ` +
                    `calc(-50% + ${currentY * -9
                    }px), 0) ` +
                    `rotate(10deg)`;
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


    



    function initializeFinalCtaParallax() {
        const section =
            document.querySelector(
                ".remote-final-cta"
            );

        const background =
            section?.querySelector(
                ".remote-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".remote-final-cta__geometry"
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
                `translate3d(0, ` +
                `${backgroundOffset}px, 0) ` +
                `scale(1.09)`;

            if (geometry) {
                geometry.style.transform =
                    `translate3d(0, ` +
                    `calc(-50% + ${geometryOffset
                    }px), 0) ` +
                    `rotate(8deg)`;
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
            .SecureHabitRemoteScheduleParallax =
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
                        state.resizeFrame =
                            null;

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
                .SecureHabitRemoteScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitRemoteScheduleParallax();
        }
    }


    



    function initializeSectionStates() {
        const sections =
            Array.from(
                document.querySelectorAll(
                    [
                        ".remote-overview",
                        ".remote-workspace",
                        ".remote-connectivity",
                        ".remote-scenarios",
                        ".remote-response",
                        ".remote-checklist",
                        ".remote-faq",
                        ".remote-final-cta"
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
                        entry.target
                            .classList.toggle(
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


    



    function destroySafeRemoteWorkPage() {
        state.processObserver
            ?.disconnect();

        state.sectionObserver
            ?.disconnect();

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
                        "SecureHabit could not remove a Safe Remote Work event listener.",
                        error
                    );
                }
            }
        );

        delete window
            .SecureHabitRemoteActivateWorkspaceDetail;

        delete window
            .SecureHabitRemoteShowScenario;

        delete window
            .SecureHabitRemoteScheduleParallax;

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    



    window.SecureHabitSafeRemoteWork =
        Object.freeze({
            showWorkspaceDetail:
                function (index) {
                    if (
                        typeof window
                            .SecureHabitRemoteActivateWorkspaceDetail ===
                        "function"
                    ) {
                        window
                            .SecureHabitRemoteActivateWorkspaceDetail(
                                Number(index)
                            );
                    }
                },

            showScenario:
                function (index) {
                    if (
                        typeof window
                            .SecureHabitRemoteShowScenario ===
                        "function"
                    ) {
                        window
                            .SecureHabitRemoteShowScenario(
                                Number(index)
                            );
                    }
                },

            resetChecklist:
                function () {
                    document
                        .querySelector(
                            "[data-remote-checklist-reset]"
                        )
                        ?.click();
                },

            printChecklist:
                function () {
                    document
                        .querySelector(
                            "[data-remote-checklist-print]"
                        )
                        ?.click();
                },

            refreshParallax:
                scheduleFinalCtaParallax,

            refreshIcons:
                function () {
                    window.SecureHabit
                        ?.refreshIcons?.();
                },

            destroy:
                destroySafeRemoteWorkPage
        });
})();