/* =========================================================
   SECUREHABIT — SOCIAL ENGINEERING AWARENESS PAGE
   File: assets/js/social-engineering-awareness.js
   ========================================================= */

(function () {
    "use strict";

    const PAGE_ID = "social-engineering-awareness";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,

        channelIndex: 0,
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
       1. COMMUNICATION CHANNEL CONTENT
       ========================================================= */

    const channelContent = {
        email: {
            icon: "mail",

            title: "Email",

            copy:
                "Email can combine a familiar display name, copied branding, realistic project details and a link or attachment.",

            review: [
                "Complete sender and reply-to addresses",
                "Expected context and timing",
                "Links, files and requested actions"
            ],

            guidance:
                "Open the known workplace system or contact the person through an approved route separate from the email."
        },

        phone: {
            icon: "phone-call",

            title: "Phone",

            copy:
                "A caller may sound confident, reference real company details or display a familiar number without proving their identity.",

            review: [
                "Whether the call was expected",
                "What information or action is requested",
                "Whether the displayed number is independently known"
            ],

            guidance:
                "End the call when necessary and contact the person or team through an approved directory or internal support route."
        },

        chat: {
            icon: "message-circle",

            title: "Workplace chat",

            copy:
                "A workplace chat account may appear inside an existing conversation and still contain an unusual request involving access, files or money.",

            review: [
                "Whether the account belongs to the expected person",
                "Whether the request matches the person’s normal role",
                "Whether the request bypasses an established process"
            ],

            guidance:
                "Verify the request using another approved channel, especially when it involves sensitive information, authentication or payments."
        },

        video: {
            icon: "video",

            title: "Video meeting",

            copy:
                "An unexpected meeting link, unfamiliar attendee or unusual request during a call can create pressure to respond immediately.",

            review: [
                "Meeting organizer and participant identities",
                "Whether the meeting was expected",
                "Any request involving access, files or confidential information"
            ],

            guidance:
                "Use the approved meeting platform and independently confirm unusual participants or requests before sharing information."
        },

        text: {
            icon: "message-square-text",

            title: "Text message",

            copy:
                "A text message may appear in an existing thread or use a familiar displayed name while requesting an urgent workplace action.",

            review: [
                "Whether the number is independently known",
                "Whether the request fits normal workplace communication",
                "Links, codes, payments or account changes"
            ],

            guidance:
                "Contact the person through a known workplace channel instead of relying only on the number or message thread."
        },

        "in-person": {
            icon: "user-round",

            title: "In-person interaction",

            copy:
                "A visitor, delivery person, contractor or confident colleague may request physical access, information or help with a workplace system.",

            review: [
                "Identification and visitor authorization",
                "The area or information being requested",
                "Whether escort and access procedures are being followed"
            ],

            guidance:
                "Use the organization’s visitor, identification and physical-access procedures rather than relying on familiarity or confidence."
        }
    };


    /* =========================================================
       2. WORKPLACE SCENARIO CONTENT
       ========================================================= */

    const scenarioContent = {
        "support-call": {
            tabId: "social-scenario-tab-1",

            title:
                "A caller claims to be technical support",

            channel:
                "Phone request",

            channelIcon:
                "phone-call",

            image:
                "assets/images/social-scenario-support-call.webp",

            imageAlt:
                "Employee reviewing a fictional technical-support phone request",

            copy:
                "The caller knows the employee’s name and department and says an urgent account problem requires an authentication code.",

            quote:
                "“Read the code to me now so I can keep your account from being disabled.”",

            review: [
                "Whether support initiated the call",
                "Whether support would request the code",
                "Whether the account issue exists"
            ],

            guidance:
                "End the call and contact support using the approved internal channel or known directory information.",

            decisions: {
                comply: {
                    correct: false,

                    title:
                        "Do not provide authentication codes",

                    copy:
                        "A caller’s confidence, technical language or knowledge of workplace details does not verify identity. Authentication codes should be handled according to organizational policy."
                },

                verify: {
                    correct: true,

                    title:
                        "Verify through the approved support route",

                    copy:
                        "End the unexpected call and contact support independently through a known workplace route before taking further action."
                }
            }
        },

        "executive-chat": {
            tabId: "social-scenario-tab-2",

            title:
                "A senior leader sends an urgent chat request",

            channel:
                "Workplace chat",

            channelIcon:
                "message-circle",

            image:
                "assets/images/social-scenario-executive-chat.webp",

            imageAlt:
                "Employee reviewing a fictional executive request in workplace chat",

            copy:
                "A chat account using a senior leader’s name asks the employee to purchase gift cards for a confidential customer matter.",

            quote:
                "“Do not call me. I am in a meeting. Send the card numbers here when finished.”",

            review: [
                "Whether the account belongs to the senior leader",
                "Whether this task fits the employee’s responsibilities",
                "Whether the request follows purchasing procedure"
            ],

            guidance:
                "Use a known contact route and the normal purchasing and approval process before acting.",

            decisions: {
                comply: {
                    correct: false,

                    title:
                        "Authority and urgency do not replace process",

                    copy:
                        "A senior name, confidential explanation or meeting excuse should not bypass purchasing, payment or verification controls."
                },

                verify: {
                    correct: true,

                    title:
                        "Confirm identity and purchasing authority",

                    copy:
                        "Contact the person or an appropriate colleague through an approved independent route and continue using the normal approval process."
                }
            }
        },

        visitor: {
            tabId: "social-scenario-tab-3",

            title:
                "A visitor asks to follow an employee through a secure door",

            channel:
                "In-person request",

            channelIcon:
                "user-round",

            image:
                "assets/images/social-scenario-visitor.webp",

            imageAlt:
                "Employee reviewing a fictional visitor request near a workplace entrance",

            copy:
                "The visitor carries equipment, mentions a familiar department and says their temporary access badge has stopped working.",

            quote:
                "“I am already late for the maintenance appointment. Could you hold the door for me?”",

            review: [
                "Whether the visit and appointment are recorded",
                "Whether the person has valid identification",
                "Whether visitor and escort procedures are being followed"
            ],

            guidance:
                "Direct the visitor to the approved reception, security or visitor-management process.",

            decisions: {
                comply: {
                    correct: false,

                    title:
                        "Do not bypass physical-access controls",

                    copy:
                        "Equipment, uniforms, workplace knowledge or urgency do not replace identification and visitor procedures."
                },

                verify: {
                    correct: true,

                    title:
                        "Use the approved visitor process",

                    copy:
                        "Keep the secure door controlled and direct the person to the authorized reception, security or visitor route."
                }
            }
        },

        "vendor-video": {
            tabId: "social-scenario-tab-4",

            title:
                "A vendor requests sensitive project files during a video meeting",

            channel:
                "Video meeting",

            channelIcon:
                "video",

            image:
                "assets/images/social-scenario-vendor-video.webp",

            imageAlt:
                "Employee reviewing a fictional vendor request during a video meeting",

            copy:
                "An unfamiliar attendee joins a scheduled vendor meeting and asks for customer records to troubleshoot an urgent service problem.",

            quote:
                "“Upload the complete customer export into this temporary workspace so our engineers can investigate.”",

            review: [
                "Whether the attendee is an approved vendor contact",
                "Whether the requested data is necessary and authorized",
                "Whether the temporary workspace is an approved transfer route"
            ],

            guidance:
                "Confirm the attendee, purpose, minimum required information and approved sharing method before providing any data.",

            decisions: {
                comply: {
                    correct: false,

                    title:
                        "Do not move data into an unapproved workspace",

                    copy:
                        "A live meeting and urgent technical explanation do not authorize broad data access or a new transfer route."
                },

                verify: {
                    correct: true,

                    title:
                        "Verify the attendee and approved sharing process",

                    copy:
                        "Pause the request and confirm vendor identity, authorization, data scope and transfer method through the established process."
                }
            }
        }
    };


    /* =========================================================
       3. PAGE INITIALIZATION
       ========================================================= */

    function initializeSocialEngineeringPage() {
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
        initializeChannelMap();
        initializeScenarioActivity();
        initializeResponseProcess();
        initializeVerificationChecklist();
        initializeSocialFAQ();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        window.SecureHabit
            ?.refreshIcons?.();

        window.SecureHabit
            ?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:social-engineering-ready",
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
        initializeSocialEngineeringPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializeSocialEngineeringPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializeSocialEngineeringPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroySocialEngineeringPage,
        {
            once: true
        }
    );


    /* =========================================================
       4. GENERAL HELPERS
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

    function replaceList(
        list,
        values
    ) {
        if (!list) {
            return;
        }

        list.replaceChildren();

        values.forEach(function (value) {
            const item =
                document.createElement("li");

            item.textContent = value;

            list.appendChild(item);
        });
    }


    /* =========================================================
       5. MOTION PREFERENCE
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
        const requestPanel =
            document.querySelector(
                ".social-hero__request-panel"
            );

        const channels =
            document.querySelector(
                ".social-hero__channels"
            );

        const mark =
            document.querySelector(
                ".social-hero__mark"
            );

        const finalBackground =
            document.querySelector(
                ".social-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".social-final-cta__geometry"
            );

        if (requestPanel) {
            requestPanel.style.transform = "";
        }

        if (channels) {
            channels.style.transform = "";
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
       6. INTERACTIVE COMMUNICATION CHANNEL MAP
       ========================================================= */

    function initializeChannelMap() {
        const root =
            document.querySelector(
                "[data-social-channels]"
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

        const buttons =
            Array.from(
                root.querySelectorAll(
                    "[data-social-channel]"
                )
            );

        const explanation =
            root.querySelector(
                "[data-social-channel-explanation]"
            );

        if (
            !buttons.length ||
            !explanation
        ) {
            return;
        }

        const elements = {
            step:
                explanation.querySelector(
                    "[data-social-channel-step]"
                ),

            icon:
                explanation.querySelector(
                    "[data-social-channel-icon]"
                ),

            title:
                explanation.querySelector(
                    "[data-social-channel-title]"
                ),

            copy:
                explanation.querySelector(
                    "[data-social-channel-copy]"
                ),

            review:
                explanation.querySelector(
                    "[data-social-channel-review]"
                ),

            guidance:
                explanation.querySelector(
                    "[data-social-channel-guidance]"
                ),

            previous:
                explanation.querySelector(
                    "[data-social-channel-previous]"
                ),

            next:
                explanation.querySelector(
                    "[data-social-channel-next]"
                )
        };

        function activateChannel(
            index,
            {
                focusButton = false,
                focusExplanation = false
            } = {}
        ) {
            const safeIndex =
                (
                    index +
                    buttons.length
                ) % buttons.length;

            const button =
                buttons[safeIndex];

            const channelId =
                button.dataset.socialChannel;

            const content =
                channelContent[channelId];

            if (!content) {
                return;
            }

            state.channelIndex =
                safeIndex;

            buttons.forEach(function (
                item,
                buttonIndex
            ) {
                const active =
                    buttonIndex === safeIndex;

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
                `Channel ${safeIndex + 1} of ${buttons.length}`
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
                elements.review,
                content.review
            );

            updateLucideIcon(
                elements.icon,
                content.icon
            );

            root.dataset.activeChannel =
                channelId;

            explanation.dataset.activeChannel =
                channelId;

            if (focusButton) {
                focusWithoutScroll(button);
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
                    "securehabit:social-channel-change",
                    {
                        detail: {
                            index: safeIndex,
                            channelId,
                            content
                        }
                    }
                )
            );
        }

        buttons.forEach(function (
            button,
            index
        ) {
            addEvent(
                button,
                "click",
                function () {
                    activateChannel(index);
                }
            );

            addEvent(
                button,
                "pointerenter",
                function () {
                    const supportsHover =
                        window.matchMedia(
                            "(hover: hover) and (pointer: fine)"
                        ).matches;

                    if (supportsHover) {
                        activateChannel(index);
                    }
                }
            );

            addEvent(
                button,
                "focus",
                function () {
                    activateChannel(index);
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
                                ) % buttons.length;
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

                    activateChannel(
                        nextIndex,
                        {
                            focusButton: true
                        }
                    );
                }
            );
        });

        addEvent(
            elements.previous,
            "click",
            function () {
                activateChannel(
                    state.channelIndex - 1,
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
                activateChannel(
                    state.channelIndex + 1,
                    {
                        focusExplanation: true
                    }
                );
            }
        );

        const activeIndex =
            buttons.findIndex(
                function (button) {
                    return (
                        button.getAttribute(
                            "aria-pressed"
                        ) === "true"
                    );
                }
            );

        activateChannel(
            activeIndex >= 0
                ? activeIndex
                : 0
        );

        window
            .SecureHabitSocialActivateChannel =
            activateChannel;
    }


    /* =========================================================
       7. INTERACTIVE WORKPLACE SCENARIOS
       ========================================================= */

    function initializeScenarioActivity() {
        const root =
            document.querySelector(
                "[data-social-scenarios]"
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

        const tabs =
            Array.from(
                root.querySelectorAll(
                    "[data-social-scenario]"
                )
            );

        const panel =
            root.querySelector(
                "[data-social-scenario-panel]"
            );

        if (
            !tabs.length ||
            !panel
        ) {
            return;
        }

        const elements = {
            image:
                panel.querySelector(
                    "[data-social-scenario-image]"
                ),

            channel:
                panel.querySelector(
                    "[data-social-scenario-channel]"
                ),

            channelIcon:
                panel.querySelector(
                    "[data-social-scenario-channel-icon]"
                ),

            title:
                panel.querySelector(
                    "[data-social-scenario-title]"
                ),

            copy:
                panel.querySelector(
                    "[data-social-scenario-copy]"
                ),

            quote:
                panel.querySelector(
                    "[data-social-scenario-quote]"
                ),

            review:
                panel.querySelector(
                    "[data-social-scenario-review]"
                ),

            guidance:
                panel.querySelector(
                    "[data-social-scenario-guidance]"
                ),

            decisions:
                Array.from(
                    panel.querySelectorAll(
                        "[data-social-decision]"
                    )
                ),

            feedback:
                panel.querySelector(
                    "[data-social-scenario-feedback]"
                ),

            feedbackIcon:
                panel.querySelector(
                    "[data-social-scenario-feedback] > i"
                ),

            feedbackTitle:
                panel.querySelector(
                    "[data-social-feedback-title]"
                ),

            feedbackCopy:
                panel.querySelector(
                    "[data-social-feedback-copy]"
                )
        };

        function clearDecisionState() {
            elements.decisions.forEach(
                function (button) {
                    button.classList.remove(
                        "is-selected",
                        "is-correct",
                        "is-review"
                    );

                    button.removeAttribute(
                        "aria-pressed"
                    );
                }
            );

            if (elements.feedback) {
                elements.feedback.hidden = true;

                elements.feedback.classList.remove(
                    "is-correct",
                    "is-review"
                );
            }
        }

        function showScenario(
            index,
            {
                focusTab = false,
                focusPanel = false
            } = {}
        ) {
            const safeIndex =
                (
                    index +
                    tabs.length
                ) % tabs.length;

            const tab =
                tabs[safeIndex];

            const scenarioId =
                tab.dataset.socialScenario;

            const content =
                scenarioContent[scenarioId];

            if (!content) {
                return;
            }

            state.scenarioIndex =
                safeIndex;

            tabs.forEach(function (
                item,
                tabIndex
            ) {
                const active =
                    tabIndex === safeIndex;

                item.classList.toggle(
                    "is-active",
                    active
                );

                item.setAttribute(
                    "aria-selected",
                    String(active)
                );

                item.tabIndex =
                    active ? 0 : -1;
            });

            panel.setAttribute(
                "aria-labelledby",
                content.tabId
            );

            panel.dataset.activeScenario =
                scenarioId;

            root.dataset.activeScenario =
                scenarioId;

            if (elements.image) {
                elements.image.classList.add(
                    "is-changing"
                );

                elements.image.src =
                    content.image;

                elements.image.alt =
                    content.imageAlt;

                requestFrame(function () {
                    elements.image?.classList.remove(
                        "is-changing"
                    );
                });
            }

            setText(
                elements.channel,
                content.channel
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
                elements.quote,
                content.quote
            );

            setText(
                elements.guidance,
                content.guidance
            );

            replaceList(
                elements.review,
                content.review
            );

            updateLucideIcon(
                elements.channelIcon,
                content.channelIcon
            );

            clearDecisionState();

            if (focusTab) {
                focusWithoutScroll(tab);
            }

            if (focusPanel) {
                requestFrame(function () {
                    focusWithoutScroll(panel);
                });
            }

            window.SecureHabit
                ?.refreshIcons?.();

            window.SecureHabit
                ?.refreshAOS?.();

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:social-scenario-change",
                    {
                        detail: {
                            index: safeIndex,
                            scenarioId,
                            content
                        }
                    }
                )
            );
        }

        function handleDecision(button) {
            const activeTab =
                tabs[state.scenarioIndex];

            const scenarioId =
                activeTab?.dataset
                    .socialScenario;

            const content =
                scenarioContent[scenarioId];

            const decisionId =
                button.dataset
                    .socialDecision;

            const decision =
                content?.decisions?.[
                decisionId
                ];

            if (
                !content ||
                !decision
            ) {
                return;
            }

            elements.decisions.forEach(
                function (item) {
                    const selected =
                        item === button;

                    item.classList.toggle(
                        "is-selected",
                        selected
                    );

                    item.classList.remove(
                        "is-correct",
                        "is-review"
                    );

                    item.setAttribute(
                        "aria-pressed",
                        String(selected)
                    );
                }
            );

            button.classList.add(
                decision.correct
                    ? "is-correct"
                    : "is-review"
            );

            if (elements.feedback) {
                elements.feedback.hidden =
                    false;

                elements.feedback.classList.toggle(
                    "is-correct",
                    decision.correct
                );

                elements.feedback.classList.toggle(
                    "is-review",
                    !decision.correct
                );
            }

            setText(
                elements.feedbackTitle,
                decision.title
            );

            setText(
                elements.feedbackCopy,
                decision.copy
            );

            updateLucideIcon(
                elements.feedbackIcon,
                decision.correct
                    ? "badge-check"
                    : "message-square-warning"
            );

            requestFrame(function () {
                focusWithoutScroll(
                    elements.feedback
                );
            });

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:social-decision",
                    {
                        detail: {
                            scenarioId,
                            decisionId,
                            correct:
                                decision.correct
                        }
                    }
                )
            );
        }

        tabs.forEach(function (
            tab,
            index
        ) {
            addEvent(
                tab,
                "click",
                function () {
                    showScenario(index);
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
                                (
                                    index + 1
                                ) % tabs.length;
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

                    showScenario(
                        nextIndex,
                        {
                            focusTab: true
                        }
                    );
                }
            );
        });

        elements.decisions.forEach(
            function (button) {
                addEvent(
                    button,
                    "click",
                    function () {
                        handleDecision(button);
                    }
                );
            }
        );

        showScenario(0);

        window
            .SecureHabitSocialShowScenario =
            showScenario;
    }


    /* =========================================================
       8. RESPONSE PROCESS
       ========================================================= */

    function initializeResponseProcess() {
        const root =
            document.querySelector(
                "[data-social-response-process]"
            );

        if (!root) {
            return;
        }

        const steps =
            Array.from(
                root.querySelectorAll(
                    "[data-social-response-step]"
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
            "--social-response-progress",
            `${(
                (safeIndex + 1) /
                steps.length
            ) * 100
            }%`
        );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:social-response-change",
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
       9. VERIFICATION CHECKLIST
       ========================================================= */

    function initializeVerificationChecklist() {
        const checklist =
            document.querySelector(
                "[data-social-checklist]"
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
                "[data-social-checklist-count]"
            );

        const progress =
            checklist.querySelector(
                "[data-social-checklist-progress]"
            );

        const progressBar =
            checklist.querySelector(
                "[data-social-checklist-progress] span"
            );

        const resetButton =
            checklist.querySelector(
                "[data-social-checklist-reset]"
            );

        const printButton =
            checklist.querySelector(
                "[data-social-checklist-print]"
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
                    "securehabit:social-checklist-change",
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
                printVerificationChecklist(
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

    function printVerificationChecklist(
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
                    "SecureHabit received an invalid social-engineering checklist print selector.",
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


    /* =========================================================
       10. FAQ
       ========================================================= */

    function initializeSocialFAQ() {
        const accordion =
            document.querySelector(
                "[data-social-faq]"
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
                    ".social-faq__item"
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
                    ".social-faq__answer"
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
                    "social-faq-summary",
                    index
                );

            const answerId =
                answer.id ||
                createUniqueId(
                    "social-faq-answer",
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
                        "securehabit:social-faq-toggle",
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
       11. HERO POINTER MOTION
       ========================================================= */

    function initializeHeroMotion() {
        const hero =
            document.querySelector(
                ".social-hero"
            );

        const requestPanel =
            hero?.querySelector(
                ".social-hero__request-panel"
            );

        const channels =
            hero?.querySelector(
                ".social-hero__channels"
            );

        const mark =
            hero?.querySelector(
                ".social-hero__mark"
            );

        if (
            !hero ||
            (
                !requestPanel &&
                !channels &&
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

            if (requestPanel) {
                requestPanel.style.transform =
                    `translate3d(` +
                    `${currentX * 17}px, ` +
                    `calc(-50% + ${currentY * 13
                    }px), 0) ` +
                    `rotate(3deg)`;
            }

            if (channels) {
                channels.style.transform =
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
       12. FINAL CTA PARALLAX
       ========================================================= */

    function initializeFinalCtaParallax() {
        const section =
            document.querySelector(
                ".social-final-cta"
            );

        const background =
            section?.querySelector(
                ".social-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".social-final-cta__geometry"
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
            .SecureHabitSocialScheduleParallax =
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
                .SecureHabitSocialScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitSocialScheduleParallax();
        }
    }


    /* =========================================================
       13. SECTION VISIBILITY STATES
       ========================================================= */

    function initializeSectionStates() {
        const sections =
            Array.from(
                document.querySelectorAll(
                    [
                        ".social-overview",
                        ".social-channels",
                        ".social-patterns",
                        ".social-scenarios",
                        ".social-response",
                        ".social-checklist",
                        ".social-faq",
                        ".social-final-cta"
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


    /* =========================================================
       14. CLEANUP
       ========================================================= */

    function destroySocialEngineeringPage() {
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
                        "SecureHabit could not remove a Social Engineering event listener.",
                        error
                    );
                }
            }
        );

        delete window
            .SecureHabitSocialActivateChannel;

        delete window
            .SecureHabitSocialShowScenario;

        delete window
            .SecureHabitSocialScheduleParallax;

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    /* =========================================================
       15. PUBLIC PAGE API
       ========================================================= */

    window.SecureHabitSocialEngineering =
        Object.freeze({
            showChannel:
                function (index) {
                    if (
                        typeof window
                            .SecureHabitSocialActivateChannel ===
                        "function"
                    ) {
                        window
                            .SecureHabitSocialActivateChannel(
                                Number(index)
                            );
                    }
                },

            showScenario:
                function (index) {
                    if (
                        typeof window
                            .SecureHabitSocialShowScenario ===
                        "function"
                    ) {
                        window
                            .SecureHabitSocialShowScenario(
                                Number(index)
                            );
                    }
                },

            resetChecklist:
                function () {
                    document
                        .querySelector(
                            "[data-social-checklist-reset]"
                        )
                        ?.click();
                },

            printChecklist:
                function () {
                    document
                        .querySelector(
                            "[data-social-checklist-print]"
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
                destroySocialEngineeringPage
        });
})();