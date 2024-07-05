import assert from 'assert';
import baretest from 'baretest';

type TestFunction = ReturnType<typeof baretest>;
type SkippedTestFunction = TestFunction['skip'];

const tests: Array<TestFunction> = [];
let skipped = 0;

function createTestSuite(name: string) {
    const test = baretest(name);
    const skip: SkippedTestFunction = () => {
        skipped++;
    };
    tests.push(test);
    return [test, skip] as const;
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
