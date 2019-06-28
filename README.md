# crossbrowsertesting.com automated tests

Runs a suite of automated tests against crossbrowsertesting.com

## Getting started

Install dependencies:

```
npm install
```

Create an `.env` file with the following values:

```
CI=true

CBT_USERNAME=example@example.com
CBT_AUTHKEY=yourkey

TEST_BASE_URL=https://example-test-url
TEST_USERNAME=someuser@example.com
TEST_PASSWORD=somepassword
```

Run tests

```
npm test
```


If you remove `CI=true` from the `.env` file this will run the tests locally using Safari on macOS which has `safaridriver` built-in.