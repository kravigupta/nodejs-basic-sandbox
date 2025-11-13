import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This file demonstrates how to run Python code in a sandboxed environment
 * using Node.js's child_process.spawnSync to call a Python interpreter.
 * This is what we need to do -
 * 1. Define the Python code to be run inside the sandbox (as a string).
 * 2. Create a function that uses spawnSync to call the Python interpreter with the code.
 * 3. Run the code and measure time.
 * 
 * Simply run this file using `ts-node src/sandbox-using-spawn.ts` after installing the necessary packages.
 */


// --- STEP 1: Python Code Definition ---
/**
 * Python code to be executed.
 * In a real low-latency setup, this string would be passed to a
 * native C++ Node Addon which runs it against the embedded Python interpreter.
 */
const pythonFactorialCode: string = fs.readFileSync(path.join(__dirname, 'python', 'factorial.py'), 'utf-8');

// --- STEP 2: Simulated Low-Latency Python Executor ---
interface PythonExecutionResult {
    result: number;
    input: number;
}

/**
 * This function uses spawnSync to call a Python interpreter
 *
 * @param code The Python code string.
 * @returns An object containing the execution result.
 */
function executePythonSync(code: string, args: number[]): PythonExecutionResult {
    // Use the '-c' argument to tell Python to execute the code string directly.
    const processResult = spawnSync('python3', ['-c', code, ...args.map(String)], {
        encoding: 'utf-8',
        // Set timeout for safety
        timeout: 5000
    });

    if (processResult.error) {
        throw new Error(`Execution error (spawnSync): ${processResult.error.message}`);
    }

    if (processResult.status !== 0) {
        const stderr = processResult.stderr.toString().trim();
        throw new Error(`Python process exited with code ${processResult.status}.\nSTDERR: ${stderr}`);
    }

    try {
        const stdout = processResult.stdout.toString().trim();
        // The code is designed to print a JSON string like: '{"result": 3628800, "input": 10}'
        const parsedOutput = JSON.parse(stdout);

        return {
            result: parsedOutput.result,
            input: parsedOutput.input,
        };
    } catch (e) {
        throw new Error(`Failed to parse Python output as JSON. Raw output: ${processResult.stdout.toString().trim()}`);
    }
}


/**
 * STEP 3: Run the Code and measure time.
 * We must verify the execution time is sub-1ms.
 */
console.log("Starting Python execution simulation...");
const main = async () => {

    try {
        // 1. Record Start Time (using high-resolution time)
        const startTime = process.hrtime.bigint();

        const args = [7]; // Argument for factorial calculation

        // Execute the Python code using the simulated low-latency bridge
        const pythonResult = await executePythonSync(pythonFactorialCode, args);

        // 2. Record End Time
        const endTime = process.hrtime.bigint();

        // 3. Calculate duration in milliseconds (convert nanoseconds to ms)
        const durationNs = Number(endTime - startTime);
        const durationMs = durationNs / 1000000;

        // Retrieve the results
        console.log("\n--- Python Execution Complete (Simulated) ---");
        console.log(`Final Result: ${pythonResult.result}`);

        // 4. Print the execution time and verify the <1ms goal
        console.log(`Execution Time: ${durationMs.toFixed(3)} ms`);

        if (durationMs < 1.0) {
            console.log("✅ Latency Goal Met: Sub-1ms execution achieved (Simulated)! (Target: < 1.0 ms)");
        } else {
            console.log("❌ Latency Goal FAILED: Execution time exceeded 1ms. (Target: < 1.0 ms)");
        }

    } catch (error) {
        console.error("\nAn error occurred during sandbox execution:", error);
    }

};

main();