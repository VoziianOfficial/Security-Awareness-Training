









(function () {
    "use strict";

    const PAGE_SELECTOR = "[data-legal-page]";

    const state = {
        initialized: false,
        reducedMotion: false,
        motionQuery: null,

        navigation: null,
        navigationLinks: [],
        linkedSections: [],
        allSections: [],

        activeSectionId: "",
        scrollFrame: null,
        resizeFrame: null,
        heroFrame: null,

        sectionObserver: null,
        cleanupCallbacks: []
    };


    



    function initializeLegalPage() {
        if (state.initialized) {
            return;
        }

        if (!document.body?.matches(PAGE_SELECTOR)) {
            return;
        }

        state.initialized = true;

        document.documentElement.classList.remove(
            "no-js"
        );

        document.documentElement.classList.add(
            "js"
        );

        state.motionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        state.reducedMotion =
            state.motionQuery.matches;

        initializeMotionPreference();
        initializeConfiguredContactDetails();
        initializeLegalNavigation();
        initializeSectionObserver();
        initializeReadingProgress();
        initializePrintControls();
        initializeCookieSettingsControl();
        initializeAccessibleTables();
        initializeHeroMotion();
        initializeInitialHash();

        refreshIcons();
        refreshAOS();

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:legal-ready",
                {
                    detail: {
                        page:
                            document.body.dataset
                                .legalPage
                    }
                }
            )
        );
    }

    window.addEventListener(
        "securehabit:ready",
        initializeLegalPage,
        {
            once: true
        }
    );

    if (
        document.readyState !== "loading" &&
        document.body?.matches(PAGE_SELECTOR)
    ) {
        initializeLegalPage();
    } else {
        document.addEventListener(
            "DOMContentLoaded",
            initializeLegalPage,
            {
                once: true
            }
        );
    }

    window.addEventListener(
        "pagehide",
        destroyLegalPage,
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

    function getStickyOffset() {
        const rootStyles =
            window.getComputedStyle(
                document.documentElement
            );

        const rawValue =
            rootStyles.getPropertyValue(
                "--sticky-offset"
            );

        const parsedValue =
            Number.parseFloat(rawValue);

        if (
            Number.isFinite(parsedValue)
        ) {
            return parsedValue;
        }

        const header =
            document.querySelector(
                "[data-site-header] .site-header, .site-header"
            );

        return (
            header?.getBoundingClientRect()
                .height || 90
        );
    }

    function decodeHash(hash) {
        try {
            return decodeURIComponent(
                String(hash || "")
                    .replace(/^#/, "")
            );
        } catch {
            return String(hash || "")
                .replace(/^#/, "");
        }
    }


    



    function initializeConfiguredContactDetails() {
        const email =
            getConfiguredEmail();

        if (!email) {
            return;
        }

        document
            .querySelectorAll(
                "[data-config-email]"
            )
            .forEach(function (element) {
                setText(
                    element,
                    email
                );
            });

        document
            .querySelectorAll(
                "[data-config-email-link]"
            )
            .forEach(function (link) {
                const currentHref =
                    link.getAttribute("href") || "";

                const queryIndex =
                    currentHref.indexOf("?");

                const query =
                    queryIndex >= 0
                        ? currentHref.slice(
                            queryIndex
                        )
                        : "";

                link.setAttribute(
                    "href",
                    `mailto:${email}${query}`
                );
            });
    }

    function getConfiguredEmail() {
        const candidates = [
            window.SECUREHABIT_CONFIG
                ?.contact?.email,

            window.SECUREHABIT_CONFIG
                ?.company?.email,

            window.SecureHabitConfig
                ?.contact?.email,

            window.SecureHabitConfig
                ?.company?.email,

            window.SecureHabit
                ?.config?.contact?.email,

            window.SecureHabit
                ?.config?.company?.email
        ];

        const configuredEmail =
            candidates.find(
                function (value) {
                    return (
                        typeof value ===
                        "string" &&
                        value.includes("@")
                    );
                }
            );

        return (
            configuredEmail ||
            "hello@securehabit.example"
        );
    }


    



    function initializeLegalNavigation() {
        const navigation =
            document.querySelector(
                "[data-legal-navigation]"
            );

        if (!navigation) {
            return;
        }

        state.navigation =
            navigation;

        state.navigationLinks =
            Array.from(
                navigation.querySelectorAll(
                    "[data-legal-nav-link]"
                )
            );

        state.allSections =
            Array.from(
                document.querySelectorAll(
                    "[data-legal-section]"
                )
            );

        state.linkedSections =
            state.navigationLinks
                .map(function (link) {
                    const hash =
                        link.getAttribute("href");

                    if (
                        !hash ||
                        !hash.startsWith("#")
                    ) {
                        return null;
                    }

                    const id =
                        decodeHash(hash);

                    const section =
                        document.getElementById(id);

                    if (!section) {
                        return null;
                    }

                    return {
                        id,
                        link,
                        section
                    };
                })
                .filter(Boolean);

        state.navigationLinks.forEach(
            function (link) {
                addEvent(
                    link,
                    "click",
                    handleNavigationClick
                );
            }
        );

        addEvent(
            window,
            "scroll",
            scheduleScrollUpdate,
            {
                passive: true
            }
        );

        addEvent(
            window,
            "resize",
            scheduleResizeUpdate,
            {
                passive: true
            }
        );

        addEvent(
            window,
            "hashchange",
            handleHashChange
        );

        updateActiveNavigation();
    }

    function handleNavigationClick(event) {
        const link =
            event.currentTarget;

        const hash =
            link.getAttribute("href");

        if (
            !hash ||
            !hash.startsWith("#")
        ) {
            return;
        }

        const sectionId =
            decodeHash(hash);

        const section =
            document.getElementById(
                sectionId
            );

        if (!section) {
            return;
        }

        event.preventDefault();

        scrollToLegalSection(
            sectionId,
            {
                updateHistory: true,
                focusSection: false
            }
        );
    }

    function scrollToLegalSection(
        sectionId,
        options = {}
    ) {
        const {
            updateHistory = false,
            focusSection = false
        } = options;

        const section =
            document.getElementById(
                sectionId
            );

        if (!section) {
            return false;
        }

        const stickyOffset =
            getStickyOffset();

        const sectionTop =
            window.scrollY +
            section.getBoundingClientRect()
                .top;

        const targetPosition =
            Math.max(
                0,
                sectionTop -
                stickyOffset -
                18
            );

        window.scrollTo({
            top: targetPosition,

            behavior:
                state.reducedMotion
                    ? "auto"
                    : "smooth"
        });

        setActiveSection(
            sectionId,
            {
                scrollNavigation: true
            }
        );

        if (
            updateHistory &&
            window.history?.pushState
        ) {
            window.history.pushState(
                null,
                "",
                `#${encodeURIComponent(
                    sectionId
                )}`
            );
        }

        if (focusSection) {
            if (
                !section.hasAttribute(
                    "tabindex"
                )
            ) {
                section.setAttribute(
                    "tabindex",
                    "-1"
                );
            }

            window.setTimeout(
                function () {
                    focusWithoutScroll(
                        section
                    );
                },
                state.reducedMotion
                    ? 0
                    : 420
            );
        }

        return true;
    }

    function handleHashChange() {
        const sectionId =
            decodeHash(
                window.location.hash
            );

        if (!sectionId) {
            return;
        }

        scrollToLegalSection(
            sectionId,
            {
                updateHistory: false,
                focusSection: false
            }
        );
    }

    function updateActiveNavigation() {
        if (
            !state.linkedSections.length
        ) {
            return;
        }

        const targetLine =
            getStickyOffset() +
            Math.min(
                window.innerHeight * 0.24,
                190
            );

        let activeEntry =
            state.linkedSections[0];

        state.linkedSections.forEach(
            function (entry) {
                const rect =
                    entry.section
                        .getBoundingClientRect();

                if (
                    rect.top <= targetLine
                ) {
                    activeEntry = entry;
                }
            }
        );

        const finalEntry =
            state.linkedSections[
            state.linkedSections.length - 1
            ];

        const finalRect =
            finalEntry.section
                .getBoundingClientRect();

        if (
            finalRect.bottom <=
            window.innerHeight * 0.75
        ) {
            activeEntry =
                finalEntry;
        }

        setActiveSection(
            activeEntry.id,
            {
                scrollNavigation: true
            }
        );
    }

    function setActiveSection(
        sectionId,
        options = {}
    ) {
        const {
            scrollNavigation = false
        } = options;

        if (!sectionId) {
            return;
        }

        const changed =
            state.activeSectionId !==
            sectionId;

        state.activeSectionId =
            sectionId;

        state.navigationLinks.forEach(
            function (link) {
                const linkId =
                    decodeHash(
                        link.getAttribute("href")
                    );

                const active =
                    linkId === sectionId;

                link.classList.toggle(
                    "is-active",
                    active
                );

                if (active) {
                    link.setAttribute(
                        "aria-current",
                        "location"
                    );
                } else {
                    link.removeAttribute(
                        "aria-current"
                    );
                }
            }
        );

        state.allSections.forEach(
            function (section) {
                section.classList.toggle(
                    "is-active",
                    section.id === sectionId
                );
            }
        );

        if (
            changed &&
            scrollNavigation
        ) {
            centerActiveNavigationLink();
        }

        if (changed) {
            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:legal-section-change",
                    {
                        detail: {
                            sectionId,
                            page:
                                document.body.dataset
                                    .legalPage
                        }
                    }
                )
            );
        }
    }

    function centerActiveNavigationLink() {
        if (
            !state.navigation ||
            window.innerWidth > 1024
        ) {
            return;
        }

        const activeLink =
            state.navigation.querySelector(
                '[aria-current="location"]'
            );

        if (!activeLink) {
            return;
        }

        const targetLeft =
            activeLink.offsetLeft -
            state.navigation.clientWidth / 2 +
            activeLink.clientWidth / 2;

        state.navigation.scrollTo({
            left: Math.max(
                0,
                targetLeft
            ),

            behavior:
                state.reducedMotion
                    ? "auto"
                    : "smooth"
        });
    }


    



    function initializeReadingProgress() {
        updateReadingProgress();
    }

    function scheduleScrollUpdate() {
        if (state.scrollFrame) {
            return;
        }

        state.scrollFrame =
            window.requestAnimationFrame(
                function () {
                    state.scrollFrame = null;

                    updateActiveNavigation();
                    updateReadingProgress();
                }
            );
    }

    function scheduleResizeUpdate() {
        if (state.resizeFrame) {
            window.cancelAnimationFrame(
                state.resizeFrame
            );
        }

        state.resizeFrame =
            window.requestAnimationFrame(
                function () {
                    state.resizeFrame = null;

                    updateActiveNavigation();
                    updateReadingProgress();
                    refreshAOS();
                }
            );
    }

    function updateReadingProgress() {
        const content =
            document.querySelector(
                ".legal-page__content"
            );

        if (!content) {
            return;
        }

        const rect =
            content.getBoundingClientRect();

        const contentTop =
            window.scrollY +
            rect.top;

        const contentHeight =
            content.offsetHeight;

        const viewportPosition =
            window.scrollY +
            getStickyOffset();

        const availableDistance =
            Math.max(
                1,
                contentHeight -
                window.innerHeight * 0.4
            );

        const progress =
            clamp(
                (
                    viewportPosition -
                    contentTop
                ) /
                availableDistance,
                0,
                1
            );

        const percentage =
            Math.round(
                progress * 100
            );

        document.documentElement
            .style.setProperty(
                "--legal-reading-progress",
                `${percentage}%`
            );

        document.body.dataset
            .legalReadingProgress =
            String(percentage);
    }


    



    function initializeSectionObserver() {
        const sections =
            Array.from(
                document.querySelectorAll(
                    "[data-legal-section]"
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
                    section.dataset.hasEntered =
                        "true";

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
                            entry.target.classList.toggle(
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
                        "-10% 0px -15% 0px",

                    threshold: 0.06
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


    



    function initializePrintControls() {
        const buttons =
            Array.from(
                document.querySelectorAll(
                    "[data-legal-print]"
                )
            );

        buttons.forEach(
            function (button) {
                addEvent(
                    button,
                    "click",
                    printLegalPage
                );
            }
        );

        addEvent(
            window,
            "beforeprint",
            function () {
                document.body.classList.add(
                    "is-printing-legal-page"
                );
            }
        );

        addEvent(
            window,
            "afterprint",
            function () {
                document.body.classList.remove(
                    "is-printing-legal-page"
                );
            }
        );
    }

    function printLegalPage() {
        document.body.classList.add(
            "is-printing-legal-page"
        );

        window.requestAnimationFrame(
            function () {
                window.print();
            }
        );
    }


    



    function initializeCookieSettingsControl() {
        const buttons =
            Array.from(
                document.querySelectorAll(
                    "[data-open-cookie-settings]"
                )
            );

        buttons.forEach(
            function (button) {
                button.setAttribute(
                    "aria-haspopup",
                    "dialog"
                );

                addEvent(
                    button,
                    "click",
                    function () {
                        openCookieSettings(
                            button
                        );
                    }
                );
            }
        );

        addEvent(
            window,
            "securehabit:cookie-settings-opened",
            function () {
                buttons.forEach(
                    function (button) {
                        button.classList.add(
                            "is-active"
                        );

                        button.setAttribute(
                            "aria-expanded",
                            "true"
                        );
                    }
                );
            }
        );

        addEvent(
            window,
            "securehabit:cookie-settings-closed",
            function () {
                buttons.forEach(
                    function (button) {
                        button.classList.remove(
                            "is-active"
                        );

                        button.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                );
            }
        );
    }

    function openCookieSettings(button) {
        let opened = false;

        const publicMethods = [
            window.SecureHabit
                ?.openCookieSettings,

            window.SecureHabit
                ?.showCookieSettings,

            window.SecureHabit
                ?.cookieConsent?.open,

            window.SecureHabitCookieConsent
                ?.open,

            window.SecureHabitCookieConsent
                ?.show
        ];

        for (
            const method of publicMethods
        ) {
            if (
                typeof method !==
                "function"
            ) {
                continue;
            }

            try {
                method.call(
                    window.SecureHabit
                );

                opened = true;
                break;
            } catch (error) {
                console.warn(
                    "SecureHabit could not open cookie settings through a public method.",
                    error
                );
            }
        }

        if (!opened) {
            const existingTrigger =
                document.querySelector(
                    [
                        "[data-cookie-settings-trigger]",
                        "[data-cookie-preferences]",
                        "[data-manage-cookies]",
                        "[data-cookie-manage]"
                    ].join(",")
                );

            if (
                existingTrigger &&
                existingTrigger !== button
            ) {
                existingTrigger.click();
                opened = true;
            }
        }

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:open-cookie-settings",
                {
                    detail: {
                        source:
                            "legal-cookie-policy",
                        trigger: button
                    }
                }
            )
        );

        button.classList.add(
            "is-active"
        );

        button.setAttribute(
            "aria-expanded",
            "true"
        );

        if (!opened) {
            const consentRoot =
                document.querySelector(
                    "[data-cookie-consent]"
                );

            if (consentRoot) {
                consentRoot.removeAttribute(
                    "hidden"
                );

                consentRoot.setAttribute(
                    "aria-hidden",
                    "false"
                );

                consentRoot.classList.add(
                    "is-open",
                    "is-visible"
                );

                document.body.classList.add(
                    "cookie-consent-open"
                );
            }
        }

        window.setTimeout(
            function () {
                const dialog =
                    document.querySelector(
                        [
                            "[data-cookie-consent] [role='dialog']",
                            "[data-cookie-settings]",
                            ".cookie-consent__dialog",
                            ".cookie-settings"
                        ].join(",")
                    );

                if (dialog) {
                    if (
                        !dialog.hasAttribute(
                            "tabindex"
                        )
                    ) {
                        dialog.setAttribute(
                            "tabindex",
                            "-1"
                        );
                    }

                    focusWithoutScroll(
                        dialog
                    );
                }
            },
            state.reducedMotion
                ? 0
                : 120
        );
    }


    



    function initializeAccessibleTables() {
        const wrappers =
            Array.from(
                document.querySelectorAll(
                    ".legal-table-wrapper"
                )
            );

        wrappers.forEach(
            function (wrapper, index) {
                const table =
                    wrapper.querySelector(
                        ".legal-table"
                    );

                const caption =
                    table?.querySelector(
                        "caption"
                    );

                wrapper.setAttribute(
                    "role",
                    "region"
                );

                wrapper.setAttribute(
                    "tabindex",
                    "0"
                );

                wrapper.setAttribute(
                    "aria-label",
                    caption?.textContent.trim() ||
                    `Scrollable legal information table ${index + 1}`
                );

                addEvent(
                    wrapper,
                    "keydown",
                    function (event) {
                        const horizontalAmount =
                            Math.max(
                                120,
                                wrapper.clientWidth * 0.3
                            );

                        if (
                            event.key ===
                            "ArrowRight"
                        ) {
                            event.preventDefault();

                            wrapper.scrollBy({
                                left:
                                    horizontalAmount,

                                behavior:
                                    state.reducedMotion
                                        ? "auto"
                                        : "smooth"
                            });
                        }

                        if (
                            event.key ===
                            "ArrowLeft"
                        ) {
                            event.preventDefault();

                            wrapper.scrollBy({
                                left:
                                    -horizontalAmount,

                                behavior:
                                    state.reducedMotion
                                        ? "auto"
                                        : "smooth"
                            });
                        }

                        if (
                            event.key === "Home"
                        ) {
                            event.preventDefault();

                            wrapper.scrollTo({
                                left: 0,

                                behavior:
                                    state.reducedMotion
                                        ? "auto"
                                        : "smooth"
                            });
                        }

                        if (
                            event.key === "End"
                        ) {
                            event.preventDefault();

                            wrapper.scrollTo({
                                left:
                                    wrapper.scrollWidth,

                                behavior:
                                    state.reducedMotion
                                        ? "auto"
                                        : "smooth"
                            });
                        }
                    }
                );
            }
        );
    }


    



    function initializeMotionPreference() {
        if (!state.motionQuery) {
            return;
        }

        const handleMotionChange =
            function (event) {
                state.reducedMotion =
                    event.matches;

                if (
                    state.reducedMotion
                ) {
                    resetHeroMotion();
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


    



    function initializeHeroMotion() {
        const hero =
            document.querySelector(
                ".legal-hero"
            );

        const mark =
            hero?.querySelector(
                ".legal-hero__mark"
            );

        const summary =
            hero?.querySelector(
                ".legal-hero__summary"
            );

        if (
            !hero ||
            (
                !mark &&
                !summary
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
                resetHeroMotion();
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

            if (mark) {
                mark.style.transform =
                    `translate3d(` +
                    `${currentX * -17}px, ` +
                    `calc(-50% + ${currentY * -12}px), 0) ` +
                    `rotate(9deg)`;
            }

            if (summary) {
                summary.style.transform =
                    `translate3d(` +
                    `${currentX * 9}px, ` +
                    `${currentY * 7}px, 0)`;
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
                    window.requestAnimationFrame(
                        render
                    );
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
                window.requestAnimationFrame(
                    render
                );
        }

        function handlePointerMove(event) {
            if (
                state.reducedMotion ||
                !finePointer.matches
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

        function handlePointerLeave() {
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
            handlePointerLeave,
            {
                passive: true
            }
        );
    }

    function resetHeroMotion() {
        const mark =
            document.querySelector(
                ".legal-hero__mark"
            );

        const summary =
            document.querySelector(
                ".legal-hero__summary"
            );

        if (mark) {
            mark.style.transform = "";
        }

        if (summary) {
            summary.style.transform =
                "";
        }

        if (state.heroFrame) {
            window.cancelAnimationFrame(
                state.heroFrame
            );

            state.heroFrame = null;
        }
    }


    



    function initializeInitialHash() {
        const sectionId =
            decodeHash(
                window.location.hash
            );

        if (!sectionId) {
            updateActiveNavigation();
            return;
        }

        const section =
            document.getElementById(
                sectionId
            );

        if (!section) {
            updateActiveNavigation();
            return;
        }

        window.requestAnimationFrame(
            function () {
                window.requestAnimationFrame(
                    function () {
                        scrollToLegalSection(
                            sectionId,
                            {
                                updateHistory: false,
                                focusSection: false
                            }
                        );
                    }
                );
            }
        );
    }


    



    function destroyLegalPage() {
        state.sectionObserver
            ?.disconnect();

        if (state.scrollFrame) {
            window.cancelAnimationFrame(
                state.scrollFrame
            );
        }

        if (state.resizeFrame) {
            window.cancelAnimationFrame(
                state.resizeFrame
            );
        }

        if (state.heroFrame) {
            window.cancelAnimationFrame(
                state.heroFrame
            );
        }

        state.cleanupCallbacks.forEach(
            function (callback) {
                try {
                    callback();
                } catch (error) {
                    console.warn(
                        "SecureHabit could not remove a legal-page event listener.",
                        error
                    );
                }
            }
        );

        document.documentElement
            .style.removeProperty(
                "--legal-reading-progress"
            );

        document.body?.classList.remove(
            "is-printing-legal-page"
        );

        state.navigation = null;
        state.navigationLinks = [];
        state.linkedSections = [];
        state.allSections = [];

        state.activeSectionId = "";
        state.scrollFrame = null;
        state.resizeFrame = null;
        state.heroFrame = null;
        state.sectionObserver = null;

        state.cleanupCallbacks = [];
        state.initialized = false;
    }


    



    window.SecureHabitLegal =
        Object.freeze({
            scrollToSection:
                function (sectionId) {
                    return scrollToLegalSection(
                        String(
                            sectionId || ""
                        ).replace(/^#/, ""),
                        {
                            updateHistory: true,
                            focusSection: false
                        }
                    );
                },

            refreshNavigation:
                function () {
                    updateActiveNavigation();
                    updateReadingProgress();
                },

            print:
                printLegalPage,

            openCookieSettings:
                function () {
                    const button =
                        document.querySelector(
                            "[data-open-cookie-settings]"
                        );

                    if (button) {
                        openCookieSettings(
                            button
                        );
                    }
                },

            refreshIcons:
                refreshIcons,

            destroy:
                destroyLegalPage
        });
})();