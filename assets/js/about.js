




(function () {
    "use strict";

    const PAGE_ID = "about";

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


    



    function initializeAboutPage() {
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
        initializeInquiryProcess();
        initializeQualityAccordion();
        initializeHeroGeometry();
        initializeFinalCtaParallax();
        initializeSectionStates();

        window.SecureHabit?.refreshIcons?.();
        window.SecureHabit?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent("securehabit:about-ready", {
                detail: {
                    page: PAGE_ID
                }
            })
        );
    }

    window.addEventListener(
        "securehabit:ready",
        initializeAboutPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeAboutPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializeAboutPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyAboutPage,
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
        return window.requestAnimationFrame(callback);
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
            state.cleanupCallbacks.push(callback);
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

        const handleMotionChange = function (event) {
            state.reducedMotion = event.matches;

            if (state.reducedMotion) {
                resetMotionStyles();
            } else {
                scheduleFinalCtaParallax();
            }
        };

        if (
            typeof state.motionQuery.addEventListener ===
            "function"
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
            typeof state.motionQuery.addListener ===
            "function"
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
        const heroGeometry =
            document.querySelector(
                ".about-hero__geometry"
            );

        const finalBackground =
            document.querySelector(
                ".about-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".about-final-cta__geometry"
            );

        if (heroGeometry) {
            heroGeometry.style.transform = "";
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


    



    function initializeInquiryProcess() {
        const root = document.querySelector(
            "[data-about-process]"
        );

        if (!root) {
            return;
        }

        const steps = Array.from(
            root.querySelectorAll(
                "[data-about-process-step]"
            )
        );

        if (!steps.length) {
            return;
        }

        steps.forEach(function (step, index) {
            step.dataset.processIndex =
                String(index);

            step.setAttribute(
                "aria-current",
                index === 0 ? "step" : "false"
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
            initializeProcessScrollFallback(
                root,
                steps
            );

            return;
        }

        state.processObserver =
            new IntersectionObserver(
                function (entries) {
                    const visibleEntries = entries
                        .filter(function (entry) {
                            return entry.isIntersecting;
                        })
                        .sort(function (first, second) {
                            return (
                                second.intersectionRatio -
                                first.intersectionRatio
                            );
                        });

                    if (!visibleEntries.length) {
                        return;
                    }

                    const activeElement =
                        visibleEntries[0].target;

                    const activeIndex =
                        steps.indexOf(activeElement);

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
                        "-24% 0px -48% 0px",
                    threshold: [
                        0.12,
                        0.25,
                        0.45,
                        0.65,
                        0.82
                    ]
                }
            );

        steps.forEach(function (step) {
            state.processObserver.observe(step);
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

        steps.forEach(function (step, index) {
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
                active ? "step" : "false"
            );
        });

        root.dataset.activeStep =
            String(safeIndex + 1);

        root.style.setProperty(
            "--about-process-progress",
            `${((safeIndex + 1) / steps.length) *
            100
            }%`
        );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:about-process-change",
                {
                    detail: {
                        activeIndex: safeIndex,
                        activeStep:
                            steps[safeIndex],
                        totalSteps: steps.length
                    }
                }
            )
        );
    }

    function initializeProcessScrollFallback(
        root,
        steps
    ) {
        let frame = null;

        const update = function () {
            frame = null;

            const viewportTarget =
                window.innerHeight * 0.42;

            let nearestIndex = 0;
            let nearestDistance =
                Number.POSITIVE_INFINITY;

            steps.forEach(function (step, index) {
                const rect =
                    step.getBoundingClientRect();

                const stepCenter =
                    rect.top + rect.height / 2;

                const distance = Math.abs(
                    stepCenter - viewportTarget
                );

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            });

            setActiveProcessStep(
                root,
                steps,
                nearestIndex
            );
        };

        const scheduleUpdate = function () {
            if (frame) {
                return;
            }

            frame = requestFrame(update);
        };

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
                window.cancelAnimationFrame(frame);
            }
        });
    }


    



    function initializeQualityAccordion() {
        const accordion =
            document.querySelector(
                ".about-quality__accordion"
            );

        if (!accordion) {
            return;
        }

        if (
            accordion.dataset.initialized ===
            "true"
        ) {
            return;
        }

        accordion.dataset.initialized = "true";

        const items = Array.from(
            accordion.querySelectorAll(
                ".about-quality__item"
            )
        );

        items.forEach(function (item, index) {
            const summary =
                item.querySelector("summary");

            const answer =
                item.querySelector(
                    ".about-quality__answer"
                );

            if (!summary || !answer) {
                return;
            }

            const summaryId =
                summary.id ||
                createUniqueId(
                    "quality-summary",
                    index
                );

            const answerId =
                answer.id ||
                createUniqueId(
                    "quality-answer",
                    index
                );

            summary.id = summaryId;
            answer.id = answerId;

            summary.setAttribute(
                "aria-controls",
                answerId
            );

            summary.setAttribute(
                "aria-expanded",
                String(item.open)
            );

            answer.setAttribute(
                "role",
                "region"
            );

            answer.setAttribute(
                "aria-labelledby",
                summaryId
            );

            answer.setAttribute(
                "aria-hidden",
                String(!item.open)
            );

            const handleToggle = function () {
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
                    closeOtherQualityItems(
                        items,
                        item
                    );
                }

                window.dispatchEvent(
                    new CustomEvent(
                        "securehabit:quality-toggle",
                        {
                            detail: {
                                item,
                                open: item.open,
                                index
                            }
                        }
                    )
                );
            };

            addEvent(
                item,
                "toggle",
                handleToggle
            );

            handleToggle();
        });

        const openItem = items.find(function (item) {
            return item.open;
        });

        if (!openItem && items[0]) {
            items[0].open = true;
        }
    }

    function closeOtherQualityItems(
        items,
        activeItem
    ) {
        items.forEach(function (item) {
            if (
                item !== activeItem &&
                item.open
            ) {
                item.open = false;
            }
        });
    }


    



    function initializeHeroGeometry() {
        const hero =
            document.querySelector(
                ".about-hero"
            );

        const geometry =
            hero?.querySelector(
                ".about-hero__geometry"
            );

        if (!hero || !geometry) {
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

        const render = function () {
            state.heroFrame = null;

            if (state.reducedMotion) {
                geometry.style.transform = "";
                return;
            }

            currentX +=
                (targetX - currentX) * 0.08;

            currentY +=
                (targetY - currentY) * 0.08;

            geometry.style.transform =
                `translate3d(${currentX * 18
                }px, ${currentY * 13
                }px, 0)`;

            const unfinished =
                Math.abs(targetX - currentX) >
                0.001 ||
                Math.abs(targetY - currentY) >
                0.001;

            if (unfinished) {
                state.heroFrame =
                    requestFrame(render);
            }
        };

        const scheduleRender = function () {
            if (
                state.heroFrame ||
                state.reducedMotion
            ) {
                return;
            }

            state.heroFrame =
                requestFrame(render);
        };

        const handlePointerMove = function (event) {
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
        };

        const resetPointer = function () {
            targetX = 0;
            targetY = 0;

            scheduleRender();
        };

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
                ".about-final-cta"
            );

        const background =
            section?.querySelector(
                ".about-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".about-final-cta__geometry"
            );

        if (!section || !background) {
            return;
        }

        const update = function () {
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
                -25,
                25
            );

            background.style.transform =
                `translate3d(0, ${backgroundOffset
                }px, 0) scale(1.09)`;

            if (geometry) {
                geometry.style.transform =
                    `translate3d(0, calc(-50% + ${geometryOffset
                    }px), 0) rotate(8deg)`;
            }
        };

        const scheduleUpdate = function () {
            if (
                state.parallaxFrame ||
                state.reducedMotion
            ) {
                return;
            }

            state.parallaxFrame =
                requestFrame(update);
        };

        window.SecureHabitAboutScheduleParallax =
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
            typeof
            window
                .SecureHabitAboutScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitAboutScheduleParallax();
        }
    }


    



    function initializeSectionStates() {
        const sections = Array.from(
            document.querySelectorAll(
                [
                    ".about-story",
                    ".about-definition",
                    ".about-mission",
                    ".about-people",
                    ".about-principles",
                    ".about-inquiries",
                    ".about-quality",
                    ".about-collaboration",
                    ".about-final-cta"
                ].join(",")
            )
        );

        if (!sections.length) {
            return;
        }

        if (
            !("IntersectionObserver" in window)
        ) {
            sections.forEach(function (section) {
                section.classList.add(
                    "is-in-view"
                );
            });

            return;
        }

        state.sectionObserver =
            new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        entry.target.classList.toggle(
                            "is-in-view",
                            entry.isIntersecting
                        );

                        if (entry.isIntersecting) {
                            entry.target.dataset.hasEntered =
                                "true";
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
            state.sectionObserver.observe(section);
        });
    }


    



    function destroyAboutPage() {
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
                        "SecureHabit could not remove an About page event listener.",
                        error
                    );
                }
            }
        );

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    



    window.SecureHabitAbout =
        Object.freeze({
            refreshProcess: function () {
                const root =
                    document.querySelector(
                        "[data-about-process]"
                    );

                const steps = root
                    ? Array.from(
                        root.querySelectorAll(
                            "[data-about-process-step]"
                        )
                    )
                    : [];

                if (root && steps.length) {
                    const activeIndex =
                        steps.findIndex(function (step) {
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
                }
            },

            refreshParallax:
                scheduleFinalCtaParallax,

            destroy:
                destroyAboutPage
        });
})();