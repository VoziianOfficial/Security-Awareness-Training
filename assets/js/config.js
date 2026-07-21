(function () {
    "use strict";

    const SITE_URL = "https://www.securehabit.example";
    const ASSET_ROOT = "assets";
    const IMAGE_ROOT = `${ASSET_ROOT}/images`;

    const COMPANY_IDENTITY = {
        brandName: "SecureHabit",

        wordmarkFirst: "Secure",
        wordmarkSecond: "Habit",

        legalName:
            "SecureHabit Learning Network LLC",

        companyId:
            "SHL-US-",

        email:
            "hello@securehabit.example",

        phoneDisplay: "",

        phoneRaw: "",

        address: {
            street:
                " Learning Loop, Suite ",

            city:
                "Austin",

            region:
                "TX",

            postalCode:
                "",

            country:
                "United States",

            countryCode:
                "US"
        }
    };


    const COMPANY_CITY_STATE_ZIP = [
        COMPANY_IDENTITY.address.city,

        [
            COMPANY_IDENTITY.address.region,
            COMPANY_IDENTITY.address.postalCode
        ]
            .filter(Boolean)
            .join(" ")
    ]
        .filter(Boolean)
        .join(", ");


    const COMPANY_FULL_ADDRESS = [
        COMPANY_IDENTITY.address.street,
        COMPANY_CITY_STATE_ZIP,
        COMPANY_IDENTITY.address.country
    ]
        .filter(Boolean)
        .join(", ");


    const COMPANY_EMAIL_HREF =
        COMPANY_IDENTITY.email
            ? `mailto:${COMPANY_IDENTITY.email}`
            : "";


    const COMPANY_PHONE_RAW =
        COMPANY_IDENTITY.phoneRaw ||
        COMPANY_IDENTITY.phoneDisplay.replace(
            /[^\d+]/g,
            ""
        );


    const COMPANY_PHONE_HREF =
        COMPANY_PHONE_RAW
            ? `tel:${COMPANY_PHONE_RAW}`
            : "";


    const COMPANY_MAP_HREF =
        COMPANY_FULL_ADDRESS
            ? `https://maps.google.com/?q=${encodeURIComponent(
                COMPANY_FULL_ADDRESS
            )}`
            : "";

    const pageUrl = (fileName = "") => {
        if (!fileName || fileName === "index.html") {
            return `${SITE_URL}/`;
        }

        return `${SITE_URL}/${fileName}`;
    };

    const topicPages = [
        {
            id: "phishing-awareness",
            slug: "phishing-awareness",
            page: "phishing-awareness.html",
            title: "Phishing Awareness",
            shortTitle: "Phishing",
            eyebrow: "Recognize suspicious messages",
            heroTitle: "Recognize suspicious messages before taking action.",
            description:
                "Learn how to review senders, links, attachments, urgency and credential requests before responding to an unexpected message.",
            icon: "mail-warning",
            image: `${IMAGE_ROOT}/topic-phishing-awareness.webp`,
            alt:
                "Employee carefully reviewing an unexpected workplace email on a laptop",
            accent:
                "linear-gradient(135deg, #16d7c4 0%, #318cf4 58%, #626cf6 100%)",
            relatedTopics: [
                "email-security",
                "social-engineering",
                "password-security"
            ]
        },
        {
            id: "password-security",
            slug: "password-security",
            page: "password-security.html",
            title: "Password Security",
            shortTitle: "Passwords",
            eyebrow: "Protect everyday accounts",
            heroTitle: "Turn stronger account habits into everyday practice.",
            description:
                "Explore practical guidance for unique passphrases, password managers, multi-factor authentication, recovery codes and approved account-recovery procedures.",
            icon: "key-round",
            image: `${IMAGE_ROOT}/topic-password-security.webp`,
            alt:
                "Employee using an approved account sign-in screen in a workplace setting",
            accent:
                "linear-gradient(135deg, #2af0df 0%, #318cf4 48%, #8757ef 100%)",
            relatedTopics: [
                "phishing-awareness",
                "email-security",
                "safe-remote-work"
            ]
        },
        {
            id: "email-security",
            slug: "email-security",
            page: "email-security.html",
            title: "Email Security",
            shortTitle: "Email",
            eyebrow: "Review more than the display name",
            heroTitle: "Read beyond the display name.",
            description:
                "Understand sender details, reply-to differences, link destinations, attachments, forwarding risks and unexpected account-change requests.",
            icon: "mail-check",
            image: `${IMAGE_ROOT}/topic-email-security.webp`,
            alt:
                "Office employee examining sender details in an email message",
            accent:
                "linear-gradient(135deg, #16d7c4 0%, #318cf4 45%, #ed149f 100%)",
            relatedTopics: [
                "phishing-awareness",
                "social-engineering",
                "data-protection-basics"
            ]
        },
        {
            id: "safe-remote-work",
            slug: "safe-remote-work",
            page: "safe-remote-work.html",
            title: "Safe Remote Work",
            shortTitle: "Remote Work",
            eyebrow: "Work carefully from any location",
            heroTitle: "Keep everyday work safer wherever it happens.",
            description:
                "Review practical habits for approved devices, screen locking, software updates, shared spaces, private conversations and company network policies.",
            icon: "laptop-minimal-check",
            image: `${IMAGE_ROOT}/topic-safe-remote-work.webp`,
            alt:
                "Remote employee working carefully from an organized home workspace",
            accent:
                "linear-gradient(135deg, #16d7c4 0%, #626cf6 56%, #8757ef 100%)",
            relatedTopics: [
                "password-security",
                "data-protection-basics",
                "email-security"
            ]
        },
        {
            id: "social-engineering",
            slug: "social-engineering",
            page: "social-engineering-awareness.html",
            title: "Social Engineering",
            shortTitle: "Social Engineering",
            eyebrow: "Verify unexpected requests",
            heroTitle: "Pause when pressure replaces verification.",
            description:
                "Recognize impersonation, authority pressure, unusual requests, emotional manipulation, pretexting and attempts to bypass normal verification.",
            icon: "user-round-search",
            image: `${IMAGE_ROOT}/topic-social-engineering.webp`,
            alt:
                "Employees discussing how to verify an unusual workplace request",
            accent:
                "linear-gradient(135deg, #318cf4 0%, #626cf6 45%, #ed149f 100%)",
            relatedTopics: [
                "phishing-awareness",
                "email-security",
                "data-protection-basics"
            ]
        },
        {
            id: "data-protection-basics",
            slug: "data-protection-basics",
            page: "data-protection-basics.html",
            title: "Data Protection Basics",
            shortTitle: "Data Protection",
            eyebrow: "Handle information with care",
            heroTitle: "Handle company information with purpose and care.",
            description:
                "Explore everyday decisions involving access, approved sharing, storage, retention, secure disposal and reporting concerns through company procedures.",
            icon: "file-lock-2",
            image: `${IMAGE_ROOT}/topic-data-protection-basics.webp`,
            alt:
                "Team member reviewing access and sharing settings for a company document",
            accent:
                "linear-gradient(135deg, #2af0df 0%, #318cf4 40%, #8757ef 75%, #ed149f 100%)",
            relatedTopics: [
                "email-security",
                "safe-remote-work",
                "social-engineering"
            ]
        }
    ];

    const legalLinks = [
        {
            label: "Privacy Policy",
            url: "privacy-policy.html"
        },
        {
            label: "Terms of Service",
            url: "terms-and-conditions.html"
        },
        {
            label: "Cookie Policy",
            url: "cookie-policy.html"
        }
    ];

    const primaryNavigation = [
        {
            id: "home",
            label: "Home",
            url: "index.html"
        },
        {
            id: "about",
            label: "About Us",
            url: "about.html"
        },
        {
            id: "training-topics",
            label: "Training Topics",
            url: "all-training-topics.html",
            children: topicPages.map((topic) => ({
                id: topic.id,
                label: topic.title,
                url: topic.page,
                description: topic.description,
                icon: topic.icon
            }))
        },
        {
            id: "training-resources",
            label: "Training Resources",
            url: "training-resources.html"
        },
        {
            id: "corporate-training",
            label: "Corporate Training",
            url: "corporate-training.html"
        },
        {
            id: "contact",
            label: "Contact",
            url: "contact.html"
        }
    ];

    const breadcrumbMap = {
        home: [
            {
                label: "Home",
                url: "index.html"
            }
        ],

        about: [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "About SecureHabit",
                url: "about.html"
            }
        ],

        "training-topics": [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "Training Topics",
                url: "all-training-topics.html"
            }
        ],

        "training-resources": [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "Training Resources",
                url: "training-resources.html"
            }
        ],

        "corporate-training": [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "Corporate Training",
                url: "corporate-training.html"
            }
        ],

        contact: [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "Contact",
                url: "contact.html"
            }
        ],

        "privacy-policy": [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "Privacy Policy",
                url: "privacy-policy.html"
            }
        ],

        "terms-of-service": [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "Terms of Service",
                url: "terms-and-conditions.html"
            }
        ],

        "cookie-policy": [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "Cookie Policy",
                url: "cookie-policy.html"
            }
        ]
    };

    topicPages.forEach((topic) => {
        breadcrumbMap[topic.id] = [
            {
                label: "Home",
                url: "index.html"
            },
            {
                label: "Training Topics",
                url: "all-training-topics.html"
            },
            {
                label: topic.title,
                url: topic.page
            }
        ];
    });

    const defaultSocialImage =
        `${SITE_URL}/${IMAGE_ROOT}/securehabit-social-preview.webp`;

    const seoPages = {
        home: {
            title: "SecureHabit | Practical Security Awareness for Everyday Teams",
            description:
                "Explore practical workplace guidance for phishing, passwords, email, remote work, social engineering and responsible data handling.",
            canonical: pageUrl("index.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        about: {
            title: "About SecureHabit | Practical Workplace Security Awareness",
            description:
                "Learn how SecureHabit makes security awareness clearer, more practical and easier to connect with normal workplace decisions.",
            canonical: pageUrl("about.html"),
            ogImage: defaultSocialImage,
            schemaType: "AboutPage"
        },

        "training-topics": {
            title: "Security Awareness Training Topics | SecureHabit",
            description:
                "Explore practical awareness topics covering phishing, passwords, email security, remote work, social engineering and data protection basics.",
            canonical: pageUrl("all-training-topics.html"),
            ogImage: defaultSocialImage,
            schemaType: "CollectionPage"
        },

        "training-resources": {
            title: "Practical Security Awareness Resources | SecureHabit",
            description:
                "Browse original security-awareness checklists, short lessons, fictional scenarios, printable reminders and practical workplace learning resources.",
            canonical: pageUrl("training-resources.html"),
            ogImage: defaultSocialImage,
            schemaType: "CollectionPage"
        },

        "corporate-training": {
            title: "Corporate Security Awareness Training Options | SecureHabit",
            description:
                "Explore possible security-awareness formats for onboarding, team workshops, refresher learning, scenarios and internal resource packages.",
            canonical: pageUrl("corporate-training.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        contact: {
            title: "Contact SecureHabit | Training and Collaboration Inquiries",
            description:
                "Contact SecureHabit about corporate training options, learning resources, advertising, collaboration or a tailored business partnership.",
            canonical: pageUrl("contact.html"),
            ogImage: defaultSocialImage,
            schemaType: "ContactPage"
        },

        "phishing-awareness": {
            title: "Phishing Awareness Training and Practical Guidance | SecureHabit",
            description:
                "Learn how to recognize suspicious senders, urgency, mismatched links, unexpected attachments and requests for account credentials.",
            canonical: pageUrl("phishing-awareness.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        "password-security": {
            title: "Password Security Awareness and Safer Account Habits | SecureHabit",
            description:
                "Explore practical guidance for unique passphrases, password managers, multi-factor authentication and approved account-recovery procedures.",
            canonical: pageUrl("password-security.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        "email-security": {
            title: "Email Security Awareness for Everyday Work | SecureHabit",
            description:
                "Learn how to review sender addresses, reply-to details, links, attachments, forwarding decisions and unexpected account-change requests.",
            canonical: pageUrl("email-security.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        "safe-remote-work": {
            title: "Safe Remote Work Security Awareness | SecureHabit",
            description:
                "Review practical habits for approved devices, screen locking, shared spaces, software updates and responsible remote document handling.",
            canonical: pageUrl("safe-remote-work.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        "social-engineering": {
            title: "Social Engineering Awareness and Verification Habits | SecureHabit",
            description:
                "Recognize impersonation, authority pressure, emotional manipulation, unusual requests and attempts to bypass normal workplace verification.",
            canonical: pageUrl("social-engineering-awareness.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        "data-protection-basics": {
            title: "Data Protection Basics for Everyday Teams | SecureHabit",
            description:
                "Explore practical decisions involving access, approved sharing, storage, retention, secure disposal and organizational reporting procedures.",
            canonical: pageUrl("data-protection-basics.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        "privacy-policy": {
            title: "Privacy Policy | SecureHabit",
            description:
                "Read how SecureHabit handles contact-form information, email correspondence, necessary browser storage and relevant technical information.",
            canonical: pageUrl("privacy-policy.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        "terms-of-service": {
            title: "Terms of Service | SecureHabit",
            description:
                "Review the draft terms governing use of SecureHabit educational information, resources, inquiries, external links and website content.",
            canonical: pageUrl("terms-and-conditions.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        },

        "cookie-policy": {
            title: "Cookie Policy | SecureHabit",
            description:
                "Learn about the necessary local storage and optional preference controls used by the SecureHabit website.",
            canonical: pageUrl("cookie-policy.html"),
            ogImage: defaultSocialImage,
            schemaType: "WebPage"
        }
    };

    window.SECUREHABIT_CONFIG = {
        meta: {
            configVersion: "1.0.0",
            projectName: COMPANY_IDENTITY.brandName,
            environment: "development",
            containsPlaceholderData: true,
            language: "en",
            locale: "en-US",
            siteUrl: SITE_URL,
            defaultPage: "home"
        },
        identityAliases: {
            brandName: [
                "SecureHabit"
            ],

            legalName: [
                "SecureHabit Learning Network LLC"
            ],

            companyId: [
                "SHL-US-24018"
            ],

            email: [
                "hello@securehabit.example"
            ],

           
            phoneDisplay: [],

           
            phoneRaw: [],

            addressStreet: [
                "1200 Learning Loop, Suite 240"
            ],

            addressCityStateZip: [
                "Austin, TX 78701"
            ],

            addressCountry: [
                "United States"
            ],

            addressFull: [
                "1200 Learning Loop, Suite 240, Austin, TX 78701, United States"
            ]
        },

        brand: {
            name: COMPANY_IDENTITY.brandName,

            wordmarkParts: {
                first:
                    COMPANY_IDENTITY.wordmarkFirst,

                second:
                    COMPANY_IDENTITY.wordmarkSecond
            },

            tagline:
                "Practical awareness. Safer everyday decisions.",

            supportingLine:
                "Security awareness built into everyday work.",

            description:
                "An independent educational and inquiry platform helping organizations explore practical security-awareness topics, resources and possible training formats.",

            logos: {
                default:
                    `${IMAGE_ROOT}/logo-securehabit.svg`,

                light:
                    `${IMAGE_ROOT}/logo-securehabit-light.svg`,

                monochrome:
                    `${IMAGE_ROOT}/logo-securehabit-monochrome.svg`,

                mark:
                    `${IMAGE_ROOT}/securehabit-mark.svg`,

                favicon:
                    `${IMAGE_ROOT}/favicon.svg`
            }
        },

        company: {
            legalName:
                COMPANY_IDENTITY.legalName,

            companyId:
                COMPANY_IDENTITY.companyId,

            address: {
                street:
                    COMPANY_IDENTITY.address.street,

                city:
                    COMPANY_IDENTITY.address.city,

                region:
                    COMPANY_IDENTITY.address.region,

                postalCode:
                    COMPANY_IDENTITY.address.postalCode,

                country:
                    COMPANY_IDENTITY.address.country,

                countryCode:
                    COMPANY_IDENTITY.address.countryCode,

                cityStateZip:
                    COMPANY_CITY_STATE_ZIP,

                displayLines: [
                    COMPANY_IDENTITY.address.street,
                    COMPANY_CITY_STATE_ZIP,
                    COMPANY_IDENTITY.address.country
                ].filter(Boolean),

                full:
                    COMPANY_FULL_ADDRESS
            },

            serviceArea:
                "Online and selected business markets",

            mapHref:
                COMPANY_MAP_HREF
        },

        contact: {
            emailDisplay:
                COMPANY_IDENTITY.email,

            emailHref:
                COMPANY_EMAIL_HREF,

            phoneDisplay:
                COMPANY_IDENTITY.phoneDisplay,

            phoneRaw:
                COMPANY_PHONE_RAW,

            phoneHref:
                COMPANY_PHONE_HREF,

            contactPage:
                "contact.html",

            formAnchor:
                "contact.html#contact-form",

            corporateTrainingFormAnchor:
                "contact.html?inquiry=corporate-training#contact-form"
        },

        platform: {
            type: "Independent educational and inquiry platform",

            positioning:
                "SecureHabit publishes practical security-awareness information, helps organizations explore possible learning formats and allows visitors to submit training and collaboration inquiries.",

            limitations: [
                "SecureHabit is not an emergency incident-response service.",
                "SecureHabit does not provide legal or regulatory advice.",
                "SecureHabit does not provide compliance certification.",
                "Training availability may depend on scope, location, audience and independent-provider availability.",
                "No training program can guarantee that every security incident will be prevented."
            ]
        },

        navigation: {
            primary: primaryNavigation,

            topicMenuLabel: "Explore all training topics",

            topicMenuUrl: "all-training-topics.html",

            mobileMenu: {
                openLabel: "Open navigation menu",
                closeLabel: "Close navigation menu",
                topicAccordionLabel: "Show training topics"
            }
        },

        header: {
            announcement: "",
            cta: {
                label: "Request Training Options",
                url: "contact.html#contact-form",
                icon: "arrow-up-right"
            }
        },

        topics: topicPages,

        resourceCategories: [
            {
                value: "all",
                label: "All"
            },
            {
                value: "phishing",
                label: "Phishing"
            },
            {
                value: "passwords",
                label: "Passwords"
            },
            {
                value: "email",
                label: "Email"
            },
            {
                value: "remote-work",
                label: "Remote Work"
            },
            {
                value: "social-engineering",
                label: "Social Engineering"
            },
            {
                value: "data-protection",
                label: "Data Protection"
            },
            {
                value: "onboarding",
                label: "Onboarding"
            },
            {
                value: "checklists",
                label: "Checklists"
            }
        ],

        repeatedCtas: {
            exploreTrainingTopics: {
                label: "Explore Training Topics",
                url: "all-training-topics.html"
            },

            requestTrainingOptions: {
                label: "Request Training Options",
                url: "contact.html#contact-form"
            },

            learnAboutSecureHabit: {
                label: "Learn About SecureHabit",
                url: "about.html"
            },

            browseResources: {
                label: "Browse Resources",
                url: "training-resources.html"
            },

            printChecklist: {
                label: "Print a Checklist",
                action: "print"
            },

            discussThisFormat: {
                label: "Discuss This Format",
                url: "contact.html?inquiry=corporate-training#contact-form"
            },

            discussTrainingOptions: {
                label: "Discuss Training Options",
                url: "contact.html?inquiry=corporate-training#contact-form"
            },

            requestTrainingInformation: {
                label: "Request Training Information",
                url: "contact.html#contact-form"
            },

            startCorporateInquiry: {
                label: "Start a Corporate Training Inquiry",
                url: "contact.html?inquiry=corporate-training#contact-form"
            },

            advertiseCollaborate: {
                label: "Advertise & Collaborate",
                url: "contact.html#advertise-collaborate"
            }
        },

        footer: {
            description:
                "Practical security-awareness information, training-format guidance and inquiry support for everyday workplace teams.",

            columns: [
                {
                    id: "explore",
                    title: "Explore",
                    links: [
                        {
                            label: "Home",
                            url: "index.html"
                        },
                        {
                            label: "About SecureHabit",
                            url: "about.html"
                        },
                        {
                            label: "All Training Topics",
                            url: "all-training-topics.html"
                        },
                        {
                            label: "Training Resources",
                            url: "training-resources.html"
                        },
                        {
                            label: "Corporate Training",
                            url: "corporate-training.html"
                        }
                    ]
                },

                {
                    id: "topics",
                    title: "Training Topics",
                    links: topicPages.map((topic) => ({
                        label: topic.title,
                        url: topic.page
                    }))
                },

                {
                    id: "information",
                    title: "Information",
                    links: [
                        {
                            label: "Contact",
                            url: "contact.html"
                        },
                        {
                            label: "Advertise & Collaborate",
                            url: "contact.html#advertise-collaborate"
                        },
                        ...legalLinks
                    ]
                }
            ],

            socialLinks: [],

            legalLinks,

            copyrightText:
                "© {year} SecureHabit Learning Network LLC. All rights reserved.",

            disclaimerShort:
                "SecureHabit is an independent educational and inquiry platform. Training options may involve independent specialists, and no training program can guarantee that every security incident will be prevented.",

            decorationLabel: "Connected learning. Safer everyday decisions."
        },

        disclaimer: {
            short:
                "SecureHabit is an independent educational and inquiry platform. Training options may involve independent specialists, and no training program can guarantee that every security incident will be prevented.",

            long:
                "SecureHabit is an independent educational and inquiry platform. We provide general security-awareness information and help organizations explore training options and, where available, connect with independent training professionals. SecureHabit does not provide legal, regulatory, compliance, incident-response, or emergency cybersecurity advice. Training availability, scope, pricing, and delivery terms may vary by provider and organizational requirements. No training program can guarantee that every security incident will be prevented."
        },

        advertiseCollaborate: {
            title: "Advertise & Collaborate",

            text:
                "We are always open to new opportunities, high-impact collaborations, and tailored business partnerships. Whether you want to advertise your brand to our audience, launch a joint project, or book our professional services, we are ready to bring your ideas to life. Every business is unique, and we don't believe in one-size-fits-all solutions. Please reach out to us using the contact form below, tell us a bit about your goals, and our team will get back to you with an exclusive, custom-tailored proposal designed strictly for your budget and objectives. Let’s build something great together."
        },

        contactForm: {
            id: "contact-form",
            action: "contact.php",
            method: "POST",
            submitLabel: "Send Inquiry",
            submittingLabel: "Sending Inquiry…",

            fields: {
                fullName: {
                    name: "fullName",
                    label: "Full name",
                    autocomplete: "name",
                    required: true,
                    maxLength: 120
                },

                email: {
                    name: "email",
                    label: "Work email",
                    autocomplete: "email",
                    required: true,
                    maxLength: 190
                },

                organization: {
                    name: "organization",
                    label: "Organization",
                    autocomplete: "organization",
                    required: true,
                    maxLength: 160
                },

                inquiryType: {
                    name: "inquiryType",
                    label: "Inquiry type",
                    required: true
                },

                trainingTopic: {
                    name: "trainingTopic",
                    label: "Training topic",
                    required: true
                },

                teamSize: {
                    name: "teamSize",
                    label: "Approximate team size",
                    optionalLabel: "Optional",
                    required: false
                },

                message: {
                    name: "message",
                    label: "Tell us about your goals",
                    required: true,
                    maxLength: 5000
                },

                privacyConsent: {
                    name: "privacyConsent",
                    label:
                        "I have read the Privacy Policy and agree that SecureHabit may use the submitted information to review and respond to this inquiry.",
                    required: true
                },

                sourcePage: {
                    name: "sourcePage",
                    defaultValue: ""
                },

                honeypot: {
                    name: "company",
                    label: "Leave this field empty",
                    autocomplete: "off"
                },

                formStartedAt: {
                    name: "formStartedAt"
                }
            },

            inquiryTypes: [
                {
                    value: "",
                    label: "Select an inquiry type"
                },
                {
                    value: "general-information",
                    label: "General Information"
                },
                {
                    value: "corporate-training",
                    label: "Corporate Training"
                },
                {
                    value: "training-resources",
                    label: "Training Resources"
                },
                {
                    value: "advertise-collaborate",
                    label: "Advertise & Collaborate"
                },
                {
                    value: "tailored-partnership",
                    label: "Tailored Partnership"
                },
                {
                    value: "other",
                    label: "Other"
                }
            ],

            trainingTopics: [
                {
                    value: "",
                    label: "Select a training topic"
                },
                {
                    value: "not-sure",
                    label: "Not sure yet"
                },
                ...topicPages.map((topic) => ({
                    value: topic.slug,
                    label: topic.title
                }))
            ],

            teamSizes: [
                {
                    value: "",
                    label: "Not specified"
                },
                {
                    value: "1-10",
                    label: "– people"
                },
                {
                    value: "11-25",
                    label: "– people"
                },
                {
                    value: "26-50",
                    label: "– people"
                },
                {
                    value: "51-100",
                    label: "– people"
                },
                {
                    value: "101-250",
                    label: "– people"
                },
                {
                    value: "251-plus",
                    label: "More than  people"
                },
                {
                    value: "not-sure",
                    label: "Not sure yet"
                }
            ],

            queryPrefill: {
                "corporate-training": {
                    inquiryType: "corporate-training"
                },

                "training-resources": {
                    inquiryType: "training-resources"
                },

                collaboration: {
                    inquiryType: "advertise-collaborate"
                },

                partnership: {
                    inquiryType: "tailored-partnership"
                }
            },

            messages: {
                success:
                    "Thank you. Your SecureHabit inquiry has been received.",

                error:
                    "We could not send your message at this time. Please review the form or contact us by email.",

                validation:
                    "Please review the highlighted fields and complete the required information.",

                privacyRequired:
                    "Please confirm that you have read the Privacy Policy before sending the inquiry.",

                connectionError:
                    "The form could not connect to the server. Your message has not been sent.",

                duplicateSubmission:
                    "Your inquiry is already being submitted. Please wait.",

                emailFallbackPrefix:
                    "You can also contact SecureHabit at"
            }
        },

        contactPage: {
            intro:
                "Use this page for general information, corporate training, training resources, advertising, collaboration or tailored partnership inquiries.",

            inquiryTypes: [
                "General information",
                "Corporate training",
                "Training resources",
                "Advertising",
                "Collaboration",
                "Tailored partnership"
            ],

            nextSteps: [
                {
                    number: "",
                    title: "The inquiry is reviewed.",
                    description:
                        "The submitted information is checked to understand the request and confirm that enough context has been provided."
                },
                {
                    number: "",
                    title: "Additional details may be requested by email.",
                    description:
                        "SecureHabit may ask for clarification about the audience, preferred format, priority topics or internal context."
                },
                {
                    number: "",
                    title: "Relevant information may be shared.",
                    description:
                        "Suitable resources or available training options are shared where appropriate and subject to availability."
                }
            ]
        },

        cookieConsent: {
            enabled: true,
            version: "1.0",
            storageKey: "securehabit_cookie_preferences",
            dialogId: "securehabit-cookie-dialog",

            title: "Your privacy choices",

            description:
                "SecureHabit uses necessary browser storage to remember privacy choices and support essential website behavior. Optional storage may remember non-essential interface preferences. No analytics or advertising cookies are currently installed.",

            policyLabel: "Read the Cookie Policy",
            policyUrl: "cookie-policy.html",

            categories: {
                necessary: {
                    id: "necessary",
                    label: "Necessary storage",
                    description:
                        "Required to remember your privacy choice and support essential website behavior.",
                    required: true,
                    defaultValue: true
                },

                preferences: {
                    id: "preferences",
                    label: "Experience preferences",
                    description:
                        "Allows the website to remember optional interface preferences. This category does not enable analytics or advertising.",
                    required: false,
                    defaultValue: false
                }
            },

            buttons: {
                acceptOptional: "Accept Optional",
                rejectOptional: "Reject Optional",
                managePreferences: "Manage Preferences",
                savePreferences: "Save Preferences",
                closePreferences: "Close Preferences"
            },

            statusMessages: {
                accepted:
                    "Optional experience preferences have been accepted.",
                rejected:
                    "Optional experience preferences have been rejected.",
                saved:
                    "Your privacy preferences have been saved."
            }
        },

        accessibility: {
            skipLinkLabel: "Skip to main content",
            externalLinkLabel: "Opens in a new tab",
            menuOpenedMessage: "Navigation menu opened.",
            menuClosedMessage: "Navigation menu closed.",
            accordionExpandedMessage: "Section expanded.",
            accordionCollapsedMessage: "Section collapsed.",
            sliderPreviousLabel: "Show previous item",
            sliderNextLabel: "Show next item",
            closeDialogLabel: "Close dialog"
        },

        interfaceText: {
            readMore: "Read More",
            learnMore: "Learn More",
            viewTopic: "Explore This Topic",
            viewDetails: "View Details",
            reset: "Reset",
            restart: "Restart",
            next: "Next",
            previous: "Previous",
            close: "Close",
            print: "Print",
            active: "Active",
            selected: "Selected",
            optional: "Optional",
            required: "Required"
        },

        legal: {
            lastUpdatedDisplay: "July , ",
            lastUpdatedISO: "2026-07-21",

            draftNotice:
                "These legal pages are draft templates and must be reviewed by a qualified legal professional before the website is launched.",

            contactLabel: "Legal and privacy contact",

            reviewRequired: true
        },

        seo: {
            default: {
                title: "SecureHabit",
                description:
                    "Practical security-awareness information and training inquiry support for everyday workplace teams.",
                canonical: pageUrl("index.html"),
                ogImage: defaultSocialImage,
                twitterCard: "summary_large_image",
                robots: "index, follow"
            },

            pages: seoPages
        },

        breadcrumbs: breadcrumbMap,

        schema: {
            organization: {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "SecureHabit",
                legalName: "SecureHabit Learning Network LLC",
                url: SITE_URL,
                logo: `${SITE_URL}/${IMAGE_ROOT}/logo-securehabit.svg`,
                email: "hello@securehabit.example",
                description:
                    "An independent educational and inquiry platform focused on practical workplace security awareness.",
                address: {
                    "@type": "PostalAddress",
                    streetAddress: " Learning Loop, Suite ",
                    addressLocality: "Austin",
                    addressRegion: "TX",
                    postalCode: "",
                    addressCountry: "US"
                },
                areaServed:
                    "Online and selected business markets",
                sameAs: []
            },

            website: {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "SecureHabit",
                url: SITE_URL,
                inLanguage: "en-US",
                description:
                    "Practical security-awareness information, resources and training inquiry support for everyday teams.",
                publisher: {
                    "@type": "Organization",
                    name: "SecureHabit"
                }
            }
        }
    };
})();
