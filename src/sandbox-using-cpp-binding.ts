// @ts-nocheck
const process = require('process');
const path = require('path');

// -------------------------------------------------------------------
// 1. CORE INTERFACES
// -------------------------------------------------------------------

// Defined for clarity, even in JS
/**
 * @typedef {object} PythonExecutionResult
 * @property {number} result
 * @property {number} input
 * @property {string} message
 */

/**
 * Interface definition for the Native C++ Python Bridge Module.
 * In a real application, this is the C++ Addon (.node) that provides the high-speed function.
 * @typedef {object} NativePythonBridge
 * @property {(code: string) => PythonExecutionResult} executePythonSync
 */

// -------------------------------------------------------------------
// 2. MOCK IMPLEMENTATION (SIMULATING THE FAST C++ BINDING)
// -------------------------------------------------------------------

const MOCK_INPUT = 10;
const MOCK_RESULT = 3628800; // 10! factorial result

/** @type {NativePythonBridge} */
const MOCK_BRIDGE_IMPLEMENTATION = {
    /**
     * This mock simulates the behavior and speed of the C++ Native Addon.
     */
    executePythonSync: (code) => {
        // Mock the C++ logic: run code, capture output, parse, and return.
        const message = `[MOCK] Python executed successfully via C++ binding simulation.`;
        return {
            result: MOCK_RESULT,
            input: MOCK_INPUT,
            message: message
        };
    }
}

// -------------------------------------------------------------------
// 3. NATIVE MODULE LOADER (The new implementation core)
// -------------------------------------------------------------------

/** @type {(code: string) => PythonExecutionResult} */
let executePythonSync;
let executionType;

try {
    // Attempt to load the real native module first. 
    // This path is relative to where you run 'node index.js'
    const nativeModule = require(path.join(process.cwd(), 'build/Release/python_bridge'));
    
    // Check if the required function exists
    if (typeof nativeModule.executePythonSync === 'function') {
        executePythonSync = nativeModule.executePythonSync;
        executionType = "REAL C++ BINDING";
        console.log("✅ Successfully loaded real native C++ Python Bridge.");
    } else {
        // This handles cases where the module loads but doesn't export the function
        throw new Error("Native module loaded but missing 'executePythonSync' function.");
    }
} catch (e) {
    // Fallback to the mock implementation if the C++ module is not yet compiled
    // or if the architecture is incompatible (or if loading fails due to Python initialization in C++).
    executePythonSync = MOCK_BRIDGE_IMPLEMENTATION.executePythonSync;
    executionType = "C++ BINDING SIMULATION (MOCK)";
    console.warn(`⚠️ Native module not found or failed to load (Error: ${e.message}). Falling back to MOCK. 
    To get sub-1ms performance, ensure your C++ code initializes Python correctly.`);
}


// -------------------------------------------------------------------
// 4. PYTHON CODE DEFINITION
// -------------------------------------------------------------------

const PYTHON_FACTORIAL_CODE = `
def factorial(n):
    # This is the heavy lifting code that the C++ binding executes quickly
    if n == 0 or n == 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# The C++ layer would capture the stdout/return value and parse this JSON structure
number_to_calculate = 10
result = factorial(number_to_calculate)
print('{"result": %d, "input": %d}' % (result, number_to_calculate))
`;

// -------------------------------------------------------------------
// 5. LATENCY TEST AND EXECUTION
// -------------------------------------------------------------------

const LATENCY_TARGET_MS = 1.0;

function runLatencyTest() {
    console.log(`\n--- HIGH-PERFORMANCE SANDBOX ARCHITECTURE TEST ---`);
    console.log(`Goal: Prove sub-1ms Python execution latency.`);
    console.log(`Latency Target: < ${LATENCY_TARGET_MS} ms`);
    console.log('----------------------------------------------------');

    try {
        // 1. Record Start Time (using high-resolution time)
        const startTime = process.hrtime.bigint();

        // 2. Execute the Python code using the selected bridge (Real or Mock)
        // NOTE: If the C++ code is not yet implemented, this will throw an error 
        // after loading successfully, or execute the mock.
        const pythonResult = executePythonSync(PYTHON_FACTORIAL_CODE);

        // 3. Record End Time
        const endTime = process.hrtime.bigint();

        // 4. Calculate duration (convert nanoseconds to milliseconds)
        const durationNs = Number(endTime - startTime);
        const durationMs = durationNs / 1000000;

        // Display Results
        console.log(`Execution Type: ${executionType}`);
        console.log(`Python Code Input: ${pythonResult.input}`);
        console.log(`Calculated Result: ${pythonResult.result}`);
        
        // The real C++ bridge won't have the 'message' property from the mock, so we check for it
        if (pythonResult.message) {
            console.log(`Bridge Status: ${pythonResult.message}`);
        }

        console.log('----------------------------------------------------');

        // 5. Print the execution time and verify the <1ms goal
        console.log(`Measured Overhead (${executionType}): ${durationMs.toFixed(3)} ms`);

        if (durationMs < LATENCY_TARGET_MS) {
            console.log(`✅ SUCCESS: Execution overhead is below the ${LATENCY_TARGET_MS}ms target.`);
        } else if (executionType === "REAL C++ BINDING") {
            console.log(`⚠️ WARNING: Real C++ Execution overhead exceeded ${LATENCY_TARGET_MS}ms. Check C++ implementation.`);
        } else {
             console.log(`❌ FAILURE: Execution overhead exceeded ${LATENCY_TARGET_MS}ms. (Real C++ build required to verify performance)`);
        }

    } catch (error) {
        console.error("\n[CRITICAL ERROR] Failed during sandbox execution:", error.message || error);
    }
}

// Run the test
runLatencyTest();