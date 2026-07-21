/* =========================================================
   SECUREHABIT — DATA PROTECTION BASICS PAGE
   File: assets/js/data-protection-basics.js
   ========================================================= */

(function () {
    "use strict";

    const PAGE_ID = "data-protection-basics";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,

        lifecycleIndex: 0,
        scenarioIndex: 0,

        processObserver: null,
        sectionObserver: null,

        heroFrame: null,
        parallaxFrame: null,
        resizeFrame: null,

        printTarget: null,
        cleanupCallbacks: []
    };


    /* =========================================================
       1. DATA LIFECYCLE CONTENT
       ========================================================= */

    const lifecycleContent = {
        collect: {
            icon: "folder-input",

            title: "Collect",

            copy:
                "Information may be entered into a form, received from a customer, exported from a system or created during a workplace activity.",

            questions: [
                "Is this information required for the task?",
                "Is the approved collection method being used?",
                "Has unnecessary information been excluded?"
            ],

            guidance:
                "Use the organization’s approved form, system or process and collect only the information required for the work."
        },

        access: {
            icon: "key-round",

            title: "Access",

            copy:
                "Workplace systems may contain more information than a person needs for their current role, project or task.",

            questions: [
                "Does the role require access to this information?",
                "Is the approved account or system being used?",
                "Are the existing permissions still appropriate?"
            ],

            guidance:
                "Use only authorized accounts and access only the information needed for the approved workplace purpose."
        },

        use: {
            icon: "file-pen-line",

            title: "Use",

            copy:
                "Information may be viewed, updated, analyzed, copied, included in reports or used to support workplace decisions.",

            questions: [
                "Does this use match the original workplace purpose?",
                "Is unnecessary information being copied or exposed?",
                "Are approved tools and systems being used?"
            ],

            guidance:
                "Keep information within its authorized purpose and avoid creating unnecessary copies, exports or screenshots."
        },

        share: {
            icon: "share-2",

            title: "Share",

            copy:
                "Information may be sent to a colleague, supplier, customer, external specialist or another workplace system.",

            questions: [
                "Was the recipient independently verified?",
                "Is the recipient authorized for this information?",
                "Is only the minimum necessary information included?"
            ],

            guidance:
                "Confirm the recipient, business purpose, minimum required scope and approved transfer route before sharing."
        },

        store: {
            icon: "folder-lock",

            title: "Store",

            copy:
                "Information may remain in collaboration platforms, shared folders, devices, removable media, archives or printed documents.",

            questions: [
                "Is the destination an approved workplace location?",
                "Are access permissions appropriately limited?",
                "Will the information remain longer than necessary?"
            ],

            guidance:
                "Use approved workplace storage and review access, permissions, retention and unnecessary duplicate copies."
        },

        dispose: {
            icon: "archive-x",

            title: "Dispose",

            copy:
                "Information may need to be deleted, archived, returned, anonymized or destroyed when the approved retention period ends.",

            questions: [
                "Is disposal permitted at this stage?",
                "Is the approved deletion or destruction process being used?",
                "Do copies remain in other systems or physical locations?"
            ],

            guidance:
                "Follow organizational retention, deletion, archive and confidential physical-disposal procedures."
        }
    };


    /* =========================================================
       2. PAGE INITIALIZATION
       ========================================================= */

    function initializeDataProtectionPage() {
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

        state.motionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        state.reducedMotion =
            state.motionQuery.matches;

        initializeMotionPreference();
        initializeLifecycleMap();
        initializeScenarioSlider();
        initializeResponseProcess();
        initializeDataChecklist();
        initializeDataFAQ();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        refreshIcons();
        refreshAOS();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:data-protection-ready",
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
        initializeDataProtectionPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeDataProtectionPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializeDataProtectionPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyDataProtectionPage,
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

    function createUniqueId(
        prefix,
        index
    ) {
        return `${prefix}-${index + 1}`;
    }

    function replaceList(
        list,
        values
    ) {
        if (
            !list ||
            !Array.isArray(values)
        ) {
            return;
        }

        list.replaceChildren();

        values.forEach(function (value) {
            const item =
                document.createElement("li");

            item.textContent =
                String(value);

            list.appendChild(item);
        });
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
        if (
            typeof callback === "function"
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

        refreshIcons();
    }


    /* =========================================================
       4. MOTION PREFERENCE
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
        const lifecyclePanel =
            document.querySelector(
                ".data-hero__lifecycle"
            );

        const flow =
            document.querySelector(
                ".data-hero__flow"
            );

        const mark =
            document.querySelector(
                ".data-hero__mark"
            );

        const finalBackground =
            document.querySelector(
                ".data-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".data-final-cta__geometry"
            );

        if (lifecyclePanel) {
            lifecyclePanel.style.transform =
                "";
        }

        if (flow) {
            flow.style.transform = "";
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


    /* =========================================================
       5. INTERACTIVE DATA LIFECYCLE
       ========================================================= */

    function initializeLifecycleMap() {
        const root =
            document.querySelector(
                "[data-data-lifecycle]"
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

        const stages =
            Array.from(
                root.querySelectorAll(
                    "[data-data-stage]"
                )
            );

        const explanation =
            root.querySelector(
                "[data-data-stage-explanation]"
            );

        if (
            !stages.length ||
            !explanation
        ) {
            return;
        }

        const elements = {
            step:
                explanation.querySelector(
                    "[data-data-stage-step]"
                ),

            icon:
                explanation.querySelector(
                    "[data-data-stage-icon]"
                ),

            title:
                explanation.querySelector(
                    "[data-data-stage-title]"
                ),

            copy:
                explanation.querySelector(
                    "[data-data-stage-copy]"
                ),

            questions:
                explanation.querySelector(
                    "[data-data-stage-questions]"
                ),

            guidance:
                explanation.querySelector(
                    "[data-data-stage-guidance]"
                ),

            previous:
                explanation.querySelector(
                    "[data-data-stage-previous]"
                ),

            next:
                explanation.querySelector(
                    "[data-data-stage-next]"
                )
        };

        function activateLifecycleStage(
            index,
            options = {}
        ) {
            const {
                focusStage = false,
                focusExplanation = false
            } = options;

            const safeIndex =
                (
                    index +
                    stages.length
                ) % stages.length;

            const activeStage =
                stages[safeIndex];

            const stageId =
                activeStage.dataset.dataStage;

            const content =
                lifecycleContent[stageId];

            if (!content) {
                return;
            }

            state.lifecycleIndex =
                safeIndex;

            stages.forEach(function (
                stage,
                stageIndex
            ) {
                const active =
                    stageIndex === safeIndex;

                stage.classList.toggle(
                    "is-active",
                    active
                );

                stage.setAttribute(
                    "aria-pressed",
                    String(active)
                );

                stage.tabIndex =
                    active ? 0 : -1;
            });

            setText(
                elements.step,
                `Lifecycle stage ${safeIndex + 1} of ${stages.length}`
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
                elements.guidance,
                content.guidance
            );

            replaceList(
                elements.questions,
                content.questions
            );

            updateLucideIcon(
                elements.icon,
                content.icon
            );

            root.dataset.activeStage =
                stageId;

            explanation.dataset.activeStage =
                stageId;

            root.style.setProperty(
                "--data-lifecycle-progress",
                `${(
                    (safeIndex + 1) /
                    stages.length
                ) * 100
                }%`
            );

            if (focusStage) {
                focusWithoutScroll(
                    activeStage
                );
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
                    "securehabit:data-lifecycle-change",
                    {
                        detail: {
                            index: safeIndex,
                            stageId,
                            content
                        }
                    }
                )
            );
        }

        stages.forEach(function (
            stage,
            index
        ) {
            addEvent(
                stage,
                "click",
                function () {
                    activateLifecycleStage(
                        index
                    );
                }
            );

            addEvent(
                stage,
                "pointerenter",
                function () {
                    const supportsHover =
                        window.matchMedia(
                            "(hover: hover) and (pointer: fine)"
                        ).matches;

                    if (supportsHover) {
                        activateLifecycleStage(
                            index
                        );
                    }
                }
            );

            addEvent(
                stage,
                "focus",
                function () {
                    activateLifecycleStage(
                        index
                    );
                }
            );

            addEvent(
                stage,
                "keydown",
                function (event) {
                    let nextIndex = null;

                    switch (event.key) {
                        case "ArrowRight":
                        case "ArrowDown":
                            nextIndex =
                                (
                                    index + 1
                                ) % stages.length;
                            break;

                        case "ArrowLeft":
                        case "ArrowUp":
                            nextIndex =
                                (
                                    index -
                                    1 +
                                    stages.length
                                ) % stages.length;
                            break;

                        case "Home":
                            nextIndex = 0;
                            break;

                        case "End":
                            nextIndex =
                                stages.length - 1;
                            break;

                        default:
                            return;
                    }

                    event.preventDefault();

                    activateLifecycleStage(
                        nextIndex,
                        {
                            focusStage: true
                        }
                    );
                }
            );
        });

        addEvent(
            elements.previous,
            "click",
            function () {
                activateLifecycleStage(
                    state.lifecycleIndex - 1,
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
                activateLifecycleStage(
                    state.lifecycleIndex + 1,
                    {
                        focusExplanation: true
                    }
                );
            }
        );

        const initialIndex =
            stages.findIndex(
                function (stage) {
                    return (
                        stage.getAttribute(
                            "aria-pressed"
                        ) === "true"
                    );
                }
            );

        activateLifecycleStage(
            initialIndex >= 0
                ? initialIndex
                : 0
        );

        window
            .SecureHabitDataActivateLifecycleStage =
            activateLifecycleStage;
    }


    /* =========================================================
       6. DATA-PROTECTION SCENARIO SLIDER
       ========================================================= */

    function initializeScenarioSlider() {
        const slider =
            document.querySelector(
                "[data-data-scenarios]"
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
                    "[data-data-scenario-slide]"
                )
            );

        const paginationButtons =
            Array.from(
                slider.querySelectorAll(
                    "[data-data-scenario-index]"
                )
            );

        const previousButton =
            document.querySelector(
                "[data-data-scenario-previous]"
            );

        const nextButton =
            document.querySelector(
                "[data-data-scenario-next]"
            );

        const status =
            slider.querySelector(
                "[data-data-scenario-status]"
            );

        if (!slides.length) {
            return;
        }

        let touchStartX = null;
        let touchStartY = null;

        function showScenario(
            index,
            options = {}
        ) {
            const {
                focusPagination = false
            } = options;

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

                slide.tabIndex =
                    active ? 0 : -1;
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

            refreshAOS();

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:data-scenario-change",
                    {
                        detail: {
                            index: safeIndex,
                            title,
                            slide: activeSlide
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
                    event.key === "PageDown"
                ) {
                    event.preventDefault();

                    showScenario(
                        state.scenarioIndex + 1
                    );
                }

                if (
                    event.key === "PageUp"
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
                    touch
                        ? touch.clientX
                        : null;

                touchStartY =
                    touch
                        ? touch.clientY
                        : null;
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
                    touch
                        ? touch.clientX
                        : touchStartX;

                const endY =
                    touch
                        ? touch.clientY
                        : touchStartY;

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
            .SecureHabitDataShowScenario =
            showScenario;
    }


    /* =========================================================
       7. RESPONSE PROCESS
       ========================================================= */

    function initializeResponseProcess() {
        const root =
            document.querySelector(
                "[data-data-response-process]"
            );

        if (!root) {
            return;
        }

        const steps =
            Array.from(
                root.querySelectorAll(
                    "[data-data-response-step]"
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
            "--data-response-progress",
            `${(
                (safeIndex + 1) /
                steps.length
            ) * 100
            }%`
        );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:data-response-change",
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
       8. DATA-HANDLING CHECKLIST
       ========================================================= */

    function initializeDataChecklist() {
        const checklist =
            document.querySelector(
                "[data-data-checklist]"
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
                "[data-data-checklist-count]"
            );

        const progress =
            checklist.querySelector(
                "[data-data-checklist-progress]"
            );

        const progressBar =
            checklist.querySelector(
                "[data-data-checklist-progress] span"
            );

        const resetButton =
            checklist.querySelector(
                "[data-data-checklist-reset]"
            );

        const printButton =
            checklist.querySelector(
                "[data-data-checklist-print]"
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

            if (progress) {
                progress.setAttribute(
                    "aria-valuemax",
                    String(total)
                );

                progress.setAttribute(
                    "aria-valuenow",
                    String(completed)
                );

                progress.setAttribute(
                    "aria-valuetext",
                    `${completed} of ${total} checks completed`
                );
            }

            checklist.dataset.completed =
                String(
                    completed === total
                );

            checklist.dataset.completedCount =
                String(completed);

            checklist.classList.toggle(
                "is-complete",
                completed === total
            );

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:data-checklist-change",
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
                printDataChecklist(
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

    function printDataChecklist(
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
                    "SecureHabit received an invalid data-protection checklist print selector.",
                    error
                );
            }
        }

        clearPrintTarget();

        state.printTarget = target;

        document.body.classList.add(
            "has-print-target"
        );

        if (target) {
            target.classList.add(
                "is-print-target"
            );
        }

        requestFrame(function () {
            window.print();
        });
    }

    function clearPrintTarget() {
        document.body.classList.remove(
            "has-print-target"
        );

        if (state.printTarget) {
            state.printTarget.classList.remove(
                "is-print-target"
            );
        }

        state.printTarget = null;
    }


    /* =========================================================
       9. FAQ
       ========================================================= */

    function initializeDataFAQ() {
        const accordion =
            document.querySelector(
                "[data-data-faq]"
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
                    ".data-faq__item"
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
                    ".data-faq__answer"
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
                    "data-faq-summary",
                    index
                );

            const answerId =
                answer.id ||
                createUniqueId(
                    "data-faq-answer",
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
                            otherItem.open =
                                false;
                        }
                    });

                    synchronizing = false;
                }

                window.dispatchEvent(
                    new CustomEvent(
                        "securehabit:data-faq-toggle",
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


    /* =========================================================
       10. HERO POINTER MOTION
       ========================================================= */

    function initializeHeroMotion() {
        const hero =
            document.querySelector(
                ".data-hero"
            );

        const lifecyclePanel =
            hero
                ? hero.querySelector(
                    ".data-hero__lifecycle"
                )
                : null;

        const flow =
            hero
                ? hero.querySelector(
                    ".data-hero__flow"
                )
                : null;

        const mark =
            hero
                ? hero.querySelector(
                    ".data-hero__mark"
                )
                : null;

        if (
            !hero ||
            (
                !lifecyclePanel &&
                !flow &&
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

            if (lifecyclePanel) {
                lifecyclePanel.style.transform =
                    `translate3d(` +
                    `${currentX * 17}px, ` +
                    `calc(-50% + ${currentY * 13
                    }px), 0) ` +
                    `rotate(3deg)`;
            }

            if (flow) {
                flow.style.transform =
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
                    targetX -
                    currentX
                ) > 0.001 ||
                Math.abs(
                    targetY -
                    currentY
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
       11. FINAL CTA PARALLAX
       ========================================================= */

    function initializeFinalCtaParallax() {
        const section =
            document.querySelector(
                ".data-final-cta"
            );

        const background =
            section
                ? section.querySelector(
                    ".data-final-cta__background"
                )
                : null;

        const geometry =
            section
                ? section.querySelector(
                    ".data-final-cta__geometry"
                )
                : null;

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
            .SecureHabitDataScheduleParallax =
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
                .SecureHabitDataScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitDataScheduleParallax();
        }
    }


    /* =========================================================
       12. SECTION VISIBILITY STATES
       ========================================================= */

    function initializeSectionStates() {
        const sections =
            Array.from(
                document.querySelectorAll(
                    [
                        ".data-overview",
                        ".data-lifecycle",
                        ".data-categories",
                        ".data-scenarios",
                        ".data-response",
                        ".data-checklist",
                        ".data-faq",
                        ".data-final-cta"
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
       13. CLEANUP
       ========================================================= */

    function destroyDataProtectionPage() {
        if (state.processObserver) {
            state.processObserver.disconnect();
        }

        if (state.sectionObserver) {
            state.sectionObserver.disconnect();
        }

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
                        "SecureHabit could not remove a Data Protection event listener.",
                        error
                    );
                }
            }
        );

        delete window
            .SecureHabitDataActivateLifecycleStage;

        delete window
            .SecureHabitDataShowScenario;

        delete window
            .SecureHabitDataScheduleParallax;

        state.cleanupCallbacks = [];
        state.processObserver = null;
        state.sectionObserver = null;
        state.heroFrame = null;
        state.parallaxFrame = null;
        state.resizeFrame = null;
        state.initialized = false;
    }


    /* =========================================================
       14. PUBLIC PAGE API
       ========================================================= */

    window.SecureHabitDataProtection =
        Object.freeze({
            showLifecycleStage:
                function (index) {
                    if (
                        typeof window
                            .SecureHabitDataActivateLifecycleStage ===
                        "function"
                    ) {
                        window
                            .SecureHabitDataActivateLifecycleStage(
                                Number(index)
                            );
                    }
                },

            showScenario:
                function (index) {
                    if (
                        typeof window
                            .SecureHabitDataShowScenario ===
                        "function"
                    ) {
                        window
                            .SecureHabitDataShowScenario(
                                Number(index)
                            );
                    }
                },

            resetChecklist:
                function () {
                    const button =
                        document.querySelector(
                            "[data-data-checklist-reset]"
                        );

                    if (button) {
                        button.click();
                    }
                },

            printChecklist:
                function () {
                    const button =
                        document.querySelector(
                            "[data-data-checklist-print]"
                        );

                    if (button) {
                        button.click();
                    }
                },

            refreshParallax:
                scheduleFinalCtaParallax,

            refreshIcons:
                refreshIcons,

            destroy:
                destroyDataProtectionPage
        });
})();