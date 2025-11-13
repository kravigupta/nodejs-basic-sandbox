import sys

# this code will run inside sandbox
# We will get a single argument 'a' from command line
# We will compute factorial of 'a' and print the result
a = int(sys.argv[1])

# compute factorial
result = 1
for i in range(1, a + 1):
    result *= i 
    
# print result
print(result)

# since it will be executed in a sandbox, we need to flush the output
sys.stdout.flush()
