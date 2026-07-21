




(function () {
    "use strict";

    const PAGE_ID = "password-security";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,

        passphraseStructure: "four-words",
        passphraseWords: [],

        mfaScenario: "unexpected",
        mfaDecision: null,

        processObserver: null,
        sectionObserver: null,

        heroFrame: null,
        parallaxFrame: null,
        resizeFrame: null,

        printTarget: null,
        cleanupCallbacks: []
    };


    



    const fictionalWordPool = [
        "amber",
        "anchor",
        "apple",
        "arch",
        "atlas",
        "autumn",
        "bamboo",
        "beacon",
        "birch",
        "breeze",
        "bridge",
        "canyon",
        "cedar",
        "circle",
        "cloud",
        "cobalt",
        "copper",
        "coral",
        "crystal",
        "delta",
        "drift",
        "ember",
        "falcon",
        "field",
        "forest",
        "garden",
        "glacier",
        "harbor",
        "island",
        "jasmine",
        "lantern",
        "lilac",
        "maple",
        "meadow",
        "meteor",
        "mist",
        "moon",
        "mosaic",
        "oak",
        "ocean",
        "orbit",
        "pebble",
        "pine",
        "plaza",
        "quartz",
        "raven",
        "river",
        "saffron",
        "signal",
        "silver",
        "sky",
        "stone",
        "summit",
        "tide",
        "trail",
        "valley",
        "violet",
        "willow",
        "winter",
        "zenith"
    ];

    const weaknessLabels = {
        personal: "personal information",
        quotation: "a familiar quotation or slogan",
        reuse: "credential reuse",
        sharing: "unapproved sharing"
    };

    const passphraseStructures = {
        "four-words": {
            wordCount: 4,
            separator: "·",
            label:
                "Four unrelated fictional words",

            feedback:
                "This example demonstrates an illustrative long-word structure. It is not a real credential and should not be copied for account use."
        },

        "five-words": {
            wordCount: 5,
            separator: "·",
            label:
                "Five unrelated fictional words",

            feedback:
                "Adding another unrelated fictional word illustrates additional length, but organizational credential requirements still take priority."
        },

        "manager-generated": {
            wordCount: 4,
            separator: "—",
            label:
                "Approved manager-generated placeholder",

            fixedWords: [
                "approved",
                "password-manager",
                "generated",
                "example"
            ],

            feedback:
                "Use the organization’s approved password manager to generate real credentials. This placeholder must not be used for an account."
        }
    };


    



    const mfaScenarios = {
        unexpected: {
            notificationTitle:
                "Approve sign-in request?",

            service:
                "Collaboration workspace",

            location:
                "Unfamiliar location",

            device:
                "New browser",

            title:
                "An authentication prompt appears unexpectedly",

            description:
                "You are not currently signing in, but a new-device approval request appears on your phone.",

            question:
                "Does this prompt match an account action you just initiated?",

            guidance:
                "Deny the unexpected request and follow the organization’s approved account-support or reporting process.",

            correctDecision: "deny",

            feedback: {
                deny: {
                    title:
                        "Denying supports the safer response",

                    copy:
                        "The prompt does not match an action you initiated. Deny it and use the approved reporting or account-support route."
                },

                approve: {
                    title:
                        "Do not approve an unexpected request",

                    copy:
                        "Approval could allow an unrecognized sign-in to continue. Only approve prompts that match an account action you initiated and verified."
                }
            }
        },

        initiated: {
            notificationTitle:
                "Confirm your sign-in",

            service:
                "Approved company portal",

            location:
                "Expected workplace location",

            device:
                "Your managed laptop",

            title:
                "A prompt follows a sign-in you initiated",

            description:
                "You opened the approved company portal independently and entered your account information on your managed device.",

            question:
                "Do the service, device, location and timing match the sign-in you just started?",

            guidance:
                "Review every detail. Approval may be appropriate only when the prompt clearly matches the action you initiated and organizational policy.",

            correctDecision: "approve",

            feedback: {
                deny: {
                    title:
                        "Denying is cautious, but review the full context",

                    copy:
                        "The fictional prompt matches the action you initiated. In a real workplace, follow policy and contact support when the details remain unclear."
                },

                approve: {
                    title:
                        "The prompt matches the fictional sign-in",

                    copy:
                        "The service, device, location and timing match the action you initiated. Continue only when all details are expected and policy permits approval."
                }
            }
        },

        repeated: {
            notificationTitle:
                "Repeated sign-in approvals",

            service:
                "Workplace email",

            location:
                "Several locations",

            device:
                "Unknown devices",

            title:
                "Several prompts arrive one after another",

            description:
                "You are not signing in, but repeated approval requests continue appearing on your device.",

            question:
                "Should you approve one request simply to make the notifications stop?",

            guidance:
                "Do not approve repeated unexpected prompts. Deny or dismiss them according to the available controls and report the activity.",

            correctDecision: "deny",

            feedback: {
                deny: {
                    title:
                        "Do not approve repeated unexpected prompts",

                    copy:
                        "Repeated requests can create pressure or fatigue. Deny them and follow the approved account-support or reporting process."
                },

                approve: {
                    title:
                        "Approval is not a way to stop the prompts",

                    copy:
                        "Approving one request may allow an unrecognized sign-in. Use the available deny control and report the repeated activity."
                }
            }
        },

        "support-call": {
            notificationTitle:
                "Support verification request",

            service:
                "Account administration",

            location:
                "Not provided",

            device:
                "Unknown support session",

            title:
                "A caller asks you to approve a prompt",

            description:
                "Someone claiming to represent technical support says an authentication request must be approved to repair your account.",

            question:
                "Has the caller’s identity and the account action been verified through the approved support route?",

            guidance:
                "Do not approve the prompt or share a code. End the call and contact support through a known organizational channel.",

            correctDecision: "deny",

            feedback: {
                deny: {
                    title:
                        "Verify support independently",

                    copy:
                        "Deny the request, end the unverified call and contact the approved support route independently."
                },

                approve: {
                    title:
                        "A caller’s claim does not verify the prompt",

                    copy:
                        "Do not approve authentication requests or share one-time codes only because someone claims to represent support."
                }
            }
        }
    };


    



    function initializePasswordSecurityPage() {
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
        initializePassphraseLab();
        initializeMfaSimulator();
        initializeRecoveryProcess();
        initializeAccountChecklist();
        initializePasswordFAQ();
        initializeHeroMotion();
        initializeFinalCtaParallax();
        initializeSectionStates();

        window.SecureHabit
            ?.refreshIcons?.();

        window.SecureHabit
            ?.refreshAOS?.();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:password-security-ready",
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
        initializePasswordSecurityPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        window.SecureHabit
    ) {
        initializePasswordSecurityPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                if (window.SecureHabit) {
                    initializePasswordSecurityPage();
                }
            },
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyPasswordSecurityPage,
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
        return (
            `${prefix}-${index + 1}`
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

    function createRandomIndex(
        maximum
    ) {
        if (maximum <= 1) {
            return 0;
        }

        if (
            window.crypto &&
            typeof window.crypto
                .getRandomValues === "function"
        ) {
            const values =
                new Uint32Array(1);

            window.crypto.getRandomValues(
                values
            );

            return (
                values[0] % maximum
            );
        }

        return Math.floor(
            Math.random() * maximum
        );
    }

    function shuffleArray(values) {
        const copy = [...values];

        for (
            let index =
                copy.length - 1;
            index > 0;
            index -= 1
        ) {
            const randomIndex =
                createRandomIndex(
                    index + 1
                );

            const current =
                copy[index];

            copy[index] =
                copy[randomIndex];

            copy[randomIndex] =
                current;
        }

        return copy;
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
                .addListener === "function"
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
        const accessPanel =
            document.querySelector(
                ".password-hero__access-panel"
            );

        const orbit =
            document.querySelector(
                ".password-hero__orbit"
            );

        const mark =
            document.querySelector(
                ".password-hero__mark"
            );

        const finalBackground =
            document.querySelector(
                ".password-final-cta__background"
            );

        const finalGeometry =
            document.querySelector(
                ".password-final-cta__geometry"
            );

        if (accessPanel) {
            accessPanel.style.transform = "";
        }

        if (orbit) {
            orbit.style.transform = "";
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


    



    function initializePassphraseLab() {
        const root =
            document.querySelector(
                "[data-passphrase-lab]"
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

        const structureButtons =
            Array.from(
                root.querySelectorAll(
                    "[data-passphrase-structure]"
                )
            );

        const weaknessInputs =
            Array.from(
                root.querySelectorAll(
                    "[data-passphrase-weakness]"
                )
            );

        const regenerateButton =
            root.querySelector(
                "[data-passphrase-regenerate]"
            );

        const preview =
            root.querySelector(
                "[data-passphrase-preview]"
            );

        const example =
            root.querySelector(
                ".passphrase-lab__example"
            );

        const lengthOutput =
            root.querySelector(
                "[data-passphrase-length]"
            );

        const structureOutput =
            root.querySelector(
                "[data-passphrase-structure-label]"
            );

        const weaknessOutput =
            root.querySelector(
                "[data-passphrase-weakness-count]"
            );

        const feedback =
            root.querySelector(
                "[data-passphrase-feedback] p"
            );

        if (
            !structureButtons.length ||
            !preview ||
            !example
        ) {
            return;
        }

        function chooseStructure(
            structure,
            {
                regenerate = true,
                focusPreview = false
            } = {}
        ) {
            if (
                !passphraseStructures[
                structure
                ]
            ) {
                return;
            }

            state.passphraseStructure =
                structure;

            structureButtons.forEach(
                function (button) {
                    const selected =
                        button.dataset
                            .passphraseStructure ===
                        structure;

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

            root.dataset
                .activePassphraseStructure =
                structure;

            if (regenerate) {
                generatePassphraseExample();
            } else {
                renderPassphraseExample();
            }

            if (focusPreview) {
                requestFrame(function () {
                    focusWithoutScroll(
                        preview
                    );
                });
            }

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:passphrase-structure-change",
                    {
                        detail: {
                            structure
                        }
                    }
                )
            );
        }

        function generatePassphraseExample() {
            const configuration =
                passphraseStructures[
                state.passphraseStructure
                ];

            if (!configuration) {
                return;
            }

            if (
                Array.isArray(
                    configuration.fixedWords
                )
            ) {
                state.passphraseWords =
                    [
                        ...configuration.fixedWords
                    ];
            } else {
                state.passphraseWords =
                    shuffleArray(
                        fictionalWordPool
                    ).slice(
                        0,
                        configuration.wordCount
                    );
            }

            renderPassphraseExample();

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:passphrase-example-generated",
                    {
                        detail: {
                            structure:
                                state.passphraseStructure,

                            wordCount:
                                state.passphraseWords
                                    .length
                        }
                    }
                )
            );
        }

        function renderPassphraseExample() {
            const configuration =
                passphraseStructures[
                state.passphraseStructure
                ];

            if (!configuration) {
                return;
            }

            example.replaceChildren();

            state.passphraseWords.forEach(
                function (word, index) {
                    const wordElement =
                        document.createElement(
                            "span"
                        );

                    wordElement.dataset
                        .passphraseWord = "";

                    wordElement.textContent =
                        word;

                    example.appendChild(
                        wordElement
                    );

                    if (
                        index <
                        state.passphraseWords.length -
                        1
                    ) {
                        const separatorElement =
                            document.createElement(
                                "span"
                            );

                        separatorElement.dataset
                            .passphraseSeparator = "";

                        separatorElement.textContent =
                            configuration.separator;

                        example.appendChild(
                            separatorElement
                        );
                    }
                }
            );

            const exampleValue =
                state.passphraseWords.join(
                    configuration.separator
                );

            const selectedWeaknesses =
                getSelectedWeaknesses(
                    weaknessInputs
                );

            setText(
                lengthOutput,
                `${exampleValue.length} ` +
                `${exampleValue.length === 1
                    ? "character"
                    : "characters"
                } including separators`
            );

            setText(
                structureOutput,
                configuration.label
            );

            setText(
                weaknessOutput,
                createWeaknessSummary(
                    selectedWeaknesses
                )
            );

            setText(
                feedback,
                createPassphraseFeedback(
                    configuration,
                    selectedWeaknesses
                )
            );

            root.dataset.weaknessCount =
                String(
                    selectedWeaknesses.length
                );

            root.dataset.hasWeaknesses =
                String(
                    selectedWeaknesses.length >
                    0
                );
        }

        structureButtons.forEach(
            function (button, index) {
                addEvent(
                    button,
                    "click",
                    function () {
                        chooseStructure(
                            button.dataset
                                .passphraseStructure
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
                                    (
                                        index + 1
                                    ) %
                                    structureButtons.length;
                                break;

                            case "ArrowLeft":
                            case "ArrowUp":
                                nextIndex =
                                    (
                                        index -
                                        1 +
                                        structureButtons.length
                                    ) %
                                    structureButtons.length;
                                break;

                            case "Home":
                                nextIndex = 0;
                                break;

                            case "End":
                                nextIndex =
                                    structureButtons.length -
                                    1;
                                break;

                            default:
                                return;
                        }

                        event.preventDefault();

                        const nextButton =
                            structureButtons[
                            nextIndex
                            ];

                        chooseStructure(
                            nextButton.dataset
                                .passphraseStructure
                        );

                        focusWithoutScroll(
                            nextButton
                        );
                    }
                );
            }
        );

        weaknessInputs.forEach(
            function (input) {
                addEvent(
                    input,
                    "change",
                    renderPassphraseExample
                );
            }
        );

        addEvent(
            regenerateButton,
            "click",
            function () {
                generatePassphraseExample();

                requestFrame(function () {
                    focusWithoutScroll(
                        preview
                    );
                });
            }
        );

        const selectedButton =
            structureButtons.find(
                function (button) {
                    return (
                        button.getAttribute(
                            "aria-pressed"
                        ) === "true"
                    );
                }
            ) || structureButtons[0];

        chooseStructure(
            selectedButton.dataset
                .passphraseStructure
        );
    }

    function getSelectedWeaknesses(
        inputs
    ) {
        return inputs
            .filter(function (input) {
                return input.checked;
            })
            .map(function (input) {
                return input.dataset
                    .passphraseWeakness;
            })
            .filter(Boolean);
    }

    function createWeaknessSummary(
        selectedWeaknesses
    ) {
        if (
            selectedWeaknesses.length === 0
        ) {
            return "None selected";
        }

        if (
            selectedWeaknesses.length === 1
        ) {
            return (
                "1 weakness flag selected"
            );
        }

        return (
            `${selectedWeaknesses.length} ` +
            "weakness flags selected"
        );
    }

    function createPassphraseFeedback(
        configuration,
        selectedWeaknesses
    ) {
        if (
            selectedWeaknesses.length === 0
        ) {
            return configuration.feedback;
        }

        const labels =
            selectedWeaknesses
                .map(function (weakness) {
                    return (
                        weaknessLabels[
                        weakness
                        ] || weakness
                    );
                })
                .join(", ");

        return (
            `The selected flags identify ${labels}. ` +
            "These factors can weaken an otherwise long credential. " +
            "Follow the employer’s approved password and password-manager policy."
        );
    }


    



    function initializeMfaSimulator() {
        const root =
            document.querySelector(
                "[data-mfa-simulator]"
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

        const tabs = Array.from(
            root.querySelectorAll(
                "[data-mfa-scenario]"
            )
        );

        const decisionButtons =
            Array.from(
                root.querySelectorAll(
                    "[data-mfa-decision]"
                )
            );

        const explanation =
            root.querySelector(
                "[data-mfa-explanation]"
            );

        if (
            !tabs.length ||
            !decisionButtons.length ||
            !explanation
        ) {
            return;
        }

        const elements = {
            notificationTitle:
                root.querySelector(
                    "[data-mfa-notification-title]"
                ),

            service:
                root.querySelector(
                    "[data-mfa-service]"
                ),

            location:
                root.querySelector(
                    "[data-mfa-location]"
                ),

            device:
                root.querySelector(
                    "[data-mfa-device]"
                ),

            title:
                root.querySelector(
                    "[data-mfa-title]"
                ),

            description:
                root.querySelector(
                    "[data-mfa-description]"
                ),

            question:
                root.querySelector(
                    "[data-mfa-question]"
                ),

            feedback:
                root.querySelector(
                    "[data-mfa-feedback]"
                ),

            feedbackTitle:
                root.querySelector(
                    "[data-mfa-feedback-title]"
                ),

            feedbackCopy:
                root.querySelector(
                    "[data-mfa-feedback-copy]"
                ),

            guidance:
                root.querySelector(
                    "[data-mfa-guidance]"
                )
        };

        tabs.forEach(function (
            tab,
            index
        ) {
            if (!tab.id) {
                tab.id =
                    createUniqueId(
                        "mfa-scenario-tab",
                        index
                    );
            }

            addEvent(
                tab,
                "click",
                function () {
                    selectMfaScenario(
                        tab.dataset.mfaScenario
                    );
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
                                ) %
                                tabs.length;
                            break;

                        case "ArrowLeft":
                        case "ArrowUp":
                            nextIndex =
                                (
                                    index -
                                    1 +
                                    tabs.length
                                ) %
                                tabs.length;
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

                    selectMfaScenario(
                        nextTab.dataset
                            .mfaScenario
                    );

                    focusWithoutScroll(
                        nextTab
                    );
                }
            );
        });

        decisionButtons.forEach(
            function (button) {
                button.setAttribute(
                    "aria-pressed",
                    "false"
                );

                addEvent(
                    button,
                    "click",
                    function () {
                        handleMfaDecision(
                            button.dataset
                                .mfaDecision
                        );
                    }
                );
            }
        );

        function selectMfaScenario(
            scenarioId,
            {
                focusExplanation = false
            } = {}
        ) {
            const scenario =
                mfaScenarios[
                scenarioId
                ];

            if (!scenario) {
                return;
            }

            state.mfaScenario =
                scenarioId;

            state.mfaDecision = null;

            tabs.forEach(function (tab) {
                const active =
                    tab.dataset
                        .mfaScenario ===
                    scenarioId;

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

            decisionButtons.forEach(
                function (button) {
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

            setText(
                elements.notificationTitle,
                scenario.notificationTitle
            );

            setText(
                elements.service,
                scenario.service
            );

            setText(
                elements.location,
                scenario.location
            );

            setText(
                elements.device,
                scenario.device
            );

            setText(
                elements.title,
                scenario.title
            );

            setText(
                elements.description,
                scenario.description
            );

            setText(
                elements.question,
                scenario.question
            );

            setText(
                elements.guidance,
                scenario.guidance
            );

            if (elements.feedback) {
                elements.feedback.hidden =
                    true;

                elements.feedback.dataset
                    .result = "";
            }

            const activeTab =
                tabs.find(function (tab) {
                    return (
                        tab.dataset
                            .mfaScenario ===
                        scenarioId
                    );
                });

            if (
                explanation &&
                activeTab
            ) {
                explanation.setAttribute(
                    "aria-labelledby",
                    activeTab.id
                );
            }

            root.dataset.activeScenario =
                scenarioId;

            root.dataset.mfaAnswered =
                "false";

            if (focusExplanation) {
                requestFrame(function () {
                    focusWithoutScroll(
                        explanation
                    );
                });
            }

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:mfa-scenario-change",
                    {
                        detail: {
                            scenarioId,
                            scenario
                        }
                    }
                )
            );
        }

        function handleMfaDecision(
            decision
        ) {
            const scenario =
                mfaScenarios[
                state.mfaScenario
                ];

            const selectedButton =
                decisionButtons.find(
                    function (button) {
                        return (
                            button.dataset
                                .mfaDecision ===
                            decision
                        );
                    }
                );

            if (
                !scenario ||
                !selectedButton ||
                !scenario.feedback[
                decision
                ]
            ) {
                return;
            }

            const correct =
                decision ===
                scenario.correctDecision;

            state.mfaDecision =
                decision;

            decisionButtons.forEach(
                function (button) {
                    const selected =
                        button ===
                        selectedButton;

                    button.classList.toggle(
                        "is-selected",
                        selected
                    );

                    button.classList.remove(
                        "is-correct",
                        "is-incorrect"
                    );

                    if (selected) {
                        button.classList.add(
                            correct
                                ? "is-correct"
                                : "is-incorrect"
                        );
                    }

                    button.setAttribute(
                        "aria-pressed",
                        String(selected)
                    );
                }
            );

            const feedback =
                scenario.feedback[
                decision
                ];

            setText(
                elements.feedbackTitle,
                feedback.title
            );

            setText(
                elements.feedbackCopy,
                feedback.copy
            );

            if (elements.feedback) {
                elements.feedback.hidden =
                    false;

                elements.feedback.dataset
                    .result =
                    correct
                        ? "correct"
                        : "review";
            }

            root.dataset.mfaAnswered =
                "true";

            root.dataset.mfaDecision =
                decision;

            requestFrame(function () {
                focusWithoutScroll(
                    elements.feedback
                );
            });

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:mfa-decision",
                    {
                        detail: {
                            scenarioId:
                                state.mfaScenario,

                            decision,
                            correct
                        }
                    }
                )
            );
        }

        const selectedTab =
            tabs.find(function (tab) {
                return (
                    tab.getAttribute(
                        "aria-selected"
                    ) === "true"
                );
            }) || tabs[0];

        selectMfaScenario(
            selectedTab.dataset
                .mfaScenario
        );

        window
            .SecureHabitPasswordSelectMfaScenario =
            selectMfaScenario;

        window
            .SecureHabitPasswordChooseMfaDecision =
            handleMfaDecision;
    }


    



    function initializeRecoveryProcess() {
        const root =
            document.querySelector(
                "[data-account-recovery-process]"
            );

        if (!root) {
            return;
        }

        const steps = Array.from(
            root.querySelectorAll(
                "[data-account-recovery-step]"
            )
        );

        if (!steps.length) {
            return;
        }

        steps.forEach(function (
            step,
            index
        ) {
            step.dataset.recoveryIndex =
                String(index);

            step.setAttribute(
                "aria-current",
                index === 0
                    ? "step"
                    : "false"
            );
        });

        setActiveRecoveryStep(
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
            initializeRecoveryFallback(
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

                    setActiveRecoveryStep(
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

    function setActiveRecoveryStep(
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
            "--account-recovery-progress",
            `${(
                (safeIndex + 1) /
                steps.length
            ) * 100
            }%`
        );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:account-recovery-step-change",
                {
                    detail: {
                        activeIndex:
                            safeIndex,

                        activeStep:
                            steps[safeIndex],

                        totalSteps:
                            steps.length
                    }
                }
            )
        );
    }

    function initializeRecoveryFallback(
        root,
        steps
    ) {
        let frame = null;

        function update() {
            frame = null;

            const viewportTarget =
                window.innerHeight *
                0.43;

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

            setActiveRecoveryStep(
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


    



    function initializeAccountChecklist() {
        const checklist =
            document.querySelector(
                "[data-account-checklist]"
            );

        if (
            !checklist ||
            checklist.dataset
                .initialized === "true"
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
                "[data-account-checklist-count]"
            );

        const progress =
            checklist.querySelector(
                "[data-account-checklist-progress]"
            );

        const progressBar =
            checklist.querySelector(
                "[data-account-checklist-progress] span"
            );

        const resetButton =
            checklist.querySelector(
                "[data-account-checklist-reset]"
            );

        const printButton =
            checklist.querySelector(
                "[data-account-checklist-print]"
            );

        if (!checkboxes.length) {
            return;
        }

        function updateChecklist() {
            const completed =
                checkboxes.filter(
                    function (checkbox) {
                        return (
                            checkbox.checked
                        );
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
                `${completed} of ${total} ` +
                `${completed === 1
                    ? "habit"
                    : "habits"
                } reviewed`
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

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:account-checklist-change",
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
                printAccountChecklist(
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

    function printAccountChecklist(
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
                    "SecureHabit received an invalid account-checklist print selector.",
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


    



    function initializePasswordFAQ() {
        const accordion =
            document.querySelector(
                "[data-password-faq]"
            );

        if (
            !accordion ||
            accordion.dataset
                .initialized === "true"
        ) {
            return;
        }

        accordion.dataset.initialized =
            "true";

        const items = Array.from(
            accordion.querySelectorAll(
                ".password-faq__item"
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
                    ".password-faq__answer"
                );

            if (!summary || !answer) {
                return;
            }

            const summaryId =
                summary.id ||
                createUniqueId(
                    "password-faq-summary",
                    index
                );

            const answerId =
                answer.id ||
                createUniqueId(
                    "password-faq-answer",
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

                    items.forEach(
                        function (otherItem) {
                            if (
                                otherItem !== item &&
                                otherItem.open
                            ) {
                                otherItem.open =
                                    false;
                            }
                        }
                    );

                    synchronizing = false;
                }

                window.dispatchEvent(
                    new CustomEvent(
                        "securehabit:password-faq-toggle",
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
                ".password-hero"
            );

        const accessPanel =
            hero?.querySelector(
                ".password-hero__access-panel"
            );

        const orbit =
            hero?.querySelector(
                ".password-hero__orbit"
            );

        const mark =
            hero?.querySelector(
                ".password-hero__mark"
            );

        if (
            !hero ||
            (
                !accessPanel &&
                !orbit &&
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

            if (accessPanel) {
                accessPanel.style.transform =
                    `translate3d(` +
                    `${currentX * 17}px, ` +
                    `calc(-50% + ${currentY * 13
                    }px), 0) ` +
                    `rotate(4deg)`;
            }

            if (orbit) {
                orbit.style.transform =
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

        function handlePointerMove(
            event
        ) {
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
                ".password-final-cta"
            );

        const background =
            section?.querySelector(
                ".password-final-cta__background"
            );

        const geometry =
            section?.querySelector(
                ".password-final-cta__geometry"
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
            .SecureHabitPasswordScheduleParallax =
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
                    requestFrame(
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
                .SecureHabitPasswordScheduleParallax ===
            "function"
        ) {
            window
                .SecureHabitPasswordScheduleParallax();
        }
    }


    



    function initializeSectionStates() {
        const sections = Array.from(
            document.querySelectorAll(
                [
                    ".password-overview",
                    ".password-principles",
                    ".passphrase-lab",
                    ".mfa-prompts",
                    ".account-recovery",
                    ".account-checklist",
                    ".password-faq",
                    ".password-final-cta"
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
            sections.forEach(
                function (section) {
                    section.classList.add(
                        "is-in-view"
                    );
                }
            );

            return;
        }

        state.sectionObserver =
            new IntersectionObserver(
                function (entries) {
                    entries.forEach(
                        function (entry) {
                            entry.target
                                .classList.toggle(
                                    "is-in-view",
                                    entry.isIntersecting
                                );

                            if (
                                entry.isIntersecting
                            ) {
                                entry.target.dataset
                                    .hasEntered = "true";
                            }
                        }
                    );
                },
                {
                    root: null,

                    rootMargin:
                        "-10% 0px -12% 0px",

                    threshold: 0.08
                }
            );

        sections.forEach(
            function (section) {
                state.sectionObserver.observe(
                    section
                );
            }
        );
    }


    



    function destroyPasswordSecurityPage() {
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
                        "SecureHabit could not remove a Password Security event listener.",
                        error
                    );
                }
            }
        );

        delete window
            .SecureHabitPasswordScheduleParallax;

        delete window
            .SecureHabitPasswordSelectMfaScenario;

        delete window
            .SecureHabitPasswordChooseMfaDecision;

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    



    window.SecureHabitPasswordSecurity =
        Object.freeze({
            regeneratePassphrase:
                function () {
                    document
                        .querySelector(
                            "[data-passphrase-regenerate]"
                        )
                        ?.click();
                },

            selectMfaScenario:
                function (scenarioId) {
                    if (
                        typeof window
                            .SecureHabitPasswordSelectMfaScenario ===
                        "function"
                    ) {
                        window
                            .SecureHabitPasswordSelectMfaScenario(
                                scenarioId
                            );
                    }
                },

            chooseMfaDecision:
                function (decision) {
                    if (
                        typeof window
                            .SecureHabitPasswordChooseMfaDecision ===
                        "function"
                    ) {
                        window
                            .SecureHabitPasswordChooseMfaDecision(
                                decision
                            );
                    }
                },

            resetChecklist:
                function () {
                    document
                        .querySelector(
                            "[data-account-checklist-reset]"
                        )
                        ?.click();
                },

            printChecklist:
                function () {
                    document
                        .querySelector(
                            "[data-account-checklist-print]"
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
                destroyPasswordSecurityPage
        });
})();





function initSecureShowcase() {
    const filters = document.querySelector(
        "[data-secure-showcase-filters]"
    );

    const items = Array.from(
        document.querySelectorAll(
            "[data-showcase-item]"
        )
    );

    if (!filters || !items.length) {
        return;
    }

    filters.addEventListener("click", (event) => {
        const button = event.target.closest(
            "[data-showcase-filter]"
        );

        if (!button) {
            return;
        }

        const selectedFilter =
            button.dataset.showcaseFilter;

        filters
            .querySelectorAll("[data-showcase-filter]")
            .forEach((filterButton) => {
                const isSelected =
                    filterButton === button;

                filterButton.classList.toggle(
                    "is-active",
                    isSelected
                );

                filterButton.setAttribute(
                    "aria-pressed",
                    String(isSelected)
                );
            });

        items.forEach((item) => {
            const category =
                item.dataset.showcaseCategory;

            const shouldShow =
                selectedFilter === "all" ||
                category === selectedFilter;

            item.classList.toggle(
                "is-hidden",
                !shouldShow
            );
        });

        window.lucide?.createIcons();
    });
}

document.addEventListener(
    "DOMContentLoaded",
    initSecureShowcase
);