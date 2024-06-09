//@ts-check

(() => {
    // const SERVER_URL = "http://127.0.0.1:10002";
    // const SERVER_URL = "/apps/sir";
    const SERVER_URL = "https://bethanyconfessore.com/apps/sir";

    /** @type {null | HTMLElement} */
    let rootElement = null;

    /**
     * @param {string} token 
     * @param {{
     *   title?: string;
     *   description?: string;
     *   row1?: string;
     *   row2?: string;
     * }?} options
     */
    function createMain(token, options) {
        const main = document.createElement("main");
        main.classList.add("container", token);

        if (options) {
            if (options.title) {
                const h1 = document.createElement("h1");
                h1.innerText = options.title;
                main.appendChild(h1);
            }

            if (options.row1) {
                const p = document.createElement("p");
                p.innerText = options.row1;
                main.appendChild(p);
            }

            if (options.row2) {
                const p = document.createElement("p");
                p.innerText = options.row2;
                main.appendChild(p);
            }

            if (options.description) {
                const p = document.createElement("p");
                p.innerText = options.description;
                main.appendChild(p);
            }
        }

        return main;
    }

    /**
     * @param {string} value
     */
    function createButton(value) {
        const button = document.createElement("input");
        button.type = "button";
        button.value = value;
        return button;
    }

    /**
     * @param {HTMLElement} main 
     */
    function showMain(main) {
        if (rootElement !== null) {
            rootElement.remove();
        }

        rootElement = main;
        rootElement.animate([{ opacity: "0" }, { opacity: "1" }], { duration: 250, iterations: 1 });
        document.body.appendChild(main)
    }

    /**
     * @param {SubmissionContext} context
     */
    function showSubmitScreen(context) {
        let n = context.rows.length;

        const main = createMain("submit", {
            title: context.configuration.show,
            row1: `${context.date} » ${context.time}`,
            row2: `${n} ${n === 1 ? "record" : "records"} ready to upload.`,
            description: "Would you like to add another record to the report?",
        });

        const moreButton = createButton("Add Record");
        main.appendChild(moreButton);

        const p1 = document.createElement("p");
        p1.innerText = "Or would you like to upload this report?";
        main.appendChild(p1);

        const submitButton = createButton("Upload Report");
        main.appendChild(submitButton);

        const p2 = document.createElement("p");
        p2.innerText = "Or would you can discard this data and start again?";
        main.appendChild(p2);

        const resetButton = document.createElement("input");
        resetButton.type = "reset";
        resetButton.value = "Cancel and Reset";
        main.appendChild(resetButton);

        moreButton.onclick = () => {
            showTierScreen(context);
        };

        resetButton.onclick = async () => {
            showDateScreen({
                username: context.username,
                password: context.password,
                configuration: context.configuration,
            });
        };

        submitButton.onclick = async () => {
            moreButton.disabled = true;
            submitButton.disabled = true;
            resetButton.disabled = true;
            try {
                await submit(context.username, context.password, {
                    date: context.date,
                    time: context.time,
                    show: context.configuration.show,
                    rows: context.rows,
                });

                showDateScreen({
                    username: context.username,
                    password: context.password,
                    configuration: context.configuration,
                });
            } catch (e) {
                alert(e);
            } finally {
                moreButton.disabled = false;
                submitButton.disabled = false;
                resetButton.disabled = false;
            }
        };

        showMain(main);
    }

    /**
     * @param {SubmissionContext} context
     * @param {string} tier
     * @param {string} category
     */
    function showDescriptionScreen(context, tier, category) {
        const main = createMain("description", {
            title: context.configuration.show,
            row1: `${context.date} » ${context.time}`,
            row2: `Tier ${tier} » ${category}`,
            description: "How would you describe the impact?",
        });

        for (const description of context.configuration.tiers[tier][category]) {
            const button = createButton(description);

            button.onclick = () => {
                context.rows.push({ tier, category, description });
                showSubmitScreen(context);
            };

            main.appendChild(button);
        }

        showMain(main);
    }

    /**
     * @param {SubmissionContext} context
     * @param {string} tier
     */
    function showCategoryScreen(context, tier) {
        const main = createMain("category", {
            title: context.configuration.show,
            row1: `${context.date} » ${context.time}`,
            row2: `Tier ${tier}`,
            description: "What is the category for this report?",
        });

        for (const category of Object.keys(context.configuration.tiers[tier])) {
            const button = createButton(category);

            button.onclick = () => {
                showDescriptionScreen(context, tier, category);
            };

            main.appendChild(button);
        }

        showMain(main);
    }

    /**
     * @param {SubmissionContext} context
     */
    function showTierScreen(context) {
        const main = createMain("tier", {
            title: context.configuration.show,
            row1: `${context.date} » ${context.time}`,
            description: "What tier of impact do you want to report?",
        });

        for (const tier of Object.keys(context.configuration.tiers)) {

            const button = createButton(tier);

            button.onclick = () => {
                showCategoryScreen(context, tier);
            };

            main.appendChild(button);
        }

        showMain(main);
    }

    /**
     * @param {BasicContext} context
     * @param {string} date
     */
    function showTimeScreen(context, date) {
        const main = createMain("time", {
            title: context.configuration.show,
            row1: `${date}`,
            description: "What time was the show?",
        });

        for (const time of context.configuration.times) {
            const button = createButton(time);

            button.onclick = () => {
                showTierScreen({
                    username: context.username,
                    password: context.password,
                    configuration: context.configuration,
                    date: date,
                    time: time,
                    rows: [],
                });
            };

            main.appendChild(button);
        }

        showMain(main);
    }

    /** @param {BasicContext} context */
    function showDateScreen(context) {
        const main = createMain("date", {
            title: context.configuration.show,
            description: "What is the date of the show?",
        });

        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.valueAsDate = new Date();
        main.appendChild(dateInput);

        const button = createButton("Next");
        main.appendChild(button);

        button.onclick = () => {
            showTimeScreen(context, dateInput.value);
        };

        showMain(main);

        dateInput.focus();
    }

    function showLoginScreen() {
        const main = createMain("login", {
            title: "Login",
            description: "What is your username and password?",
        });

        const usernameInput = document.createElement("input");
        usernameInput.placeholder = "Username";
        usernameInput.type = "text";
        main.appendChild(usernameInput);

        usernameInput.value = localStorage["username"] || "";

        const passwordInput = document.createElement("input");
        passwordInput.placeholder = "Password";
        passwordInput.type = "password";
        main.appendChild(passwordInput);

        const button = createButton("Login");

        main.appendChild(button);

        function update() {
            const isUsernameValid = usernameInput.value.length > 0;
            const isPasswordValid = passwordInput.value.length > 0;

            button.disabled = !isUsernameValid || !isPasswordValid;
            usernameInput.ariaInvalid = isUsernameValid ? "false" : "true";
            passwordInput.ariaInvalid = isPasswordValid ? "false" : "true";
        }

        async function advance() {
            if (usernameInput.value.length === 0) {
                usernameInput.focus();
            } else if (passwordInput.value.length === 0) {
                passwordInput.focus();
            } else {
                button.disabled = true;
                try {
                    const configuration = await login(usernameInput.value, passwordInput.value);
                    localStorage["username"] = usernameInput.value;
                    showDateScreen({
                        username: usernameInput.value,
                        password: passwordInput.value,
                        configuration: configuration,
                    });
                } catch (e) {
                    alert(e);
                } finally {
                    button.disabled = false;
                }
            }
        }

        button.onclick = advance;

        [usernameInput, passwordInput].forEach(x => {
            x.addEventListener("change", update);
            x.addEventListener("input", update);

            x.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    advance();
                }
            });
        });

        showMain(main);

        update();

        if (usernameInput.value.length === 0) {
            usernameInput.focus();
        } else {
            passwordInput.focus();
        }
    }

    /**
     * @param {string} username
     * @param {string} password
     * @return {Promise<ShowConfiguration>}
     */
    async function login(username, password) {
        const res = await fetch(`${SERVER_URL}/login`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "X-Username": username,
                "X-Password": password,
            },
        });

        if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}: Authentication Failed`.trim());
        }

        return await res.json();
    }

    /**
     * @param {string} username
     * @param {string} password
     * @param {SubmissionRequest} request
     */
    async function submit(username, password, request) {
        const res = await fetch(`${SERVER_URL}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Username": username,
                "X-Password": password,
            },
            body: JSON.stringify(request),
        });

        if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}: Submission Failed`.trim());
        }
    }

    showLoginScreen();
})();
