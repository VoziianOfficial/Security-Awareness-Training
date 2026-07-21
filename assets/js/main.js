(function () {
    "use strict";

    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.add("js");

    const state = {
        initialized: false,
        config: null,
        currentPage: "home",
        headerElement: null,
        mobileMenuElement: null,
        mobileMenuReturnFocus: null,
        cookieDialogReturnFocus: null,
        aosInitialized: false,
        iconsInitialized: false,
        aosRefreshFrame: null,
        aosRefreshHardPending: false,
        aosLoadRefreshBound: false,
        aosFontsRefreshBound: false,
        scrollFrame: null,
        resizeFrame: null,
        identityReplacer: null,
        identityObserver: null,
        identityFrame: null,
        digitSanitizerObserver: null,
        digitSanitizerFrame: null,
        mobileCardRailObserver: null,
        mobileCardRailFrame: null,
    };

    const selectors = {
        headerMount: "[data-site-header]",
        footerMount: "[data-site-footer]",
        cookieMount: "[data-cookie-consent]",
        breadcrumbMount: "[data-breadcrumbs]",
        mobileMenu: "[data-mobile-menu]",
        mobileMenuOpen: "[data-mobile-menu-open]",
        mobileMenuClose: "[data-mobile-menu-close]",
        desktopDropdown: "[data-desktop-dropdown]",
        accordion: "[data-accordion]",
        tabs: "[data-tabs]"
    };

    const focusableSelector = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
        "summary"
    ].join(",");


    



    function initializeSecureHabit() {
        if (state.initialized) {
            return;
        }

        const config = window.SECUREHABIT_CONFIG;

        if (!config) {
            console.error(
                "SecureHabit configuration is missing. Load assets/js/config.js before assets/js/main.js."
            );

            return;
        }

        state.initialized = true;
        state.config = config;
        state.identityReplacer = null;

        normalizeConfigurationIdentity();
        state.currentPage =
            document.body?.dataset.page ||
            config.meta?.defaultPage ||
            "home";

        applyDocumentLanguage();
        renderSharedHeader();
        renderSharedFooter();
        renderBreadcrumbs();
        renderCookieConsent();

        applyConfigurationBindings(document);
        applyPageMetadata();
        injectStructuredData();

        applyGlobalCompanyIdentity(document);
        initializeCompanyIdentityObserver();

        updateSourcePageFields(document);
        initializeExternalLinks(document);
        initializePrintActions(document);

        initializeDesktopNavigation();
        initializeMobileNavigation();
        initializeAccordions(document);
        initializeTabs(document);
        initializeHeaderScrollState();
        initializeHeaderHeightTracking();

        initializeLucideIcons();
        initializeAOS();
        initializeDigitSanitizer();
        initializeMobileCardRails();

        window.dispatchEvent(
            new CustomEvent("securehabit:ready", {
                detail: {
                    page: state.currentPage,
                    config: state.config
                }
            })
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeSecureHabit,
            {
                once: true
            }
        );
    } else {
        initializeSecureHabit();
    }


    



    function initializeDigitSanitizer() {
        sanitizeDigits(document.body || document);

        if (!("MutationObserver" in window)) {
            return;
        }

        state.digitSanitizerObserver =
            new MutationObserver(() => {
                if (state.digitSanitizerFrame) {
                    return;
                }

                state.digitSanitizerFrame =
                    requestFrame(() => {
                        state.digitSanitizerFrame = null;
                        sanitizeDigits(document.body);
                    });
            });

        state.digitSanitizerObserver.observe(
            document.body || document.documentElement,
            {
                childList: true,
                characterData: true,
                subtree: true
            }
        );
    }

    function sanitizeDigits(root) {
        if (!root) {
            return;
        }

        if (root.nodeType === Node.TEXT_NODE) {
            removeDigitsFromTextNode(root);
            return;
        }

        if (root.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        if (shouldSkipDigitSanitizer(root)) {
            return;
        }

        sanitizeDigitAttributes(root);

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_ELEMENT |
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    if (
                        node.nodeType ===
                        Node.ELEMENT_NODE &&
                        shouldSkipDigitSanitizer(node)
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        while (walker.nextNode()) {
            const node = walker.currentNode;

            if (node.nodeType === Node.TEXT_NODE) {
                removeDigitsFromTextNode(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                sanitizeDigitAttributes(node);
            }
        }
    }

    function shouldSkipDigitSanitizer(node) {
        return [
            "SCRIPT",
            "STYLE",
            "SVG",
            "CANVAS",
            "TEMPLATE"
        ].includes(node.nodeName);
    }

    function sanitizeDigitAttributes(element) {
        [
            "aria-label",
            "alt",
            "placeholder",
            "title"
        ].forEach((attribute) => {
            if (!element.hasAttribute(attribute)) {
                return;
            }

            const value = element.getAttribute(attribute);
            const sanitized = removeDigits(value);

            if (sanitized !== value) {
                element.setAttribute(attribute, sanitized);
            }
        });
    }

    function removeDigitsFromTextNode(node) {
        const sanitized = removeDigits(node.nodeValue);

        if (sanitized !== node.nodeValue) {
            node.nodeValue = sanitized;
        }
    }

    function removeDigits(value) {
        return String(value ?? "").replace(/[0-9]/g, "");
    }


    


    function initializeMobileCardRails() {
        applyMobileCardRails(document);

        if (!("MutationObserver" in window)) {
            return;
        }

        state.mobileCardRailObserver =
            new MutationObserver(() => {
                scheduleMobileCardRailScan();
            });

        state.mobileCardRailObserver.observe(
            document.body || document.documentElement,
            {
                childList: true,
                subtree: true
            }
        );

        window.addEventListener(
            "resize",
            scheduleMobileCardRailScan,
            {
                passive: true
            }
        );
    }

    function scheduleMobileCardRailScan() {
        if (state.mobileCardRailFrame) {
            return;
        }

        state.mobileCardRailFrame =
            requestFrame(() => {
                state.mobileCardRailFrame = null;
                applyMobileCardRails(document);
            });
    }

    function applyMobileCardRails(root = document) {
        const candidates = new Set();
        let changed = false;

        [
            "main [class*='__grid']",
            "main [class*='__list']",
            "main [class*='cards']",
            "main [class*='gallery']",
            "main [class*='mosaic']",
            "main [class*='tiles']"
        ].forEach((selector) => {
            root
                .querySelectorAll(selector)
                .forEach((element) => {
                    candidates.add(element);
                });
        });

        candidates.forEach((element) => {
            const railType = getMobileCardRailType(element);

            if (!railType) {
                if (
                    element.hasAttribute(
                        "data-mobile-card-rail"
                    )
                ) {
                    element.removeAttribute(
                        "data-mobile-card-rail"
                    );
                    changed = true;
                }
                return;
            }

            if (
                element.getAttribute(
                    "data-mobile-card-rail"
                ) !== railType
            ) {
                element.setAttribute(
                    "data-mobile-card-rail",
                    railType
                );
                changed = true;
            }
        });

        if (changed) {
            scheduleAOSRefresh();
        }
    }

    function getMobileCardRailType(element) {
        if (!element || shouldSkipMobileCardRail(element)) {
            return "";
        }

        const children = Array.from(element.children)
            .filter((child) => !child.hidden);

        if (children.length <= 2) {
            return "";
        }

        const railItems = children.filter(isMobileRailItem);

        if (
            railItems.length < 3 ||
            railItems.length < Math.ceil(children.length * 0.7)
        ) {
            return "";
        }

        return railItems.length <= 4
            ? "scroll"
            : "swiper";
    }

    function shouldSkipMobileCardRail(element) {
        return Boolean(
            element.closest(
                [
                    ".site-header",
                    ".site-footer",
                    ".breadcrumbs",
                    ".mobile-menu",
                    ".tabs",
                    ".accordion",
                    "[data-accordion]",
                    "[data-tabs]",
                    "nav",
                    "form",
                    "fieldset",
                    "[role='tablist']",
                    "[data-mobile-card-rail-ignore]"
                ].join(",")
            ) ||
            /faq|checklist|form|menu|navigation|breadcrumb|table|hero/i
                .test(element.className || "")
        );
    }

    function isMobileRailItem(element) {
        const className = element.className || "";

        return Boolean(
            element.matches("article, figure, li") ||
            /card|tile|panel|item|resource|topic|route|module|format|audience|pattern|quality|principle|insight|benefit|step|stage|path/i
                .test(className) ||
            element.querySelector(
                ":scope img, :scope picture, :scope figure"
            )
        );
    }


    


    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHTML(value);
    }

    function normalizeUrl(value) {
        const url = String(value ?? "").trim();

        if (!url) {
            return "";
        }

        if (/^(javascript|data|vbscript):/i.test(url)) {
            return "";
        }

        return url;
    }

    function getConfigValue(path, fallback = "") {
        if (!path || !state.config) {
            return fallback;
        }

        const keys = String(path)
            .split(".")
            .map((key) => key.trim())
            .filter(Boolean);

        let value = state.config;

        for (const key of keys) {
            if (
                value === null ||
                value === undefined ||
                !Object.prototype.hasOwnProperty.call(value, key)
            ) {
                return fallback;
            }

            value = value[key];
        }

        return value ?? fallback;
    }

    function createIconMarkup(name, className = "") {
        if (!name) {
            return "";
        }

        return `
      <i
        data-lucide="${escapeAttribute(name)}"
        ${className ? `class="${escapeAttribute(className)}"` : ""}
        aria-hidden="true"
      ></i>
    `;
    }

    function replaceYearTokens(value) {
        return String(value ?? "").replace(
            /\{year\}/g,
            String(new Date().getFullYear())
        );
    }

    function getCurrentPage() {
        return state.currentPage;
    }

    function getTopicPageIds() {
        return state.config.topics.map((topic) => topic.id);
    }

    function isTopicPage(pageId = state.currentPage) {
        return getTopicPageIds().includes(pageId);
    }

    function isNavigationItemActive(item) {
        if (!item) {
            return false;
        }

        if (item.id === state.currentPage) {
            return true;
        }

        return (
            item.id === "training-topics" &&
            isTopicPage(state.currentPage)
        );
    }

    function setElementVisibility(element, visible) {
        if (!element) {
            return;
        }

        element.hidden = !visible;
        element.setAttribute(
            "aria-hidden",
            visible ? "false" : "true"
        );
    }

    function requestFrame(callback) {
        return window.requestAnimationFrame(callback);
    }

    function applyDocumentLanguage() {
        const language =
            state.config.meta?.language ||
            "en";

        document.documentElement.lang = language;
    }


    



    function applyConfigurationBindings(root = document) {
        root
            .querySelectorAll("[data-config-text]")
            .forEach((element) => {
                const path = element.dataset.configText;
                const value = getConfigValue(path, null);

                if (value === null || typeof value === "object") {
                    return;
                }

                element.textContent = replaceYearTokens(value);
            });

        root
            .querySelectorAll("[data-config-link]")
            .forEach((element) => {
                const path = element.dataset.configLink;
                const value = normalizeUrl(
                    getConfigValue(path, "")
                );

                if (!value) {
                    return;
                }

                element.setAttribute("href", value);
            });

        root
            .querySelectorAll("[data-config-email]")
            .forEach((element) => {
                const path =
                    element.dataset.configEmail ||
                    "contact.emailDisplay";

                const email = String(
                    getConfigValue(path, "")
                ).trim();

                if (!email) {
                    return;
                }

                element.textContent = email;

                if (element.matches("a")) {
                    element.setAttribute(
                        "href",
                        `mailto:${email}`
                    );
                }
            });

        root
            .querySelectorAll("[data-config-address]")
            .forEach((element) => {
                const path =
                    element.dataset.configAddress ||
                    "company.address.full";

                const address = getConfigValue(path, "");

                if (Array.isArray(address)) {
                    element.textContent = address.join(", ");
                    return;
                }

                element.textContent = String(address);
            });

        root
            .querySelectorAll("[data-config-image]")
            .forEach((element) => {
                const path = element.dataset.configImage;
                const src = normalizeUrl(
                    getConfigValue(path, "")
                );

                if (!src) {
                    return;
                }

                if (
                    element instanceof HTMLImageElement ||
                    element instanceof HTMLSourceElement
                ) {
                    element.src = src;
                }
            });

        root
            .querySelectorAll("[data-config-alt]")
            .forEach((element) => {
                const path = element.dataset.configAlt;
                const alt = getConfigValue(path, "");

                if (element instanceof HTMLImageElement) {
                    element.alt = String(alt);
                }
            });

        root
            .querySelectorAll("[data-config-year]")
            .forEach((element) => {
                element.textContent =
                    String(new Date().getFullYear());
            });

        root
            .querySelectorAll("[data-config-hide-empty]")
            .forEach((element) => {
                const path = element.dataset.configHideEmpty;
                const value = getConfigValue(path, null);

                const hasValue =
                    Array.isArray(value)
                        ? value.length > 0
                        : Boolean(value);

                element.hidden = !hasValue;
            });
    }


    





    function escapeRegularExpression(value) {
        return String(value).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }


    function getIdentityReplacer() {
        if (state.identityReplacer) {
            return state.identityReplacer;
        }

        const config =
            state.config || {};

        const aliases =
            config.identityAliases || {};

        const address =
            config.company?.address || {};

        const contact =
            config.contact || {};

        const replacements =
            new Map();


        function registerReplacement(
            oldValues,
            newValue
        ) {
            const target =
                String(newValue ?? "").trim();

            if (!target) {
                return;
            }

            const sources =
                Array.isArray(oldValues)
                    ? oldValues
                    : [oldValues];

            sources.forEach((oldValue) => {
                const source =
                    String(oldValue ?? "").trim();

                if (
                    !source ||
                    source === target
                ) {
                    return;
                }

                replacements.set(
                    source,
                    target
                );

                



                const encodedSource =
                    encodeURIComponent(source);

                const encodedTarget =
                    encodeURIComponent(target);

                if (
                    encodedSource &&
                    encodedSource !== encodedTarget
                ) {
                    replacements.set(
                        encodedSource,
                        encodedTarget
                    );
                }

                const plusSource =
                    encodedSource.replace(
                        /%20/g,
                        "+"
                    );

                const plusTarget =
                    encodedTarget.replace(
                        /%20/g,
                        "+"
                    );

                if (
                    plusSource &&
                    plusSource !== plusTarget
                ) {
                    replacements.set(
                        plusSource,
                        plusTarget
                    );
                }
            });
        }


        registerReplacement(
            aliases.addressFull,
            address.full
        );

        registerReplacement(
            aliases.legalName,
            config.company?.legalName
        );

        registerReplacement(
            aliases.addressStreet,
            address.street
        );

        registerReplacement(
            aliases.addressCityStateZip,
            address.cityStateZip
        );

        registerReplacement(
            aliases.addressCountry,
            address.country
        );

        registerReplacement(
            aliases.email,
            contact.emailDisplay
        );

        registerReplacement(
            aliases.phoneDisplay,
            contact.phoneDisplay
        );

        registerReplacement(
            aliases.phoneRaw,
            contact.phoneRaw
        );

        registerReplacement(
            aliases.companyId,
            config.company?.companyId
        );

        registerReplacement(
            aliases.brandName,
            config.brand?.name
        );


        const keys =
            Array.from(replacements.keys())
                .sort(
                    (first, second) =>
                        second.length -
                        first.length
                );

        if (!keys.length) {
            state.identityReplacer =
                (value) => String(value ?? "");

            return state.identityReplacer;
        }

        



        const pattern =
            new RegExp(
                keys
                    .map(
                        escapeRegularExpression
                    )
                    .join("|"),
                "g"
            );


        state.identityReplacer =
            function replaceIdentity(value) {
                return String(value ?? "").replace(
                    pattern,
                    (match) =>
                        replacements.get(match) ??
                        match
                );
            };


        return state.identityReplacer;
    }


    function replaceIdentityTokens(value) {
        return getIdentityReplacer()(value);
    }


    



    function normalizeConfigurationIdentity() {
        const visited =
            new WeakSet();


        function normalizeValue(
            value,
            propertyName = ""
        ) {
            


            if (
                propertyName ===
                "identityAliases"
            ) {
                return value;
            }

            if (typeof value === "string") {
                return replaceIdentityTokens(value);
            }

            if (
                !value ||
                typeof value !== "object"
            ) {
                return value;
            }

            if (visited.has(value)) {
                return value;
            }

            visited.add(value);

            if (Array.isArray(value)) {
                value.forEach(
                    (item, index) => {
                        value[index] =
                            normalizeValue(
                                item,
                                String(index)
                            );
                    }
                );

                return value;
            }

            Object.keys(value).forEach(
                (key) => {
                    if (
                        key ===
                        "identityAliases"
                    ) {
                        return;
                    }

                    value[key] =
                        normalizeValue(
                            value[key],
                            key
                        );
                }
            );

            return value;
        }


        normalizeValue(state.config);
    }


    



    function queryInsideRoot(
        root,
        selector
    ) {
        const elements = [];

        if (
            root instanceof Element &&
            root.matches(selector)
        ) {
            elements.push(root);
        }

        if (
            root &&
            typeof root.querySelectorAll ===
            "function"
        ) {
            elements.push(
                ...root.querySelectorAll(selector)
            );
        }

        return elements;
    }


    function getAllElementsInside(root) {
        const elements = [];

        if (root instanceof Element) {
            elements.push(root);
        }

        if (
            root &&
            typeof root.querySelectorAll ===
            "function"
        ) {
            elements.push(
                ...root.querySelectorAll("*")
            );
        }

        return elements;
    }


    



    function replaceIdentityTextNodes(root) {
        if (!root) {
            return;
        }

        if (root.nodeType === Node.TEXT_NODE) {
            const original =
                root.nodeValue || "";

            const updated =
                replaceIdentityTokens(original);

            if (updated !== original) {
                root.nodeValue = updated;
            }

            return;
        }

        if (
            typeof document.createTreeWalker !==
            "function"
        ) {
            return;
        }

        const ignoredSelector = [
            "script",
            "style",
            "noscript",
            "textarea",
            "input",
            "select",
            "option",
            "code",
            "pre",
            "[contenteditable='true']"
        ].join(",");


        const walker =
            document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode(node) {
                        const parent =
                            node.parentElement;

                        if (
                            !parent ||
                            parent.closest(
                                ignoredSelector
                            )
                        ) {
                            return NodeFilter
                                .FILTER_REJECT;
                        }

                        return NodeFilter
                            .FILTER_ACCEPT;
                    }
                }
            );


        let textNode =
            walker.nextNode();

        while (textNode) {
            const original =
                textNode.nodeValue || "";

            const updated =
                replaceIdentityTokens(original);

            if (updated !== original) {
                textNode.nodeValue = updated;
            }

            textNode =
                walker.nextNode();
        }
    }


    



    function replaceIdentityAttributes(root) {
        const attributeNames = [
            "title",
            "aria-label",
            "alt",
            "placeholder",
            "content",
            "href"
        ];

        getAllElementsInside(root)
            .forEach((element) => {
                attributeNames.forEach(
                    (attributeName) => {
                        if (
                            !element.hasAttribute(
                                attributeName
                            )
                        ) {
                            return;
                        }

                        const original =
                            element.getAttribute(
                                attributeName
                            ) || "";

                        const updated =
                            replaceIdentityTokens(
                                original
                            );

                        if (updated !== original) {
                            element.setAttribute(
                                attributeName,
                                updated
                            );
                        }
                    }
                );
            });
    }


    



    function updateGlobalContactLinks(root) {
        const contact =
            state.config?.contact || {};

        const company =
            state.config?.company || {};


        const email =
            String(
                contact.emailDisplay || ""
            ).trim();

        const emailHref =
            String(
                contact.emailHref ||
                (email ? `mailto:${email}` : "")
            ).trim();


        if (email && emailHref) {
            queryInsideRoot(
                root,
                'a[href^="mailto:"]'
            ).forEach((link) => {
                const currentHref =
                    link.getAttribute("href") || "";

                const queryIndex =
                    currentHref.indexOf("?");

                const query =
                    queryIndex >= 0
                        ? currentHref.slice(queryIndex)
                        : "";

                link.setAttribute(
                    "href",
                    `${emailHref}${query}`
                );

                const visibleText =
                    link.textContent.trim();

                if (
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        visibleText
                    )
                ) {
                    link.textContent = email;
                }
            });
        }


        const phoneDisplay =
            String(
                contact.phoneDisplay || ""
            ).trim();

        const phoneRaw =
            String(
                contact.phoneRaw || ""
            ).trim();

        const phoneHref =
            String(
                contact.phoneHref ||
                (phoneRaw ? `tel:${phoneRaw}` : "")
            ).trim();


        if (phoneHref) {
            queryInsideRoot(
                root,
                'a[href^="tel:"]'
            ).forEach((link) => {
                link.setAttribute(
                    "href",
                    phoneHref
                );

                const visibleText =
                    link.textContent.trim();

                if (
                    phoneDisplay &&
                    /^[+\d\s().-]+$/.test(
                        visibleText
                    )
                ) {
                    link.textContent =
                        phoneDisplay;
                }
            });
        }


        const mapHref =
            String(
                company.mapHref || ""
            ).trim();


        if (mapHref) {
            queryInsideRoot(
                root,
                [
                    'a[href*="maps.google"]',
                    'a[href*="google.com/maps"]'
                ].join(",")
            ).forEach((link) => {
                link.setAttribute(
                    "href",
                    mapHref
                );
            });
        }
    }


    



    function updateIdentityStructuredData(root) {
        queryInsideRoot(
            root,
            'script[type="application/ld+json"]'
        ).forEach((script) => {
            const source =
                script.textContent.trim();

            if (!source) {
                return;
            }

            try {
                const data =
                    JSON.parse(source);


                function updateValue(value) {
                    if (typeof value === "string") {
                        return replaceIdentityTokens(
                            value
                        );
                    }

                    if (Array.isArray(value)) {
                        return value.map(
                            updateValue
                        );
                    }

                    if (
                        value &&
                        typeof value === "object"
                    ) {
                        Object.keys(value)
                            .forEach((key) => {
                                value[key] =
                                    updateValue(
                                        value[key]
                                    );
                            });
                    }

                    return value;
                }


                script.textContent =
                    JSON.stringify(
                        updateValue(data),
                        null,
                        2
                    );
            } catch {
                script.textContent =
                    replaceIdentityTokens(
                        source
                    );
            }
        });
    }


    



    function applyGlobalCompanyIdentity(
        root = document
    ) {
        if (!state.config || !root) {
            return;
        }

        replaceIdentityTextNodes(root);
        replaceIdentityAttributes(root);
        updateGlobalContactLinks(root);
        updateIdentityStructuredData(root);
    }


    



    function initializeCompanyIdentityObserver() {
        if (
            state.identityObserver ||
            !document.body ||
            typeof MutationObserver !==
            "function"
        ) {
            return;
        }

        const pendingRoots =
            new Set();


        const flush =
            function () {
                state.identityFrame = null;

                pendingRoots.forEach(
                    (root) => {
                        applyGlobalCompanyIdentity(
                            root
                        );
                    }
                );

                pendingRoots.clear();
            };


        state.identityObserver =
            new MutationObserver(
                (mutations) => {
                    mutations.forEach(
                        (mutation) => {
                            mutation.addedNodes
                                .forEach((node) => {
                                    if (
                                        node.nodeType ===
                                        Node.ELEMENT_NODE ||
                                        node.nodeType ===
                                        Node.TEXT_NODE
                                    ) {
                                        pendingRoots.add(
                                            node
                                        );
                                    }
                                });
                        }
                    );

                    if (
                        !pendingRoots.size ||
                        state.identityFrame
                    ) {
                        return;
                    }

                    state.identityFrame =
                        window.requestAnimationFrame(
                            flush
                        );
                }
            );


        state.identityObserver.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }



    function renderSharedHeader() {
        const mounts = document.querySelectorAll(
            selectors.headerMount
        );

        if (!mounts.length) {
            return;
        }

        const config = state.config;
        const logo =
            config.brand.logos.light ||
            config.brand.logos.default;

        const desktopNavigation =
            config.navigation.primary
                .map(renderDesktopNavigationItem)
                .join("");

        const mobileNavigation =
            config.navigation.primary
                .map(renderMobileNavigationItem)
                .join("");

        const headerMarkup = `
      <header
        class="site-header"
        data-site-header-element
      >
        <div class="container-wide site-header__inner">
          <a
            class="site-logo"
            href="index.html"
            aria-label="${escapeAttribute(
            `${config.brand.name} home`
        )}"
          >
            <img
              src="${escapeAttribute(logo)}"
              alt="${escapeAttribute(config.brand.name)}"
              width="250"
              height="58"
              decoding="async"
            >
          </a>

          <nav
            class="site-navigation"
            aria-label="Primary navigation"
          >
            <ul class="site-navigation__list">
              ${desktopNavigation}
            </ul>
          </nav>

          <div class="site-header__actions">
            <a
              class="button site-header__cta"
              href="${escapeAttribute(
            config.header.cta.url
        )}"
            >
              <span>
                ${escapeHTML(config.header.cta.label)}
              </span>

              ${createIconMarkup(
            config.header.cta.icon,
            "button__icon"
        )}
            </a>

            <button
              class="mobile-menu-toggle"
              type="button"
              data-mobile-menu-open
              aria-controls="securehabit-mobile-menu"
              aria-expanded="false"
              aria-label="${escapeAttribute(
            config.navigation.mobileMenu.openLabel
        )}"
            >
              <span
                class="mobile-menu-toggle__lines"
                aria-hidden="true"
              >
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        class="mobile-menu"
        id="securehabit-mobile-menu"
        data-mobile-menu
        aria-hidden="true"
      >
        <div class="mobile-menu__inner">
          <div class="mobile-menu__head">
            <a
              class="mobile-menu__logo"
              href="index.html"
              aria-label="${escapeAttribute(
            `${config.brand.name} home`
        )}"
            >
              <img
                src="${escapeAttribute(logo)}"
                alt="${escapeAttribute(config.brand.name)}"
                width="250"
                height="58"
                decoding="async"
              >
            </a>

            <button
              class="mobile-menu__close"
              type="button"
              data-mobile-menu-close
              aria-label="${escapeAttribute(
            config.navigation.mobileMenu.closeLabel
        )}"
            >
              ${createIconMarkup("x")}
            </button>
          </div>

          <nav
            class="mobile-menu__navigation"
            aria-label="Mobile navigation"
          >
            <ul class="mobile-menu__list">
              ${mobileNavigation}
            </ul>
          </nav>

          <div class="mobile-menu__footer">
            <a
              class="button mobile-menu__cta"
              href="${escapeAttribute(
            config.header.cta.url
        )}"
            >
              <span>
                ${escapeHTML(config.header.cta.label)}
              </span>

              ${createIconMarkup(
            config.header.cta.icon,
            "button__icon"
        )}
            </a>

            <p class="mobile-menu__meta">
              ${escapeHTML(config.brand.tagline)}
            </p>
          </div>
        </div>
      </div>
    `;

        mounts.forEach((mount) => {
            mount.innerHTML = headerMarkup;
        });

        state.headerElement = document.querySelector(
            "[data-site-header-element]"
        );

        state.mobileMenuElement = document.querySelector(
            selectors.mobileMenu
        );
    }

    function renderDesktopNavigationItem(item) {
        const active = isNavigationItemActive(item);

        if (Array.isArray(item.children) && item.children.length) {
            const dropdownId =
                `desktop-dropdown-${item.id}`;

            const childLinks = item.children
                .map((child) => {
                    const childActive =
                        child.id === state.currentPage;

                    return `
            <a
              class="site-navigation__dropdown-link${childActive ? " is-active" : ""
                        }"
              href="${escapeAttribute(child.url)}"
              ${childActive ? 'aria-current="page"' : ""}
            >
              <span
                class="site-navigation__dropdown-icon"
                aria-hidden="true"
              >
                ${createIconMarkup(child.icon)}
              </span>

              <span>
                <span
                  class="site-navigation__dropdown-title"
                >
                  ${escapeHTML(child.label)}
                </span>

                <span
                  class="site-navigation__dropdown-copy"
                >
                  ${escapeHTML(child.description)}
                </span>
              </span>
            </a>
          `;
                })
                .join("");

            return `
        <li
          class="site-navigation__item"
          data-desktop-dropdown
        >
          <button
            class="site-navigation__submenu-trigger${active ? " is-active" : ""
                }"
            type="button"
            aria-expanded="false"
            aria-controls="${escapeAttribute(dropdownId)}"
            aria-haspopup="true"
          >
            <span>${escapeHTML(item.label)}</span>
            ${createIconMarkup("chevron-down")}
          </button>

          <div
            class="site-navigation__dropdown"
            id="${escapeAttribute(dropdownId)}"
          >
            <div class="site-navigation__dropdown-grid">
              ${childLinks}
            </div>

            <a
              class="site-navigation__dropdown-all"
              href="${escapeAttribute(item.url)}"
            >
              <span>
                ${escapeHTML(
                    state.config.navigation.topicMenuLabel
                )}
              </span>

              ${createIconMarkup("arrow-right")}
            </a>
          </div>
        </li>
      `;
        }

        return `
      <li class="site-navigation__item">
        <a
          class="site-navigation__link${active ? " is-active" : ""
            }"
          href="${escapeAttribute(item.url)}"
          ${active ? 'aria-current="page"' : ""}
        >
          ${escapeHTML(item.label)}
        </a>
      </li>
    `;
    }

    function renderMobileNavigationItem(item) {
        const active = isNavigationItemActive(item);

        if (Array.isArray(item.children) && item.children.length) {
            const submenuId =
                `mobile-submenu-${item.id}`;

            const children = item.children
                .map((child) => {
                    const childActive =
                        child.id === state.currentPage;

                    return `
            <li>
              <a
                class="mobile-menu__submenu-link${childActive ? " is-active" : ""
                        }"
                href="${escapeAttribute(child.url)}"
                ${childActive ? 'aria-current="page"' : ""}
              >
                ${escapeHTML(child.label)}
              </a>
            </li>
          `;
                })
                .join("");

            return `
        <li class="mobile-menu__item">
          <button
            class="mobile-menu__accordion-trigger${active ? " is-active" : ""
                }"
            type="button"
            aria-expanded="false"
            aria-controls="${escapeAttribute(submenuId)}"
            data-mobile-submenu-trigger
          >
            <span>${escapeHTML(item.label)}</span>
            ${createIconMarkup("plus")}
          </button>

          <div
            class="mobile-menu__submenu"
            id="${escapeAttribute(submenuId)}"
            aria-hidden="true"
          >
            <div class="mobile-menu__submenu-inner">
              <ul class="mobile-menu__submenu-list">
                <li>
                  <a
                    class="mobile-menu__submenu-link"
                    href="${escapeAttribute(item.url)}"
                  >
                    ${escapeHTML(
                    state.config.navigation.topicMenuLabel
                )}
                  </a>
                </li>

                ${children}
              </ul>
            </div>
          </div>
        </li>
      `;
        }

        return `
      <li class="mobile-menu__item">
        <a
          class="mobile-menu__link${active ? " is-active" : ""
            }"
          href="${escapeAttribute(item.url)}"
          ${active ? 'aria-current="page"' : ""}
        >
          <span>${escapeHTML(item.label)}</span>
          ${createIconMarkup("arrow-up-right")}
        </a>
      </li>
    `;
    }


    



    function initializeDesktopNavigation() {
        const dropdowns = Array.from(
            document.querySelectorAll(
                selectors.desktopDropdown
            )
        );

        if (!dropdowns.length) {
            return;
        }

        const closeAllDropdowns = (except = null) => {
            dropdowns.forEach((dropdown) => {
                if (dropdown === except) {
                    return;
                }

                const trigger = dropdown.querySelector(
                    ".site-navigation__submenu-trigger"
                );

                dropdown.classList.remove("is-open");
                trigger?.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });
        };

        dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector(
                ".site-navigation__submenu-trigger"
            );

            const panel = dropdown.querySelector(
                ".site-navigation__dropdown"
            );

            if (!trigger || !panel) {
                return;
            }

            trigger.addEventListener("click", () => {
                const willOpen =
                    !dropdown.classList.contains("is-open");

                closeAllDropdowns(
                    willOpen ? dropdown : null
                );

                dropdown.classList.toggle(
                    "is-open",
                    willOpen
                );

                trigger.setAttribute(
                    "aria-expanded",
                    String(willOpen)
                );
            });

            trigger.addEventListener(
                "keydown",
                (event) => {
                    if (
                        event.key !== "ArrowDown" &&
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {
                        return;
                    }

                    if (event.key === "ArrowDown") {
                        event.preventDefault();

                        closeAllDropdowns(dropdown);
                        dropdown.classList.add("is-open");
                        trigger.setAttribute(
                            "aria-expanded",
                            "true"
                        );

                        panel
                            .querySelector(focusableSelector)
                            ?.focus();
                    }
                }
            );

            dropdown.addEventListener(
                "mouseenter",
                () => {
                    closeAllDropdowns(dropdown);
                    dropdown.classList.add("is-open");
                    trigger.setAttribute(
                        "aria-expanded",
                        "true"
                    );
                }
            );

            dropdown.addEventListener(
                "mouseleave",
                () => {
                    dropdown.classList.remove("is-open");
                    trigger.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );

            dropdown.addEventListener(
                "keydown",
                (event) => {
                    if (event.key !== "Escape") {
                        return;
                    }

                    event.preventDefault();
                    dropdown.classList.remove("is-open");
                    trigger.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                    trigger.focus();
                }
            );
        });

        document.addEventListener("click", (event) => {
            if (
                !event.target.closest(
                    selectors.desktopDropdown
                )
            ) {
                closeAllDropdowns();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeAllDropdowns();
            }
        });

        window.SecureHabitCloseDesktopDropdowns =
            closeAllDropdowns;
    }


    



    function initializeMobileNavigation() {
        const menu = state.mobileMenuElement;
        const openButton = document.querySelector(
            selectors.mobileMenuOpen
        );

        const closeButton = menu?.querySelector(
            selectors.mobileMenuClose
        );

        if (!menu || !openButton || !closeButton) {
            return;
        }

        const openMenu = () => {
            state.mobileMenuReturnFocus =
                document.activeElement;

            window.SecureHabitCloseDesktopDropdowns?.();

            menu.classList.add("is-open");
            menu.setAttribute("aria-hidden", "false");

            openButton.setAttribute(
                "aria-expanded",
                "true"
            );

            document.body.classList.add(
                "has-mobile-menu-open"
            );

            requestFrame(() => {
                closeButton.focus();
            });

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:mobilemenuopen"
                )
            );
        };

        const closeMenu = ({
            restoreFocus = true
        } = {}) => {
            if (!menu.classList.contains("is-open")) {
                return;
            }

            menu.classList.remove("is-open");
            menu.setAttribute("aria-hidden", "true");

            openButton.setAttribute(
                "aria-expanded",
                "false"
            );

            document.body.classList.remove(
                "has-mobile-menu-open"
            );

            closeMobileSubmenus();

            if (
                restoreFocus &&
                state.mobileMenuReturnFocus instanceof HTMLElement
            ) {
                state.mobileMenuReturnFocus.focus();
            }

            window.dispatchEvent(
                new CustomEvent(
                    "securehabit:mobilemenuclose"
                )
            );
        };

        openButton.addEventListener(
            "click",
            openMenu
        );

        closeButton.addEventListener(
            "click",
            () => closeMenu()
        );

        menu.addEventListener("click", (event) => {
            const link = event.target.closest("a[href]");

            if (link) {
                closeMenu({
                    restoreFocus: false
                });
            }
        });

        menu.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeMenu();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            trapFocusInside(menu, event);
        });

        menu
            .querySelectorAll(
                "[data-mobile-submenu-trigger]"
            )
            .forEach((trigger) => {
                trigger.addEventListener("click", () => {
                    const controls =
                        trigger.getAttribute("aria-controls");

                    const submenu = controls
                        ? document.getElementById(controls)
                        : null;

                    if (!submenu) {
                        return;
                    }

                    const expanded =
                        trigger.getAttribute(
                            "aria-expanded"
                        ) === "true";

                    trigger.setAttribute(
                        "aria-expanded",
                        String(!expanded)
                    );

                    submenu.setAttribute(
                        "aria-hidden",
                        String(expanded)
                    );
                });
            });

        window.addEventListener(
            "resize",
            () => {
                if (state.resizeFrame) {
                    cancelAnimationFrame(
                        state.resizeFrame
                    );
                }

                state.resizeFrame = requestFrame(() => {
                    state.resizeFrame = null;

                    if (window.innerWidth > 1024) {
                        closeMenu({
                            restoreFocus: false
                        });
                    }
                });
            },
            {
                passive: true
            }
        );

        window.addEventListener(
            "hashchange",
            () => {
                closeMenu({
                    restoreFocus: false
                });
            }
        );

        function closeMobileSubmenus() {
            menu
                .querySelectorAll(
                    "[data-mobile-submenu-trigger]"
                )
                .forEach((trigger) => {
                    const controls =
                        trigger.getAttribute("aria-controls");

                    const submenu = controls
                        ? document.getElementById(controls)
                        : null;

                    trigger.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    submenu?.setAttribute(
                        "aria-hidden",
                        "true"
                    );
                });
        }

        window.SecureHabitOpenMobileMenu = openMenu;
        window.SecureHabitCloseMobileMenu = closeMenu;
    }

    function trapFocusInside(container, event) {
        const focusableElements = Array.from(
            container.querySelectorAll(
                focusableSelector
            )
        ).filter((element) => {
            return (
                !element.hidden &&
                element.getAttribute("aria-hidden") !== "true" &&
                element.offsetParent !== null
            );
        });

        if (!focusableElements.length) {
            event.preventDefault();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement =
            focusableElements[
            focusableElements.length - 1
            ];

        if (
            event.shiftKey &&
            document.activeElement === firstElement
        ) {
            event.preventDefault();
            lastElement.focus();
            return;
        }

        if (
            !event.shiftKey &&
            document.activeElement === lastElement
        ) {
            event.preventDefault();
            firstElement.focus();
        }
    }


    



    function renderSharedFooter() {
        const mounts = document.querySelectorAll(
            selectors.footerMount
        );

        if (!mounts.length) {
            return;
        }

        const config = state.config;
        const footer = config.footer;
        const logo =
            config.brand.logos.light ||
            config.brand.logos.default;

        const columns = footer.columns
            .map((column) => {
                const links = column.links
                    .map((link) => {
                        return `
              <li>
                <a
                  class="site-footer__link"
                  href="${escapeAttribute(link.url)}"
                >
                  ${escapeHTML(link.label)}
                </a>
              </li>
            `;
                    })
                    .join("");

                return `
          <div class="site-footer__column">
            <h2 class="site-footer__column-title">
              ${escapeHTML(column.title)}
            </h2>

            <ul class="site-footer__links">
              ${links}
            </ul>
          </div>
        `;
            })
            .join("");

        const legalLinks = footer.legalLinks
            .map((link) => {
                return `
          <li>
            <a
              class="site-footer__legal-link"
              href="${escapeAttribute(link.url)}"
            >
              ${escapeHTML(link.label)}
            </a>
          </li>
        `;
            })
            .join("");

        const socialLinks =
            renderFooterSocialLinks(
                footer.socialLinks || []
            );

        const copyright =
            replaceYearTokens(
                footer.copyrightText
            );

        const markup = `
      <footer class="site-footer">
        <span
          class="site-footer__decoration"
          aria-hidden="true"
        ></span>

        <div class="site-footer__main">
          <div class="container-wide site-footer__grid">
            <div class="site-footer__brand">
              <a
                class="site-footer__logo"
                href="index.html"
                aria-label="${escapeAttribute(
            `${config.brand.name} home`
        )}"
              >
                <img
                  src="${escapeAttribute(logo)}"
                  alt="${escapeAttribute(
            config.brand.name
        )}"
                  width="280"
                  height="64"
                  loading="lazy"
                  decoding="async"
                >
              </a>

              <p class="site-footer__description">
                ${escapeHTML(footer.description)}
              </p>

              <div class="site-footer__contact">
                <div class="site-footer__contact-item">
                  ${createIconMarkup("mail")}

                  <a
                    class="site-footer__contact-link"
                    href="${escapeAttribute(
            config.contact.emailHref
        )}"
                  >
                    ${escapeHTML(
            config.contact.emailDisplay
        )}
                  </a>
                </div>

                <div class="site-footer__contact-item">
                  ${createIconMarkup("map-pin")}

                  <a
                    class="site-footer__contact-link"
                    href="${escapeAttribute(
            config.company.mapHref
        )}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ${escapeHTML(
            config.company.address.full
        )}
                  </a>
                </div>

                <div class="site-footer__contact-item">
                  ${createIconMarkup("globe-2")}

                  <span>
                    ${escapeHTML(
            config.company.serviceArea
        )}
                  </span>
                </div>
              </div>

              ${socialLinks}
            </div>

            ${columns}
          </div>
        </div>

        <div class="site-footer__disclaimer">
          <div class="container-wide">
            <p>
              ${escapeHTML(footer.disclaimerShort)}
            </p>
          </div>
        </div>

        <div class="site-footer__bottom">
          <div
            class="container-wide
                   site-footer__bottom-inner"
          >
            <p class="site-footer__copyright">
              ${escapeHTML(copyright)}
            </p>

            <ul class="site-footer__legal">
              ${legalLinks}
            </ul>
          </div>
        </div>
      </footer>
    `;

        mounts.forEach((mount) => {
            mount.innerHTML = markup;
        });
    }

    function renderFooterSocialLinks(socialLinks) {
        const availableLinks = socialLinks.filter(
            (link) => link?.url && link?.label
        );

        if (!availableLinks.length) {
            return "";
        }

        return `
      <div class="site-footer__social">
        ${availableLinks
                .map((link) => {
                    return `
              <a
                class="icon-button"
                href="${escapeAttribute(link.url)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="${escapeAttribute(
                        link.label
                    )}"
              >
                ${createIconMarkup(
                        link.icon || "external-link"
                    )}
              </a>
            `;
                })
                .join("")}
      </div>
    `;
    }


    



    function renderBreadcrumbs() {
        const mounts = document.querySelectorAll(
            selectors.breadcrumbMount
        );

        if (!mounts.length) {
            return;
        }

        const breadcrumbs =
            state.config.breadcrumbs[
            state.currentPage
            ] || [];

        if (!breadcrumbs.length) {
            mounts.forEach((mount) => {
                mount.hidden = true;
            });

            return;
        }

        const items = breadcrumbs
            .map((item, index) => {
                const isCurrent =
                    index === breadcrumbs.length - 1;

                return `
          <li class="breadcrumbs__item">
            ${isCurrent
                        ? `
                  <span aria-current="page">
                    ${escapeHTML(item.label)}
                  </span>
                `
                        : `
                  <a
                    class="breadcrumbs__link"
                    href="${escapeAttribute(item.url)}"
                  >
                    ${escapeHTML(item.label)}
                  </a>
                `
                    }
          </li>
        `;
            })
            .join("");

        const markup = `
      <nav
        class="breadcrumbs"
        aria-label="Breadcrumb"
      >
        <ol class="breadcrumbs__list">
          ${items}
        </ol>
      </nav>
    `;

        mounts.forEach((mount) => {
            mount.hidden = false;
            mount.innerHTML = markup;
        });
    }


    



    function applyPageMetadata() {
        const seo =
            state.config.seo.pages[
            state.currentPage
            ] ||
            state.config.seo.default;

        if (!seo) {
            return;
        }

        document.title =
            seo.title ||
            state.config.seo.default.title;

        setMetaByName(
            "description",
            seo.description ||
            state.config.seo.default.description
        );

        setMetaByName(
            "robots",
            seo.robots ||
            state.config.seo.default.robots
        );

        setMetaByProperty(
            "og:type",
            "website"
        );

        setMetaByProperty(
            "og:site_name",
            state.config.brand.name
        );

        setMetaByProperty(
            "og:title",
            seo.title
        );

        setMetaByProperty(
            "og:description",
            seo.description
        );

        setMetaByProperty(
            "og:url",
            seo.canonical
        );

        setMetaByProperty(
            "og:image",
            seo.ogImage ||
            state.config.seo.default.ogImage
        );

        setMetaByName(
            "twitter:card",
            seo.twitterCard ||
            state.config.seo.default.twitterCard
        );

        setMetaByName(
            "twitter:title",
            seo.title
        );

        setMetaByName(
            "twitter:description",
            seo.description
        );

        setMetaByName(
            "twitter:image",
            seo.ogImage ||
            state.config.seo.default.ogImage
        );

        setCanonicalLink(
            seo.canonical ||
            state.config.seo.default.canonical
        );
    }

    function setMetaByName(name, content) {
        if (!name || !content) {
            return;
        }

        let element = document.head.querySelector(
            `meta[name="${CSS.escape(name)}"]`
        );

        if (!element) {
            element = document.createElement("meta");
            element.setAttribute("name", name);
            document.head.appendChild(element);
        }

        element.setAttribute(
            "content",
            String(content)
        );
    }

    function setMetaByProperty(property, content) {
        if (!property || !content) {
            return;
        }

        let element = document.head.querySelector(
            `meta[property="${CSS.escape(property)}"]`
        );

        if (!element) {
            element = document.createElement("meta");
            element.setAttribute(
                "property",
                property
            );

            document.head.appendChild(element);
        }

        element.setAttribute(
            "content",
            String(content)
        );
    }

    function setCanonicalLink(url) {
        if (!url) {
            return;
        }

        let element = document.head.querySelector(
            'link[rel="canonical"]'
        );

        if (!element) {
            element = document.createElement("link");
            element.setAttribute(
                "rel",
                "canonical"
            );

            document.head.appendChild(element);
        }

        element.setAttribute("href", url);
    }


    



    function injectStructuredData() {
        document
            .querySelectorAll(
                'script[data-securehabit-schema="true"]'
            )
            .forEach((element) => element.remove());

        const seo =
            state.config.seo.pages[
            state.currentPage
            ] ||
            state.config.seo.default;

        const schemas = [
            state.config.schema.organization,
            state.config.schema.website,
            createPageSchema(seo)
        ];

        const breadcrumbSchema =
            createBreadcrumbSchema();

        if (breadcrumbSchema) {
            schemas.push(breadcrumbSchema);
        }

        schemas
            .filter(Boolean)
            .forEach((schema) => {
                const script =
                    document.createElement("script");

                script.type = "application/ld+json";
                script.dataset.securehabitSchema =
                    "true";

                script.textContent =
                    JSON.stringify(schema);

                document.head.appendChild(script);
            });
    }

    function createPageSchema(seo) {
        if (!seo) {
            return null;
        }

        return {
            "@context": "https://schema.org",
            "@type": seo.schemaType || "WebPage",
            name: seo.title,
            description: seo.description,
            url: seo.canonical,
            inLanguage:
                state.config.meta.locale || "en-US",
            isPartOf: {
                "@type": "WebSite",
                name: state.config.brand.name,
                url: state.config.meta.siteUrl
            },
            publisher: {
                "@type": "Organization",
                name: state.config.brand.name,
                url: state.config.meta.siteUrl
            }
        };
    }

    function createBreadcrumbSchema() {
        const breadcrumbs =
            state.config.breadcrumbs[
            state.currentPage
            ];

        if (
            !Array.isArray(breadcrumbs) ||
            breadcrumbs.length < 2
        ) {
            return null;
        }

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map(
                (item, index) => {
                    return {
                        "@type": "ListItem",
                        position: index + 1,
                        name: item.label,
                        item: createAbsoluteUrl(item.url)
                    };
                }
            )
        };
    }

    function createAbsoluteUrl(url) {
        const normalized = normalizeUrl(url);

        if (!normalized) {
            return state.config.meta.siteUrl;
        }

        try {
            return new URL(
                normalized,
                `${state.config.meta.siteUrl}/`
            ).href;
        } catch {
            return normalized;
        }
    }


    



    function initializeAccordions(root = document) {
        root
            .querySelectorAll(selectors.accordion)
            .forEach((accordion, accordionIndex) => {
                if (
                    accordion.dataset.accordionInitialized ===
                    "true"
                ) {
                    return;
                }

                accordion.dataset.accordionInitialized =
                    "true";

                const triggers = Array.from(
                    accordion.querySelectorAll(
                        ".accordion__trigger"
                    )
                );

                triggers.forEach(
                    (trigger, triggerIndex) => {
                        const item =
                            trigger.closest(
                                ".accordion__item"
                            );

                        const panel =
                            item?.querySelector(
                                ".accordion__panel"
                            );

                        if (!panel) {
                            return;
                        }

                        const triggerId =
                            trigger.id ||
                            `accordion-trigger-${accordionIndex}-${triggerIndex}`;

                        const panelId =
                            panel.id ||
                            `accordion-panel-${accordionIndex}-${triggerIndex}`;

                        trigger.id = triggerId;
                        panel.id = panelId;

                        trigger.setAttribute(
                            "aria-controls",
                            panelId
                        );

                        panel.setAttribute(
                            "aria-labelledby",
                            triggerId
                        );

                        const initiallyExpanded =
                            trigger.getAttribute(
                                "aria-expanded"
                            ) === "true";

                        setAccordionState(
                            trigger,
                            panel,
                            initiallyExpanded
                        );

                        trigger.addEventListener(
                            "click",
                            () => {
                                const expanded =
                                    trigger.getAttribute(
                                        "aria-expanded"
                                    ) === "true";

                                if (
                                    accordion.dataset.accordionSingle ===
                                    "true" &&
                                    !expanded
                                ) {
                                    closeSiblingAccordions(
                                        accordion,
                                        trigger
                                    );
                                }

                                setAccordionState(
                                    trigger,
                                    panel,
                                    !expanded
                                );
                            }
                        );

                        trigger.addEventListener(
                            "keydown",
                            (event) => {
                                handleAccordionKeyboard(
                                    event,
                                    triggers,
                                    triggerIndex
                                );
                            }
                        );
                    }
                );
            });
    }

    function setAccordionState(
        trigger,
        panel,
        expanded
    ) {
        trigger.setAttribute(
            "aria-expanded",
            String(expanded)
        );

        panel.setAttribute(
            "aria-hidden",
            String(!expanded)
        );

        trigger
            .closest(".accordion__item")
            ?.classList.toggle(
                "is-open",
                expanded
            );

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:accordionchange",
                {
                    detail: {
                        trigger,
                        panel,
                        expanded
                    }
                }
            )
        );
    }

    function closeSiblingAccordions(
        accordion,
        activeTrigger
    ) {
        accordion
            .querySelectorAll(
                ".accordion__trigger"
            )
            .forEach((trigger) => {
                if (trigger === activeTrigger) {
                    return;
                }

                const panel = trigger
                    .closest(".accordion__item")
                    ?.querySelector(
                        ".accordion__panel"
                    );

                if (panel) {
                    setAccordionState(
                        trigger,
                        panel,
                        false
                    );
                }
            });
    }

    function handleAccordionKeyboard(
        event,
        triggers,
        currentIndex
    ) {
        let nextIndex = null;

        switch (event.key) {
            case "ArrowDown":
                nextIndex =
                    (currentIndex + 1) %
                    triggers.length;
                break;

            case "ArrowUp":
                nextIndex =
                    (currentIndex - 1 + triggers.length) %
                    triggers.length;
                break;

            case "Home":
                nextIndex = 0;
                break;

            case "End":
                nextIndex = triggers.length - 1;
                break;

            default:
                return;
        }

        event.preventDefault();
        triggers[nextIndex]?.focus();
    }


    



    function initializeTabs(root = document) {
        root
            .querySelectorAll(selectors.tabs)
            .forEach((tabs, tabsIndex) => {
                if (
                    tabs.dataset.tabsInitialized ===
                    "true"
                ) {
                    return;
                }

                tabs.dataset.tabsInitialized =
                    "true";

                const tabList =
                    tabs.querySelector(
                        '[role="tablist"], [data-tab-list]'
                    );

                const tabButtons = Array.from(
                    tabs.querySelectorAll(
                        '[role="tab"], [data-tab]'
                    )
                );

                if (!tabList || !tabButtons.length) {
                    return;
                }

                tabList.setAttribute(
                    "role",
                    "tablist"
                );

                tabButtons.forEach(
                    (button, buttonIndex) => {
                        button.setAttribute("role", "tab");

                        const panelId =
                            button.getAttribute(
                                "aria-controls"
                            ) ||
                            button.dataset.tabTarget ||
                            `tab-panel-${tabsIndex}-${buttonIndex}`;

                        const panel =
                            tabs.querySelector(
                                `#${CSS.escape(panelId)}`
                            );

                        if (!panel) {
                            return;
                        }

                        const buttonId =
                            button.id ||
                            `tab-button-${tabsIndex}-${buttonIndex}`;

                        button.id = buttonId;
                        button.setAttribute(
                            "aria-controls",
                            panelId
                        );

                        panel.id = panelId;
                        panel.setAttribute(
                            "role",
                            "tabpanel"
                        );

                        panel.setAttribute(
                            "aria-labelledby",
                            buttonId
                        );

                        button.addEventListener(
                            "click",
                            () => {
                                activateTab(
                                    tabs,
                                    button,
                                    {
                                        moveFocus: false
                                    }
                                );
                            }
                        );

                        button.addEventListener(
                            "keydown",
                            (event) => {
                                handleTabKeyboard(
                                    event,
                                    tabs,
                                    tabButtons,
                                    buttonIndex
                                );
                            }
                        );
                    }
                );

                const selected =
                    tabButtons.find(
                        (button) =>
                            button.getAttribute(
                                "aria-selected"
                            ) === "true"
                    ) ||
                    tabButtons[0];

                activateTab(tabs, selected, {
                    moveFocus: false
                });
            });
    }

    function activateTab(
        tabs,
        selectedButton,
        {
            moveFocus = true
        } = {}
    ) {
        const buttons = Array.from(
            tabs.querySelectorAll(
                '[role="tab"]'
            )
        );

        buttons.forEach((button) => {
            const selected =
                button === selectedButton;

            button.setAttribute(
                "aria-selected",
                String(selected)
            );

            button.tabIndex = selected ? 0 : -1;

            const panelId =
                button.getAttribute(
                    "aria-controls"
                );

            const panel = panelId
                ? tabs.querySelector(
                    `#${CSS.escape(panelId)}`
                )
                : null;

            if (panel) {
                panel.hidden = !selected;
            }
        });

        if (moveFocus) {
            selectedButton.focus();
        }

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:tabchange",
                {
                    detail: {
                        tabs,
                        selectedButton,
                        value:
                            selectedButton.dataset.value ||
                            selectedButton.id
                    }
                }
            )
        );
    }

    function handleTabKeyboard(
        event,
        tabs,
        buttons,
        currentIndex
    ) {
        let nextIndex = null;

        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                nextIndex =
                    (currentIndex + 1) %
                    buttons.length;
                break;

            case "ArrowLeft":
            case "ArrowUp":
                nextIndex =
                    (currentIndex - 1 + buttons.length) %
                    buttons.length;
                break;

            case "Home":
                nextIndex = 0;
                break;

            case "End":
                nextIndex = buttons.length - 1;
                break;

            default:
                return;
        }

        event.preventDefault();

        activateTab(
            tabs,
            buttons[nextIndex],
            {
                moveFocus: true
            }
        );
    }


    



    function renderCookieConsent() {
        if (!state.config.cookieConsent.enabled) {
            return;
        }

        let mount = document.querySelector(
            selectors.cookieMount
        );

        if (!mount) {
            mount = document.createElement("div");
            mount.dataset.cookieConsent = "";
            document.body.appendChild(mount);
        }

        const cookie = state.config.cookieConsent;
        const necessary =
            cookie.categories.necessary;
        const preferences =
            cookie.categories.preferences;

        mount.innerHTML = `
      <section
        class="cookie-banner"
        data-cookie-banner
        aria-label="${escapeAttribute(
            cookie.title
        )}"
        aria-hidden="true"
      >
        <div class="cookie-banner__content">
          <div>
            <h2 class="cookie-banner__title">
              ${escapeHTML(cookie.title)}
            </h2>

            <p class="cookie-banner__description">
              ${escapeHTML(cookie.description)}
            </p>

            <a
              class="cookie-banner__policy"
              href="${escapeAttribute(
            cookie.policyUrl
        )}"
            >
              ${escapeHTML(cookie.policyLabel)}
            </a>
          </div>

          <div class="cookie-banner__actions">
            <button
              class="button button--secondary
                     cookie-banner__button"
              type="button"
              data-cookie-reject
            >
              ${escapeHTML(
            cookie.buttons.rejectOptional
        )}
            </button>

            <button
              class="button button--secondary
                     cookie-banner__button"
              type="button"
              data-cookie-manage
            >
              ${escapeHTML(
            cookie.buttons.managePreferences
        )}
            </button>

            <button
              class="button cookie-banner__button"
              type="button"
              data-cookie-accept
            >
              ${escapeHTML(
            cookie.buttons.acceptOptional
        )}
            </button>
          </div>
        </div>
      </section>

      <dialog
        class="cookie-preferences"
        id="${escapeAttribute(
            cookie.dialogId
        )}"
        data-cookie-dialog
        aria-labelledby="cookie-preferences-title"
      >
        <div class="cookie-preferences__inner">
          <div class="cookie-preferences__head">
            <div>
              <h2
                class="cookie-preferences__title"
                id="cookie-preferences-title"
              >
                ${escapeHTML(cookie.title)}
              </h2>

              <p
                class="cookie-preferences__description"
              >
                ${escapeHTML(cookie.description)}
              </p>
            </div>

            <button
              class="icon-button"
              type="button"
              data-cookie-close
              aria-label="${escapeAttribute(
            state.config.accessibility
                .closeDialogLabel
        )}"
            >
              ${createIconMarkup("x")}
            </button>
          </div>

          <div class="cookie-preferences__list">
            <div class="cookie-preferences__item">
              <div>
                <h3
                  class="cookie-preferences__item-title"
                >
                  ${escapeHTML(necessary.label)}
                </h3>

                <p
                  class="cookie-preferences__item-copy"
                >
                  ${escapeHTML(
            necessary.description
        )}
                </p>
              </div>

              <label class="preference-switch">
                <span class="sr-only">
                  ${escapeHTML(necessary.label)}
                </span>

                <input
                  type="checkbox"
                  checked
                  disabled
                  data-cookie-necessary
                >

                <span
                  class="preference-switch__track"
                  aria-hidden="true"
                ></span>
              </label>
            </div>

            <div class="cookie-preferences__item">
              <div>
                <h3
                  class="cookie-preferences__item-title"
                >
                  ${escapeHTML(preferences.label)}
                </h3>

                <p
                  class="cookie-preferences__item-copy"
                >
                  ${escapeHTML(
            preferences.description
        )}
                </p>
              </div>

              <label class="preference-switch">
                <span class="sr-only">
                  ${escapeHTML(preferences.label)}
                </span>

                <input
                  type="checkbox"
                  data-cookie-preferences-input
                >

                <span
                  class="preference-switch__track"
                  aria-hidden="true"
                ></span>
              </label>
            </div>
          </div>

          <div class="cookie-preferences__actions">
            <button
              class="button button--secondary"
              type="button"
              data-cookie-reject
            >
              ${escapeHTML(
            cookie.buttons.rejectOptional
        )}
            </button>

            <button
              class="button"
              type="button"
              data-cookie-save
            >
              ${escapeHTML(
            cookie.buttons.savePreferences
        )}
            </button>
          </div>
        </div>
      </dialog>

      <div
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
        data-cookie-status
      ></div>
    `;

        initializeCookieConsent(mount);
    }

    function initializeCookieConsent(mount) {
        const cookie = state.config.cookieConsent;

        const banner = mount.querySelector(
            "[data-cookie-banner]"
        );

        const dialog = mount.querySelector(
            "[data-cookie-dialog]"
        );

        const preferenceInput =
            mount.querySelector(
                "[data-cookie-preferences-input]"
            );

        const status = mount.querySelector(
            "[data-cookie-status]"
        );

        if (
            !banner ||
            !dialog ||
            !preferenceInput
        ) {
            return;
        }

        const savedPreferences =
            readCookiePreferences();

        if (!savedPreferences) {
            requestFrame(() => {
                showCookieBanner(banner);
            });
        } else {
            preferenceInput.checked =
                Boolean(savedPreferences.preferences);
        }

        mount
            .querySelectorAll("[data-cookie-accept]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    saveCookiePreferences({
                        necessary: true,
                        preferences: true
                    });

                    preferenceInput.checked = true;

                    hideCookieBanner(banner);
                    closeCookieDialog(dialog);

                    announceCookieStatus(
                        status,
                        cookie.statusMessages.accepted
                    );
                });
            });

        mount
            .querySelectorAll("[data-cookie-reject]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    saveCookiePreferences({
                        necessary: true,
                        preferences: false
                    });

                    preferenceInput.checked = false;

                    hideCookieBanner(banner);
                    closeCookieDialog(dialog);

                    announceCookieStatus(
                        status,
                        cookie.statusMessages.rejected
                    );
                });
            });

        mount
            .querySelectorAll("[data-cookie-manage]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    state.cookieDialogReturnFocus =
                        button;

                    const stored =
                        readCookiePreferences();

                    preferenceInput.checked =
                        Boolean(
                            stored?.preferences
                        );

                    openCookieDialog(dialog);
                });
            });

        mount
            .querySelectorAll("[data-cookie-close]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    closeCookieDialog(dialog);
                });
            });

        mount
            .querySelectorAll("[data-cookie-save]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    saveCookiePreferences({
                        necessary: true,
                        preferences:
                            preferenceInput.checked
                    });

                    hideCookieBanner(banner);
                    closeCookieDialog(dialog);

                    announceCookieStatus(
                        status,
                        cookie.statusMessages.saved
                    );
                });
            });

        dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            closeCookieDialog(dialog);
        });

        dialog.addEventListener("close", () => {
            document.body.classList.remove(
                "has-dialog-open"
            );
        });
    }

    function showCookieBanner(banner) {
        banner.classList.add("is-visible");
        banner.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function hideCookieBanner(banner) {
        banner.classList.remove("is-visible");
        banner.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    function openCookieDialog(dialog) {
        document.body.classList.add(
            "has-dialog-open"
        );

        if (
            typeof dialog.showModal === "function"
        ) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            dialog.setAttribute("open", "");
            dialog.setAttribute(
                "aria-modal",
                "true"
            );
        }

        requestFrame(() => {
            dialog
                .querySelector(
                    "[data-cookie-close]"
                )
                ?.focus();
        });
    }

    function closeCookieDialog(dialog) {
        if (
            typeof dialog.close === "function" &&
            dialog.open
        ) {
            dialog.close();
        } else {
            dialog.removeAttribute("open");
            dialog.removeAttribute("aria-modal");
        }

        document.body.classList.remove(
            "has-dialog-open"
        );

        if (
            state.cookieDialogReturnFocus instanceof
            HTMLElement
        ) {
            state.cookieDialogReturnFocus.focus();
        }
    }

    function readCookiePreferences() {
        const cookie = state.config.cookieConsent;

        try {
            const stored = window.localStorage.getItem(
                cookie.storageKey
            );

            if (!stored) {
                return null;
            }

            const parsed = JSON.parse(stored);

            if (
                parsed.version !== cookie.version ||
                typeof parsed.preferences !== "boolean"
            ) {
                return null;
            }

            return parsed;
        } catch {
            return null;
        }
    }

    function saveCookiePreferences(values) {
        const cookie = state.config.cookieConsent;

        const preferences = {
            version: cookie.version,
            necessary: true,
            preferences:
                Boolean(values.preferences),
            savedAt: new Date().toISOString()
        };

        try {
            window.localStorage.setItem(
                cookie.storageKey,
                JSON.stringify(preferences)
            );
        } catch {
            



        }

        window.dispatchEvent(
            new CustomEvent(
                "securehabit:cookiepreferences",
                {
                    detail: preferences
                }
            )
        );

        return preferences;
    }

    function announceCookieStatus(
        element,
        message
    ) {
        if (!element) {
            return;
        }

        element.textContent = "";

        requestFrame(() => {
            element.textContent = message;
        });
    }


    



    function initializeHeaderScrollState() {
        const header = state.headerElement;

        if (!header) {
            return;
        }

        const update = () => {
            state.scrollFrame = null;

            header.classList.toggle(
                "is-scrolled",
                window.scrollY > 18
            );
        };

        update();

        window.addEventListener(
            "scroll",
            () => {
                if (state.scrollFrame) {
                    return;
                }

                state.scrollFrame =
                    requestFrame(update);
            },
            {
                passive: true
            }
        );
    }

    function initializeHeaderHeightTracking() {
        const header = state.headerElement;

        if (!header) {
            return;
        }

        const measuredElement =
            header.querySelector(".site-header__inner") ||
            header;

        const updateHeight = () => {
            const height = Math.ceil(
                measuredElement.getBoundingClientRect().height
            );

            if (height > 0) {
                document.documentElement.style.setProperty(
                    "--header-height",
                    `${height}px`
                );
            }
        };

        updateHeight();

        if ("ResizeObserver" in window) {
            const observer = new ResizeObserver(
                updateHeight
            );

            observer.observe(measuredElement);
            return;
        }

        window.addEventListener(
            "resize",
            updateHeight,
            {
                passive: true
            }
        );
    }


    



    function initializeExternalLinks(
        root = document
    ) {
        root
            .querySelectorAll(
                'a[target="_blank"]'
            )
            .forEach((link) => {
                const rel = new Set(
                    String(
                        link.getAttribute("rel") || ""
                    )
                        .split(/\s+/)
                        .filter(Boolean)
                );

                rel.add("noopener");
                rel.add("noreferrer");

                link.setAttribute(
                    "rel",
                    Array.from(rel).join(" ")
                );
            });
    }


    



    function updateSourcePageFields(
        root = document
    ) {
        const sourceValue =
            `${window.location.pathname}${window.location.search}${window.location.hash}`;

        root
            .querySelectorAll(
                'input[name="sourcePage"]'
            )
            .forEach((input) => {
                input.value = sourceValue;
            });

        root
            .querySelectorAll(
                'input[name="formStartedAt"]'
            )
            .forEach((input) => {
                if (!input.value) {
                    input.value = String(Date.now());
                }
            });
    }


    



    function initializePrintActions(
        root = document
    ) {
        root
            .querySelectorAll(
                "[data-print-action], [data-action='print']"
            )
            .forEach((button) => {
                if (
                    button.dataset.printInitialized ===
                    "true"
                ) {
                    return;
                }

                button.dataset.printInitialized =
                    "true";

                button.addEventListener(
                    "click",
                    (event) => {
                        event.preventDefault();

                        const targetSelector =
                            button.dataset.printTarget;

                        const target = targetSelector
                            ? document.querySelector(
                                targetSelector
                            )
                            : null;

                        if (target) {
                            target.classList.add(
                                "is-print-target"
                            );

                            document.body.classList.add(
                                "has-print-target"
                            );

                            const cleanup = () => {
                                target.classList.remove(
                                    "is-print-target"
                                );

                                document.body.classList.remove(
                                    "has-print-target"
                                );

                                window.removeEventListener(
                                    "afterprint",
                                    cleanup
                                );
                            };

                            window.addEventListener(
                                "afterprint",
                                cleanup
                            );
                        }

                        window.print();
                    }
                );
            });
    }


    



    function initializeLucideIcons() {
        if (
            !window.lucide ||
            typeof window.lucide.createIcons !==
            "function"
        ) {
            return;
        }

        try {
            window.lucide.createIcons({
                attrs: {
                    "stroke-width": 1.8
                }
            });

            state.iconsInitialized = true;
        } catch (error) {
            console.warn(
                "SecureHabit could not initialize Lucide icons.",
                error
            );
        }
    }

    function refreshLucideIcons(root = document) {
        if (
            !window.lucide ||
            typeof window.lucide.createIcons !==
            "function"
        ) {
            return;
        }

        try {
            window.lucide.createIcons({
                root,
                attrs: {
                    "stroke-width": 1.8
                }
            });
        } catch (error) {
            console.warn(
                "SecureHabit could not refresh Lucide icons.",
                error
            );
        }
    }


    



    function initializeAOS() {
        if (state.aosInitialized) {
            return;
        }

        document.documentElement.classList.remove(
            "aos-enabled",
            "aos-disabled",
            "aos-ready"
        );

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            document.documentElement.classList.add(
                "aos-disabled"
            );
            return;
        }

        if (
            !window.AOS ||
            typeof window.AOS.init !== "function"
        ) {
            document.documentElement.classList.add(
                "aos-disabled"
            );
            return;
        }

        try {
            document.documentElement.classList.add(
                "aos-enabled"
            );

            window.AOS.init({
                once: true,
                mirror: false,
                offset: 70,
                duration: 700,
                delay: 0,
                easing: "ease-out-cubic",
                anchorPlacement: "top-bottom",
                disableMutationObserver: true,
                throttleDelay: 99,
                debounceDelay: 50
            });

            state.aosInitialized = true;

            document.documentElement.classList.add(
                "aos-ready"
            );

            bindAOSRefreshEvents();
        } catch (error) {
            document.documentElement.classList.remove(
                "aos-enabled",
                "aos-ready"
            );

            document.documentElement.classList.add(
                "aos-disabled"
            );

            console.warn(
                "SecureHabit could not initialize AOS.",
                error
            );
        }
    }

    function bindAOSRefreshEvents() {
        if (!state.aosLoadRefreshBound) {
            state.aosLoadRefreshBound = true;

            window.addEventListener(
                "load",
                function () {
                    refreshAOS();
                },
                {
                    once: true
                }
            );

            window.addEventListener(
                "pageshow",
                function (event) {
                    if (event.persisted) {
                        refreshAOS();
                    }
                }
            );
        }

        if (
            !state.aosFontsRefreshBound &&
            document.fonts &&
            typeof document.fonts.ready?.then === "function"
        ) {
            state.aosFontsRefreshBound = true;

            document.fonts.ready
                .then(function () {
                    refreshAOS();
                })
                .catch(function () {
                    refreshAOS();
                });
        }
    }

    function scheduleAOSRefresh(options = {}) {
        if (
            !state.aosInitialized ||
            !window.AOS
        ) {
            return;
        }

        state.aosRefreshHardPending =
            state.aosRefreshHardPending ||
            options.hard === true;

        if (state.aosRefreshFrame) {
            return;
        }

        state.aosRefreshFrame =
            requestFrame(() => {
                const hard =
                    state.aosRefreshHardPending;

                state.aosRefreshFrame = null;
                state.aosRefreshHardPending = false;

                if (
                    hard &&
                    typeof window.AOS.refreshHard ===
                    "function"
                ) {
                    window.AOS.refreshHard();
                    return;
                }

                if (
                    typeof window.AOS.refresh ===
                    "function"
                ) {
                    window.AOS.refresh();
                }
            });
    }

    function refreshAOS(options = {}) {
        scheduleAOSRefresh({
            hard: options.hard === true
        });
    }

    function destroyAOS() {
        if (state.aosRefreshFrame) {
            window.cancelAnimationFrame(
                state.aosRefreshFrame
            );

            state.aosRefreshFrame = null;
        }

        state.aosRefreshHardPending = false;
        state.aosInitialized = false;

        document.documentElement.classList.remove(
            "aos-enabled",
            "aos-ready"
        );

        document.documentElement.classList.add(
            "aos-disabled"
        );

        document
            .querySelectorAll("[data-aos]")
            .forEach((element) => {
                element.classList.remove(
                    "aos-init",
                    "aos-animate"
                );
            });
    }

    window.addEventListener(
        "pagehide",
        function () {
            if (
                state.aosRefreshFrame
            ) {
                window.cancelAnimationFrame(
                    state.aosRefreshFrame
                );

                state.aosRefreshFrame = null;
            }
        }
    );


    



    window.SecureHabit = Object.freeze({
        get config() {
            return state.config;
        },

        get currentPage() {
            return getCurrentPage();
        },

        escapeHTML,
        getConfigValue,
        applyConfigurationBindings,
        renderBreadcrumbs,
        initializeAccordions,
        initializeTabs,
        initializePrintActions,
        initializeExternalLinks,
        updateSourcePageFields,
        refreshIcons: refreshLucideIcons,
        initializeAOS,
        refreshAOS,
        scheduleAOSRefresh,
        destroyAOS,
        readCookiePreferences,
        saveCookiePreferences,
        createAbsoluteUrl,
        applyGlobalCompanyIdentity,
    });
})();
