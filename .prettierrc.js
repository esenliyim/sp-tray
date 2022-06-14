module.exports = {
    singleQuote: false,
    tabWidth: 4,
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "always",
    printWidth: 100,
    semi: true,
    overrides: [
        {
            files: ["*.md", "*.MD"],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
