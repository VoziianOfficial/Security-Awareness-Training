




(function () {
    "use strict";

    const PAGE_ID = "training-topics";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,
        heroFrame: null,
        parallaxFrame: null,
        sectionObserver: null,
        resizeFrame: null,
        cleanupCallbacks: []
    };


    



    const threatMappings = {
        email: {
            sourceIcon: "mail-question",
            sourceTitle: "Unexpected email",
            sourceDescription:
                "A message arrives without context and asks for an immediate response.",

            habitIcon: "badge-check",
            habitTitle: "Pause and verify",
            habitDescription:
                "Confirm the sender and request through an approved independent channel before continuing.",

            href: "phishing-awareness.html"
        },

        password: {
            sourceIcon: "key-round",
            sourceTitle: "Password request",
            sourceDescription:
                "A message or caller asks you to reveal, reset or enter an account password.",

            habitIcon: "shield-check",
            habitTitle: "Use the approved account process",
            habitDescription:
                "Open the approved service independently and follow the organization’s normal sign-in or recovery procedure.",

            href: "password-security.html"
        },

        file: {
            sourceIcon: "file-question",
            sourceTitle: "Sensitive file",
            sourceDescription:
                "A document needs to be shared, but its classification, recipient or access requirements may be unclear.",

            habitIcon: "file-check-2",
            habitTitle: "Confirm access before sharing",
            habitDescription:
                "Review the information, intended recipient and approved sharing method before granting access.",

            href: "data-protection-basics.html"
        },

        remote: {
            sourceIcon: "wifi",
            sourceTitle: "Remote connection",
            sourceDescription:
                "Work must continue from another location, device or network outside the usual workplace.",

            habitIcon: "laptop-minimal-check",
            habitTitle: "Follow the approved remote-work route",
            habitDescription:
                "Use company-approved devices, connections, updates and privacy procedures for work away from the office.",

            href: "safe-remote-work.html"
        },

        visitor: {
            sourceIcon: "user-round-question",
            sourceTitle: "Unusual visitor",
            sourceDescription:
                "Someone uses familiarity, authority or urgency to request access, information or assistance.",

            habitIcon: "user-round-check",
            habitTitle: "Verify identity and authorization",
            habitDescription:
                "Use the organization’s normal verification process before providing access, information or assistance.",

            href: "social-engineering-awareness.html"
        }
    };


    



    const treeResults = {
        pause: {
            icon: "circle-pause",
            title: "Pause and ask before sharing",
            copy:
                "One or more parts of the decision are unclear or use an unapproved route. Do not continue until the information, recipient and sharing method have been confirmed through the appropriate internal process."
        },

        confirm: {
            icon: "shield-question",
            title: "Confirm approval before sharing",
            copy:
                "The information or recipient may require additional authorization. Verify access, approval and the approved sharing method before continuing."
        },

        internal: {
            icon: "building-2",
            title: "Use the approved internal sharing route",
            copy:
                "The decision appears to involve authorized internal sharing. Confirm the recipient and use the organization’s approved tool, access settings and handling procedure."
        },

        public: {
            icon: "circle-check-big",
            title: "The proposed route appears appropriate",
            copy:
                "The information is intended for public distribution, the recipient is appropriate and the sharing method is approved. Complete a final recipient and content review before sending."
        }
    };


    



    function initializeTrainingTopicsPage() {
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

        initializeAccessibleTabs({
            rootSelector: "[data-topic-selector]",
            tabSelector: "[data-topic-tab]",
            panelSelector: "[data-topic-panel]",
            tabDataKey: "topicTab",
            panelDataKey: "topicPanel",
            eventName: "securehabit:topic-change"
        });

        initializeAccessibleTabs({
            rootSelector: "[data-role-paths]",
            tabSelector: "[data-role-tab]",
            panelSelector: "[data-role-panel]",
            tabDataKey: "roleTab",
            panelDataKey: "rolePanel",
            eventName: "securehabit:role-path-change"
        });

        initializeThreatMapping();
        initializeDecisionTree();
        initializeTopicsFAQ();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        window.SecureHabit?.refreshIcons?.();
        window.SecureHabit?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:training-topics-ready",
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
        initializeTrainingTopicsPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeTrainingTopicsPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializeTrainingTopicsPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyTrainingTopicsPage,
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

    function setText(element, value) {
        if (!element) {
            return;
        }

        element.textContent = String(value ?? "");
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

    function replaceLucideIcon(
        host,
        iconName
    ) {
        if (!host || !iconName) {
            return;
        }

        host.innerHTML = "";

        const icon =
            document.createElement("i");

        icon.setAttribute(
            "data-lucide",
            iconName
        );

        icon.setAttribute(
            "aria-hidden",
            "true"
        );

        host.appendChild(icon);
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
        const heroMark =
            document.querySelector(
                ".topics-hero__mark"
            );

        const heroNetwork =
            document.querySelector(
                ".topics-hero__network"
            );

        const finalBackground =
            document.querySelector(
                ".topics-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".topics-final-cta__geometry"
            );

        if (heroMark) {
            heroMark.style.transform = "";
        }

        if (heroNetwork) {
            heroNetwork.style.transform = "";
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


    



    function initializeAccessibleTabs({
        rootSelector,
        tabSelector,
        panelSelector,
        tabDataKey,
        panelDataKey,
        eventName
    }) {
        const root =
            document.querySelector(
                rootSelector
            );

        if (
            !root ||
            root.dataset.tabsInitialized ===
            "true"
        ) {
            return;
        }

        const tabs = Array.from(
            root.querySelectorAll(
                tabSelector
            )
        );

        const panels = Array.from(
            root.querySelectorAll(
                panelSelector
            )
        );

        if (!tabs.length || !panels.length) {
            return;
        }

        root.dataset.tabsInitialized = "true";

        function activateTab(
            value,
            {
                focusTab = false,
                focusPanel = false
            } = {}
        ) {
            const activeTab = tabs.find(
                function (tab) {
                    return tab.dataset[tabDataKey] ===
                        value;
                }
            );

            const activePanel = panels.find(
                function (panel) {
                    return panel.dataset[
                        panelDataKey
                    ] === value;
                }
            );

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

                tab.tabIndex = active ? 0 : -1;
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

            root.dataset.activeTab = value;

            if (focusTab) {
                focusWithoutScroll(activeTab);
            }

            if (focusPanel) {
                requestFrame(function () {
                    activePanel.focus();
                });
            }

            window.SecureHabit?.refreshAOS?.();

            window.dispatchEvent(
                new CustomEvent(eventName, {
                    detail: {
                        value,
                        tab: activeTab,
                        panel: activePanel
                    }
                })
            );
        }

        tabs.forEach(function (tab, index) {
            const value =
                tab.dataset[tabDataKey];

            addEvent(
                tab,
                "click",
                function () {
                    activateTab(value);
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

                    const nextTab =
                        tabs[nextIndex];

                    activateTab(
                        nextTab.dataset[tabDataKey],
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

        activateTab(
            selectedTab.dataset[tabDataKey]
        );
    }


    



    function initializeThreatMapping() {
        const panel =
            document.querySelector(
                "[data-threat-panel]"
            );

        const controlsRoot =
            document.querySelector(
                "[data-threat-controls]"
            );

        if (!panel || !controlsRoot) {
            return;
        }

        const buttons = Array.from(
            controlsRoot.querySelectorAll(
                "[data-threat-id]"
            )
        );

        if (!buttons.length) {
            return;
        }

        const elements = {
            sourceIconHost:
                panel.querySelector(
                    ".topics-mapping__source-icon"
                ),

            sourceTitle:
                panel.querySelector(
                    "[data-threat-title]"
                ),

            sourceDescription:
                panel.querySelector(
                    "[data-threat-description]"
                ),

            habitIconHost:
                panel.querySelector(
                    ".topics-mapping__habit-icon"
                ),

            habitTitle:
                panel.querySelector(
                    "[data-habit-title]"
                ),

            habitDescription:
                panel.querySelector(
                    "[data-habit-description]"
                ),

            habitLink:
                panel.querySelector(
                    "[data-habit-link]"
                )
        };

        function activateThreat(
            threatId,
            {
                focusButton = false
            } = {}
        ) {
            const mapping =
                threatMappings[threatId];

            if (!mapping) {
                return;
            }

            const activeButton =
                buttons.find(
                    function (button) {
                        return (
                            button.dataset.threatId ===
                            threatId
                        );
                    }
                );

            buttons.forEach(function (button) {
                const active =
                    button === activeButton;

                button.classList.toggle(
                    "is-active",
                    active
                );

                button.setAttribute(
                    "aria-selected",
                    String(active)
                );

                button.tabIndex = active ? 0 : -1;
            });

            replaceLucideIcon(
                elements.sourceIconHost,
                mapping.sourceIcon
            );

            replaceLucideIcon(
                elements.habitIconHost,
                mapping.habitIcon
            );

            setText(
                elements.sourceTitle,
                mapping.sourceTitle
            );

            setText(
                elements.sourceDescription,
                mapping.sourceDescription
            );

            setText(
                elements.habitTitle,
                mapping.habitTitle
            );

            setText(
                elements.habitDescription,
                mapping.habitDescription
            );

            if (elements.habitLink) {
                elements.habitLink.href =
                    mapping.href;
            }

            if (activeButton?.id) {
                panel.setAttribute(
                    "aria-labelledby",
                    activeButton.id
                );
            }

            panel.dataset.activeThreat =
                threatId;

            window.SecureHabit?.refreshIcons?.();

            if (focusButton) {
                focusWithoutScroll(activeButton);
            }

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:threat-mapping-change",
                    {
                        detail: {
                            threatId,
                            mapping
                        }
                    }
                )
            );
        }

        buttons.forEach(function (button, index) {
            addEvent(
                button,
                "click",
                function () {
                    activateThreat(
                        button.dataset.threatId
                    );
                }
            );

            addEvent(
                button,
                "pointerenter",
                function () {
                    const supportsHover =
                        window.matchMedia(
                            "(hover: hover)"
                        ).matches;

                    if (supportsHover) {
                        activateThreat(
                            button.dataset.threatId
                        );
                    }
                }
            );

            addEvent(
                button,
                "focus",
                function () {
                    activateThreat(
                        button.dataset.threatId
                    );
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
                                buttons.length;
                            break;

                        case "ArrowLeft":
                        case "ArrowUp":
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

                    activateThreat(
                        buttons[nextIndex]
                            .dataset.threatId,
                        {
                            focusButton: true
                        }
                    );
                }
            );
        });

        activateThreat("email");
    }


    



    function initializeDecisionTree() {
        const root =
            document.querySelector(
                "[data-decision-tree]"
            );

        if (
            !root ||
            root.dataset.treeInitialized ===
            "true"
        ) {
            return;
        }

        root.dataset.treeInitialized = "true";

        const steps = Array.from(
            root.querySelectorAll(
                "[data-tree-step]"
            )
        ).sort(function (first, second) {
            return (
                Number(
                    first.dataset.stepIndex
                ) -
                Number(
                    second.dataset.stepIndex
                )
            );
        });

        if (!steps.length) {
            return;
        }

        const elements = {
            counter:
                root.querySelector(
                    "[data-tree-counter]"
                ),

            progress:
                root.querySelector(
                    "[data-tree-progress]"
                ),

            progressBar:
                root.querySelector(
                    "[data-tree-progress] span"
                ),

            stepsContainer:
                root.querySelector(
                    "[data-tree-steps]"
                ),

            result:
                root.querySelector(
                    "[data-tree-result]"
                ),

            resultIconHost:
                root.querySelector(
                    ".topics-tree__result-icon"
                ),

            resultTitle:
                root.querySelector(
                    "[data-tree-result-title]"
                ),

            resultCopy:
                root.querySelector(
                    "[data-tree-result-copy]"
                ),

            navigation:
                root.querySelector(
                    ".topics-tree__navigation"
                ),

            backButton:
                root.querySelector(
                    "[data-tree-back]"
                ),

            resetButton:
                root.querySelector(
                    "[data-tree-reset]"
                ),

            restartButton:
                root.querySelector(
                    "[data-tree-restart]"
                )
        };

        const treeState = {
            currentIndex: 0,
            answers:
                new Array(steps.length).fill(null),
            transitionTimer: null
        };

        function showStep(
            index,
            {
                focusAnswer = false
            } = {}
        ) {
            const safeIndex = clamp(
                index,
                0,
                steps.length - 1
            );

            treeState.currentIndex =
                safeIndex;

            elements.result.hidden = true;
            elements.stepsContainer.hidden = false;
            elements.navigation.hidden = false;

            steps.forEach(function (step, stepIndex) {
                const active =
                    stepIndex === safeIndex;

                step.hidden = !active;

                step.classList.toggle(
                    "is-active",
                    active
                );

                step.setAttribute(
                    "aria-hidden",
                    String(!active)
                );

                const answerButtons =
                    Array.from(
                        step.querySelectorAll(
                            "[data-tree-answer]"
                        )
                    );

                answerButtons.forEach(
                    function (button) {
                        const selected =
                            treeState.answers[stepIndex] ===
                            button.dataset.treeAnswer;

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
            });

            const stepNumber =
                safeIndex + 1;

            setText(
                elements.counter,
                `Step ${stepNumber} of ${steps.length}`
            );

            const percentage =
                (
                    stepNumber /
                    steps.length
                ) * 100;

            if (elements.progressBar) {
                elements.progressBar.style.width =
                    `${percentage}%`;
            }

            elements.progress?.setAttribute(
                "aria-valuenow",
                String(stepNumber)
            );

            if (elements.backButton) {
                elements.backButton.disabled =
                    safeIndex === 0;
            }

            root.dataset.activeStep =
                String(stepNumber);

            if (focusAnswer) {
                const activeStep =
                    steps[safeIndex];

                const selectedAnswer =
                    activeStep.querySelector(
                        ".is-selected[data-tree-answer]"
                    );

                const firstAnswer =
                    activeStep.querySelector(
                        "[data-tree-answer]"
                    );

                requestFrame(function () {
                    focusWithoutScroll(
                        selectedAnswer ||
                        firstAnswer
                    );
                });
            }
        }

        function selectAnswer(
            stepIndex,
            button
        ) {
            if (!button) {
                return;
            }

            const answer =
                button.dataset.treeAnswer;

            treeState.answers[stepIndex] =
                answer;

            const step =
                steps[stepIndex];

            step
                .querySelectorAll(
                    "[data-tree-answer]"
                )
                .forEach(function (answerButton) {
                    const selected =
                        answerButton === button;

                    answerButton.classList.toggle(
                        "is-selected",
                        selected
                    );

                    answerButton.setAttribute(
                        "aria-pressed",
                        String(selected)
                    );
                });

            if (treeState.transitionTimer) {
                window.clearTimeout(
                    treeState.transitionTimer
                );
            }

            const delay =
                state.reducedMotion
                    ? 0
                    : 220;

            treeState.transitionTimer =
                window.setTimeout(
                    function () {
                        treeState.transitionTimer =
                            null;

                        const isLastStep =
                            stepIndex ===
                            steps.length - 1;

                        if (isLastStep) {
                            showTreeResult();
                            return;
                        }

                        showStep(
                            stepIndex + 1,
                            {
                                focusAnswer: true
                            }
                        );
                    },
                    delay
                );
        }

        function showTreeResult() {
            const resultType =
                evaluateTreeAnswers(
                    treeState.answers
                );

            const result =
                treeResults[resultType];

            elements.stepsContainer.hidden = true;
            elements.navigation.hidden = true;
            elements.result.hidden = false;

            setText(
                elements.counter,
                "Decision review complete"
            );

            if (elements.progressBar) {
                elements.progressBar.style.width =
                    "100%";
            }

            elements.progress?.setAttribute(
                "aria-valuenow",
                String(steps.length)
            );

            replaceLucideIcon(
                elements.resultIconHost,
                result.icon
            );

            setText(
                elements.resultTitle,
                result.title
            );

            setText(
                elements.resultCopy,
                result.copy
            );

            window.SecureHabit?.refreshIcons?.();

            requestFrame(function () {
                elements.result.focus();
            });

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:decision-tree-complete",
                    {
                        detail: {
                            answers:
                                treeState.answers.slice(),
                            resultType
                        }
                    }
                )
            );
        }

        function goBack() {
            if (treeState.transitionTimer) {
                window.clearTimeout(
                    treeState.transitionTimer
                );

                treeState.transitionTimer =
                    null;
            }

            if (treeState.currentIndex <= 0) {
                return;
            }

            showStep(
                treeState.currentIndex - 1,
                {
                    focusAnswer: true
                }
            );
        }

        function resetTree() {
            if (treeState.transitionTimer) {
                window.clearTimeout(
                    treeState.transitionTimer
                );

                treeState.transitionTimer =
                    null;
            }

            treeState.answers.fill(null);

            steps.forEach(function (step) {
                step
                    .querySelectorAll(
                        "[data-tree-answer]"
                    )
                    .forEach(function (button) {
                        button.classList.remove(
                            "is-selected"
                        );

                        button.setAttribute(
                            "aria-pressed",
                            "false"
                        );
                    });
            });

            showStep(0, {
                focusAnswer: true
            });

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:decision-tree-reset"
                )
            );
        }

        steps.forEach(function (step, stepIndex) {
            const answerButtons =
                Array.from(
                    step.querySelectorAll(
                        "[data-tree-answer]"
                    )
                );

            answerButtons.forEach(
                function (button) {
                    button.setAttribute(
                        "aria-pressed",
                        "false"
                    );

                    addEvent(
                        button,
                        "click",
                        function () {
                            selectAnswer(
                                stepIndex,
                                button
                            );
                        }
                    );
                }
            );
        });

        addEvent(
            elements.backButton,
            "click",
            goBack
        );

        addEvent(
            elements.resetButton,
            "click",
            resetTree
        );

        addEvent(
            elements.restartButton,
            "click",
            resetTree
        );

        registerCleanup(function () {
            if (treeState.transitionTimer) {
                window.clearTimeout(
                    treeState.transitionTimer
                );
            }
        });

        showStep(0);
    }

    function evaluateTreeAnswers(answers) {
        const [
            information,
            recipient,
            method
        ] = answers;

        const containsUncertainty =
            information === "unknown" ||
            recipient === "uncertain" ||
            method === "unapproved" ||
            method === "method-unknown";

        if (containsUncertainty) {
            return "pause";
        }

        const needsAdditionalApproval =
            information === "sensitive" ||
            recipient === "external";

        if (needsAdditionalApproval) {
            return "confirm";
        }

        if (
            information === "public" &&
            recipient === "authorized" &&
            method === "approved"
        ) {
            return "public";
        }

        return "internal";
    }


    



    function initializeTopicsFAQ() {
        const accordion =
            document.querySelector(
                "[data-topics-faq]"
            );

        if (
            !accordion ||
            accordion.dataset.initialized ===
            "true"
        ) {
            return;
        }

        accordion.dataset.initialized = "true";

        const items = Array.from(
            accordion.querySelectorAll(
                ".topics-faq__item"
            )
        );

        if (!items.length) {
            return;
        }

        items.forEach(function (item, index) {
            const summary =
                item.querySelector("summary");

            const answer =
                item.querySelector(
                    ".topics-faq__answer"
                );

            if (!summary || !answer) {
                return;
            }

            const summaryId =
                summary.id ||
                createUniqueId(
                    "topics-faq-summary",
                    index
                );

            const answerId =
                answer.id ||
                createUniqueId(
                    "topics-faq-answer",
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

            const updateItem = function () {
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
                    items.forEach(function (otherItem) {
                        if (
                            otherItem !== item &&
                            otherItem.open
                        ) {
                            otherItem.open = false;
                        }
                    });
                }
            };

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
                ".topics-hero"
            );

        const mark =
            hero?.querySelector(
                ".topics-hero__mark"
            );

        const network =
            hero?.querySelector(
                ".topics-hero__network"
            );

        if (!hero || !mark) {
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
                (targetX - currentX) * 0.075;

            currentY +=
                (targetY - currentY) * 0.075;

            mark.style.transform =
                `translate3d(${currentX * 18
                }px, calc(-50% + ${currentY * 14
                }px), 0) rotate(8deg)`;

            if (network) {
                network.style.transform =
                    `translate3d(${currentX * -10
                    }px, ${currentY * -8
                    }px, 0)`;
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
                ".topics-final-cta"
            );

        const background =
            section?.querySelector(
                ".topics-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".topics-final-cta__geometry"
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

        window.SecureHabitTopicsScheduleParallax =
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
                .SecureHabitTopicsScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitTopicsScheduleParallax();
        }
    }


    



    function initializeSectionStates() {
        const sections = Array.from(
            document.querySelectorAll(
                [
                    ".topics-selector",
                    ".topics-mosaic",
                    ".topics-roles",
                    ".topics-mapping",
                    ".topics-comparison",
                    ".topics-tree",
                    ".topics-faq",
                    ".topics-final-cta"
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


    



    function destroyTrainingTopicsPage() {
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
                        "SecureHabit could not remove a Training Topics event listener.",
                        error
                    );
                }
            }
        );

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    



    window.SecureHabitTrainingTopics =
        Object.freeze({
            refreshIcons: function () {
                window.SecureHabit?.refreshIcons?.();
            },

            refreshParallax:
                scheduleFinalCtaParallax,

            destroy:
                destroyTrainingTopicsPage
        });
})();
