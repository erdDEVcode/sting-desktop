module.exports = {
  branches: ["master"],
  ci: false,
  debug: false,
  plugins: [
    ["@semantic-release/commit-analyzer", {
      "preset": "angular",
      "releaseRules": [
        { "type": "docs", "release": "patch" },
        { "type": "build", "release": "patch" },
        { "type": "chore", "release": "patch" },
        { "type": "style", "release": "minor" },
        { "type": "refactor", "release": "minor" },
      ],
      "parserOpts": {
        "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES"]
      }
    }],
    "@semantic-release/npm",
    ["@semantic-release/release-notes-generator", {
      "preset": "angular",
      "writerOpts": {
        "commitsSort": ["scope", "subject"]
      },
    }],
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/exec", {
      "prepareCmd": "yarn build",
    }],
    ["@semantic-release/github", {
      "assets": [
        { "path": "out/make/**/*.deb" },
        { "path": "out/make/**/*.zip" },
        { "path": "out/make/**/*.dmg" },
      ],
    }],
  ]
}