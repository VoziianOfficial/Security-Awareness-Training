import fs from "node:fs";

const endpoint = "http://127.0.0.1:9340";
const baseUrl = "http://127.0.0.1:8008";
const pages = fs
    .readdirSync(".")
    .filter((file) => file.endsWith(".html"))
    .sort();

const viewports = [
    {
        name: "desktop",
        width: 1440,
        height: 1000,
        mobile: false
    },
    {
        name: "mobile",
        width: 390,
        height: 844,
        mobile: true
    }
];

const tab = await fetch(`${endpoint}/json/new?about:blank`, {
    method: "PUT"
}).then((response) => response.json());

const socket = new WebSocket(tab.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
const runtimeErrors = [];
const failedRequests = [];

function send(method, params = {}) {
    const id = nextId++;
    socket.send(
        JSON.stringify({
            id,
            method,
            params
        })
    );

    return new Promise((resolve, reject) => {
        pending.set(id, {
            resolve,
            reject
        });
    });
}

socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.method === "Runtime.exceptionThrown") {
        runtimeErrors.push(
            message.params?.exceptionDetails?.exception?.description ||
                message.params?.exceptionDetails?.text ||
                "unknown"
        );
    }

    if (message.method === "Network.responseReceived") {
        const response = message.params?.response;

        if (response?.status >= 400) {
            failedRequests.push({
                status: response.status,
                url: response.url
            });
        }
    }

    if (!message.id || !pending.has(message.id)) {
        return;
    }

    const callbacks = pending.get(message.id);
    pending.delete(message.id);

    if (message.error) {
        callbacks.reject(
            new Error(message.error.message)
        );
        return;
    }

    callbacks.resolve(message.result);
});

await new Promise((resolve) =>
    socket.addEventListener("open", resolve, {
        once: true
    })
);

await send("Runtime.enable");
await send("Page.enable");
await send("Network.enable");

