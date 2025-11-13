import * as vm from 'vm';

/**
 * STEP 1: Define the code to be run inside the sandbox.
 * This code block is a string and will be executed by the VM.
 * It accesses the global 'sandbox' object (which is defined in step 2) to store the result.
 */
const factorialCode: string = `
  const factorial = (n) => {
    if (n === 0 || n === 1) {
      return 1;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const numberToCalculate = 7; // The input for the factorial function
  
  // Store the result back onto the sandbox context for retrieval.
  // We reference 'sandbox' which is a global property pointing to contextObject.
  sandbox.result = factorial(numberToCalculate);
  sandbox.message = \`Factorial of \${numberToCalculate} is: \${sandbox.result}\`;

  // Log from inside the sandbox environment (using the passed-in console)
  console.log("--- Executed code inside VM ---");
  console.log(sandbox.message);
  console.log("-------------------------------");
`;

/**
 * STEP 2: Create a context object (the "outside world" data).
 * This object holds everything the sandboxed code can access or modify.
 */
const contextObject: any = {
  // Initial data fields
  result: 0,
  message: "Hello RK (from main.ts outside the sandbox, before run)",
  
  // Pass in the real console object so the sandboxed code can log output
  console: console, 
};

// CRITICAL FIX: To allow the sandboxed code to refer to the context object
// using a specific variable name (like 'sandbox'), we set a property on 
// the object that points back to itself.
contextObject.sandbox = contextObject; 

/**
 * STEP 3: Create a VM Context.
 * This makes the 'contextObject' the global scope inside the VM.
 */
const context = vm.createContext(contextObject);

/**
 * STEP 4: Run the Code in the Context and measure time.
 */
console.log(contextObject.message); // Print initial message

try {
  // 1. Record Start Time (using high-resolution time)
  const startTime = process.hrtime.bigint();

  // vm.runInContext executes the string of code inside the defined context
  vm.runInContext(factorialCode, context, {
    timeout: 1000, 
    displayErrors: true,
  });

  // 2. Record End Time
  const endTime = process.hrtime.bigint();
  
  // 3. Calculate duration in milliseconds (convert nanoseconds to ms)
  const durationMs = Number(endTime - startTime) / 1000000;

  // Retrieve the updated results from the context object
  console.log("\n--- Sandbox Execution Complete (in main.ts) ---");
  console.log(`Updated message: ${contextObject.message}`);
  console.log(`Final Result: ${contextObject.result}`);
  
  // 4. Print the execution time
  console.log(`Execution Time: ${durationMs.toFixed(3)} ms`);
  
} catch (error) {
  console.error("\nAn error occurred during sandbox execution:", error);
}

console.log("\nHello RK"); // Print the required start message after execution