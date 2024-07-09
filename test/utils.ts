import assert = require('assert');
import baretest = require('baretest');

type TestFunction = ReturnType<typeof baretest>;
type SkippedTestFunction = TestFunction['skip'];
type TestSuite = [TestFunction, SkippedTestFunction];

const tests: Array<TestFunction> = [];
let skipped = 0;

function createTestSuite(name: string): TestSuite {
    const test = baretest(name);
    const skip: SkippedTestFunction = () => {
        skipped++;
    };
    tests.push(test);
    return [test, skip];
}

async function runTests() {
    console.info = () => {};
    for (const test of tests) {
        await test.run();
    }
    console.log();
    console.log(`Skipped: ${skipped}`);
}

export { createTestSuite, runTests, assert };