async function auditPage(page, viewport) {
    const url = `${baseUrl}/${page}`;
    runtimeErrors.length = 0;
    failedRequests.length = 0;

    await send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.mobile
    });

    await send("Page.navigate", {
        url
    });

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const result = await send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(() => new Promise((resolve) => {
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = window.innerHeight;
            const html = document.documentElement;
            const body = document.body;

            function selectorFor(element) {
                if (!element || element.nodeType !== 1) {
                    return "";
                }

                if (element.id) {
                    return element.tagName.toLowerCase() + "#" + element.id;
                }

                const classes = String(element.className || "")
                    .split(/\\s+/)
                    .filter(Boolean)
                    .slice(0, 4)
                    .join(".");

                return element.tagName.toLowerCase() + (classes ? "." + classes : "");
            }

            function overflowElements() {
                return Array.from(document.querySelectorAll("body *"))
                    .map((element) => {
                        const rect = element.getBoundingClientRect();
                        const style = getComputedStyle(element);
                        const leftOverflow = rect.left < -1;
                        const rightOverflow = rect.right > viewportWidth + 1;

                        return {
                            selector: selectorFor(element),
                            left: Math.round(rect.left),
                            right: Math.round(rect.right),
                            width: Math.round(rect.width),
                            position: style.position,
                            overflowX: style.overflowX,
                            transform: style.transform !== "none",
                            hidden: rect.width === 0 || rect.height === 0 || style.display === "none" || style.visibility === "hidden",
                            leftOverflow,
                            rightOverflow
                        };
                    })
                    .filter((item) => !item.hidden && (item.leftOverflow || item.rightOverflow))
                    .sort((a, b) => Math.max(Math.abs(a.left), Math.abs(a.right - viewportWidth)) - Math.max(Math.abs(b.left), Math.abs(b.right - viewportWidth)))
                    .slice(-12);
            }

            function headerSnapshot(label) {
                const mount = document.querySelector("[data-site-header]");
                const header = document.querySelector("[data-site-header-element]");
                const mountRect = mount?.getBoundingClientRect();
                const headerRect = header?.getBoundingClientRect();
                const mountStyle = mount ? getComputedStyle(mount) : null;
                const headerStyle = header ? getComputedStyle(header) : null;
                const topElement = document.elementFromPoint(
                    Math.min(40, viewportWidth - 10),
                    Math.min(40, viewportHeight - 10)
                );

                return {
                    label,
                    scrollY: Math.round(window.scrollY),
                    mountTop: mountRect ? Math.round(mountRect.top) : null,
                    headerTop: headerRect ? Math.round(headerRect.top) : null,
                    mountWidth: mountRect ? Math.round(mountRect.width) : null,
                    headerWidth: headerRect ? Math.round(headerRect.width) : null,
                    headerHeight: headerRect ? Math.round(headerRect.height) : null,
                    mountPosition: mountStyle?.position || null,
                    headerPosition: headerStyle?.position || null,
                    mountZ: mountStyle?.zIndex || null,
                    headerVisibility: headerStyle?.visibility || null,
                    headerOpacity: headerStyle?.opacity || null,
                    topElement: selectorFor(topElement),
                    topInsideHeader: Boolean(topElement?.closest?.("[data-site-header]"))
                };
            }

            const samples = [];
            const maxScroll = Math.max(0, html.scrollHeight - viewportHeight);
            const points = [
                0,
                Math.min(180, maxScroll),
                Math.min(Math.round(maxScroll * 0.45), maxScroll),
                Math.min(Math.round(maxScroll * 0.9), maxScroll)
            ].filter((value, index, list) => list.indexOf(value) === index);

            (async () => {
                window.scrollTo(9999, 0);

                const horizontalScrollX = await new Promise((done) => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            const value = Math.round(window.scrollX || html.scrollLeft || body?.scrollLeft || 0);
                            window.scrollTo(0, 0);
                            done(value);
                        }, 80);
                    });
                });

                for (const point of points) {
                    window.scrollTo(0, point);
                    await new Promise((done) => requestAnimationFrame(() => setTimeout(done, 160)));
                    samples.push(headerSnapshot(String(point)));
                }

                window.scrollTo(0, 0);
                await new Promise((done) => requestAnimationFrame(() => setTimeout(done, 120)));

                const docOverflow = Math.max(html.scrollWidth, body?.scrollWidth || 0) - viewportWidth;
                const badHeaderSamples = samples.filter((sample) => {
                    if (!sample.mountTop && sample.mountTop !== 0) {
                        return true;
                    }

                    if (sample.scrollY > 50 && Math.abs(sample.mountTop) > 1) {
                        return true;
                    }

                    if (sample.mountWidth && sample.mountWidth > viewportWidth + 1) {
                        return true;
                    }

                    if (sample.headerWidth && sample.headerWidth > viewportWidth + 1) {
                        return true;
                    }

                    if (sample.scrollY > 50 && !sample.topInsideHeader) {
                        return true;
                    }

                    return false;
                });

                resolve({
                    page: ${JSON.stringify(page)},
                    viewport: ${JSON.stringify(viewport.name)},
                    width: viewportWidth,
                    scrollWidth: Math.max(html.scrollWidth, body?.scrollWidth || 0),
                    horizontalScrollX,
                    canScrollX: horizontalScrollX > 0,
                    overflowAmount: Math.round(docOverflow),
                    pageOverflowX: docOverflow > 1,
                    headerIssue: badHeaderSamples.length > 0,
                    headerSamples: samples,
                    overflowElements: overflowElements()
                });
            })();
        }))()`
    });

    return {
        ...result.result.value,
        failedRequests: [...failedRequests],
        runtimeErrors: [...runtimeErrors]
    };
}

const results = [];

for (const viewport of viewports) {
    for (const page of pages) {
        results.push(await auditPage(page, viewport));
    }
}

const summary = results.filter(
    (result) =>
        result.canScrollX ||
        result.headerIssue ||
        result.failedRequests.length ||
        result.runtimeErrors.length
);

console.log(
    JSON.stringify(
        {
            checked: results.length,
            pages,
            summary: summary.map((result) => ({
                page: result.page,
                viewport: result.viewport,
                width: result.width,
                scrollWidth: result.scrollWidth,
                horizontalScrollX: result.horizontalScrollX,
                canScrollX: result.canScrollX,
                overflowAmount: result.overflowAmount,
                pageOverflowX: result.pageOverflowX,
                headerIssue: result.headerIssue,
                headerWidths: result.headerSamples.map((sample) => ({
                    scrollY: sample.scrollY,
                    mountTop: sample.mountTop,
                    mountWidth: sample.mountWidth,
                    headerWidth: sample.headerWidth,
                    topInsideHeader: sample.topInsideHeader
                })),
                overflowElements: result.overflowElements.slice(0, 5),
                failedRequests: result.failedRequests,
                runtimeErrors: result.runtimeErrors
            }))
        },
        null,
        2
    )
);

socket.close();
